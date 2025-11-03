import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db";
import {
  inventoryItems,
  inventoryActivityLog,
  products,
  user,
} from "@/db/schema";
import type { AppVariables } from "@/app/api/[[...route]]/route";
import { eq, and, asc, ne } from "drizzle-orm";
import { createInventoryItemSchema, logActivitySchema } from "@/schemas";

const app = new Hono<{
  Variables: AppVariables;
}>()
  /**
   * GET /
   * Lista todos os itens de inventário ATIVOS para o posto do gerente.
   * (Refatorado para sintaxe SQL-style)
   */
  .get("/", async (c) => {
    const session = c.get("session");
    const authUser = c.get("user");

    if (!session || !authUser) {
      return c.json({ message: "Usuário não autenticado" }, 401);
    }

    try {
      const data = await db
        .select({
          // Campos de inventoryItems
          id: inventoryItems.id,
          productId: inventoryItems.productId,
          stationId: inventoryItems.stationId,
          expiryDate: inventoryItems.expiryDate,
          initialQuantity: inventoryItems.initialQuantity,
          currentQuantity: inventoryItems.currentQuantity,
          addedAt: inventoryItems.addedAt,
          status: inventoryItems.status,
          // Campos de products (via join)
          productName: products.name,
          productBarcode: products.barcode,
          productImageUrl: products.imageUrl,
        })
        .from(inventoryItems)
        .leftJoin(products, eq(products.id, inventoryItems.productId))
        .where(
          and(
            eq(inventoryItems.stationId, authUser.stationId!),
            ne(inventoryItems.status, "empty")
          )
        )
        .orderBy(asc(inventoryItems.expiryDate));

      return c.json({ data });
    } catch (error) {
      console.error("Erro ao buscar inventário:", error);
      return c.json({ message: "Erro ao buscar inventário" }, 500);
    }
  })

  /**
   * GET /:id
   * Busca um item de inventário específico do posto do gerente,
   * incluindo seu produto e histórico de atividades.
   * (Refatorado para sintaxe SQL-style com múltiplas queries)
   */
  .get("/:id", async (c) => {
    const authUser = c.get("user")!;
    const { id } = c.req.param();

    try {
      // 1. Busca o item de inventário principal
      const [item] = await db
        .select()
        .from(inventoryItems)
        .where(
          and(
            eq(inventoryItems.id, id),
            eq(inventoryItems.stationId, authUser.stationId!)
          )
        );

      if (!item) {
        return c.json({ message: "Item de inventário não encontrado" }, 404);
      }

      // 2. Busca o produto associado (do catálogo)
      const [productData] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId));

      // 3. Busca os logs de atividade, fazendo join com o usuário que realizou a ação
      const logsData = await db
        .select({
          id: inventoryActivityLog.id,
          action: inventoryActivityLog.action,
          quantityChange: inventoryActivityLog.quantityChange,
          timestamp: inventoryActivityLog.timestamp,
          userName: user.name, // Nome do usuário que fez o log
        })
        .from(inventoryActivityLog)
        .leftJoin(user, eq(user.id, inventoryActivityLog.userId))
        .where(eq(inventoryActivityLog.inventoryItemId, id))
        .orderBy(asc(inventoryActivityLog.timestamp));

      // 4. Combina tudo em um único objeto de resposta
      const data = {
        ...item,
        product: productData || null,
        activityLogs: logsData,
      };

      return c.json({ data });
    } catch (error) {
      console.error("Erro ao buscar item de inventário:", error);
      return c.json({ message: "Erro ao buscar item de inventário" }, 500);
    }
  })

  /**
   * POST /
   * Adiciona um novo lote de produto ao inventário.
   * (Sintaxe já era SQL-style)
   */
  .post("/", zValidator("json", createInventoryItemSchema), async (c) => {
    const authUser = c.get("user")!;
    const values = c.req.valid("json");

    try {
      const [data] = await db
        .insert(inventoryItems)
        .values({
          productId: values.productId,
          stationId: authUser.stationId!,
          expiryDate: values.expiryDate,
          initialQuantity: values.initialQuantity,
          currentQuantity: values.initialQuantity,
          addedByUserId: authUser.id,
          status: "in_stock",
        })
        .returning();

      return c.json({ data }, 201);
    } catch (error) {
      console.error("Erro ao adicionar item ao inventário:", error);
      return c.json({ message: "Erro ao adicionar item ao inventário" }, 500);
    }
  })

  /**
   * POST /:id/activity
   * Registra uma atividade em um lote (venda, remoção, etc.)
   * (Sintaxe já era SQL-style, usando a transação)
   */
  .post("/:id/activity", zValidator("json", logActivitySchema), async (c) => {
    const authUser = c.get("user")!;
    const inventoryItemId = c.req.param("id");
    const { action, quantity } = c.req.valid("json");

    try {
      const data = await db.transaction(async (tx) => {
        // 1. Pega o item atual e trava a linha (para PostgreSQL)
        const [item] = await tx
          .select({
            currentQuantity: inventoryItems.currentQuantity,
          })
          .from(inventoryItems)
          .where(
            and(
              eq(inventoryItems.id, inventoryItemId),
              eq(inventoryItems.stationId, authUser.stationId!)
            )
          )
          .for("update"); // Trava a linha para evitar concorrência

        // 2. Verifica se o item existe
        if (!item) {
          tx.rollback();
          return {
            error:
              "Item de inventário não encontrado ou não pertence a este posto",
            status: 404,
          };
        }

        // 3. Verifica se tem estoque suficiente
        if (item.currentQuantity < quantity) {
          tx.rollback();
          return {
            error: `Quantidade insuficiente em estoque. (Atual: ${item.currentQuantity})`,
            status: 400,
          };
        }

        // 4. Registra o log de atividade
        await tx.insert(inventoryActivityLog).values({
          inventoryItemId: inventoryItemId,
          userId: authUser.id,
          action: action,
          quantityChange: -Math.abs(quantity), // Garante que é negativo
        });

        // 5. Atualiza a quantidade do lote
        const newQuantity = item.currentQuantity - quantity;
        const newStatus = newQuantity === 0 ? "empty" : "in_stock";

        const [updatedItem] = await tx
          .update(inventoryItems)
          .set({
            currentQuantity: newQuantity,
            status: newStatus,
          })
          .where(eq(inventoryItems.id, inventoryItemId))
          .returning();

        return { data: updatedItem };
      });

      // Retorna o resultado da transação
      if (data.error) {
        return c.json({ message: data.error });
      }

      return c.json({ data: data.data });
    } catch (error) {
      console.error("Erro ao registrar atividade:", error);
      return c.json({ message: "Erro ao registrar atividade" }, 500);
    }
  });

export default app;
