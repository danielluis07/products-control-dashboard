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
import { eq, and, asc, ne, ilike, sql } from "drizzle-orm";
import { createInventoryItemSchema, logActivitySchema } from "@/schemas";

const app = new Hono<{
  Variables: AppVariables;
}>()
  /**
   * GET /
   * Lista todos os itens de inventário ATIVOS para o posto do gerente.
   */
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        search: z.string().optional(),
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("20"),
      })
    ),
    async (c) => {
      const session = c.get("session");
      const authUser = c.get("user");
      const { search, page, limit } = c.req.valid("query");

      if (!session || !authUser) {
        return c.json({ message: "Usuário não autenticado" }, 401);
      }

      if (!authUser.stationId) {
        return c.json(
          { message: "Usuário não está associado a nenhum posto" },
          400
        );
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      const whereConditions = [
        eq(inventoryItems.stationId, authUser.stationId),
        ne(inventoryItems.status, "empty"),
      ];

      if (search) {
        whereConditions.push(ilike(products.name, `%${search}%`));
      }

      try {
        // Busca os dados paginados
        const data = await db
          .select({
            id: inventoryItems.id,
            productId: inventoryItems.productId,
            stationId: inventoryItems.stationId,
            expiryDate: inventoryItems.expiryDate,
            initialQuantity: inventoryItems.initialQuantity,
            currentQuantity: inventoryItems.currentQuantity,
            addedAt: inventoryItems.addedAt,
            status: inventoryItems.status,
            productName: products.name,
            productBarcode: products.barcode,
            productImageUrl: products.imageUrl,
          })
          .from(inventoryItems)
          .leftJoin(products, eq(products.id, inventoryItems.productId))
          .where(and(...whereConditions))
          .orderBy(asc(inventoryItems.expiryDate))
          .limit(limitNum)
          .offset(offset);

        // Conta o total de itens (para saber se há mais páginas)
        const [totalResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(inventoryItems)
          .leftJoin(products, eq(products.id, inventoryItems.productId))
          .where(and(...whereConditions));

        const total = Number(totalResult.count);
        const hasMore = offset + data.length < total;

        return c.json({
          data,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            hasMore,
          },
        });
      } catch (error) {
        console.error("Erro ao buscar inventário:", error);
        return c.json({ message: "Erro ao buscar inventário" }, 500);
      }
    }
  )

  /**
   * GET /:id
   * Busca um item de inventário específico do posto do gerente,
   * incluindo seu produto e histórico de atividades.
   */
  .get("/:id", async (c) => {
    const session = c.get("session");
    const authUser = c.get("user");
    const { id } = c.req.param();

    if (!session || !authUser) {
      return c.json({ message: "Usuário não autenticado" }, 401);
    }

    if (!authUser.stationId) {
      return c.json(
        { message: "Usuário não está associado a nenhum posto" },
        400
      );
    }

    try {
      // 1. Busca o item de inventário principal
      const [item] = await db
        .select()
        .from(inventoryItems)
        .where(
          and(
            eq(inventoryItems.id, id),
            eq(inventoryItems.stationId, authUser.stationId)
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
   */
  .post("/", zValidator("json", createInventoryItemSchema), async (c) => {
    const session = c.get("session");
    const authUser = c.get("user");
    const values = c.req.valid("json");

    if (!session || !authUser) {
      return c.json({ message: "Usuário não autenticado" }, 401);
    }

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
   */
  .post("/:id/activity", zValidator("json", logActivitySchema), async (c) => {
    const session = c.get("session");
    const authUser = c.get("user");
    const inventoryItemId = c.req.param("id");
    const { action, quantity } = c.req.valid("json");

    if (!session || !authUser) {
      return c.json({ message: "Usuário não autenticado" }, 401);
    }

    try {
      const updatedItem = await db.transaction(async (tx) => {
        // 1. Pega o item atual e trava a linha
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
          .for("update");

        // 2. Verifica se o item existe - LANÇA ERRO para fazer rollback
        if (!item) {
          throw new Error("ITEM_NOT_FOUND");
        }

        // 3. Verifica se tem estoque suficiente - LANÇA ERRO para fazer rollback
        if (item.currentQuantity < quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${item.currentQuantity}`);
        }

        // 4. Registra o log de atividade
        await tx.insert(inventoryActivityLog).values({
          inventoryItemId: inventoryItemId,
          userId: authUser.id,
          action: action,
          quantityChange: -Math.abs(quantity),
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

        return updatedItem; // Retorna apenas o dado em caso de sucesso
      });

      return c.json({ data: updatedItem });
    } catch (error) {
      console.error("Erro ao registrar atividade:", error);

      // Tratamento específico dos erros de negócio
      if (error instanceof Error) {
        if (error.message === "ITEM_NOT_FOUND") {
          return c.json(
            {
              message:
                "Item de inventário não encontrado ou não pertence a este posto",
            },
            404
          );
        }

        if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
          const currentQty = error.message.split(":")[1];
          return c.json(
            {
              message: `Quantidade insuficiente em estoque. (Atual: ${currentQty})`,
            },
            400
          );
        }
      }

      return c.json({ message: "Erro ao registrar atividade" }, 500);
    }
  });

export default app;
