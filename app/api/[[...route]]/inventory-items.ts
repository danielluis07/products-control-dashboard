import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db";
import {
  inventoryItems,
  inventoryActivityLog,
  products,
  stations,
  categories,
  user,
} from "@/db/schema";
import type { AppVariables } from "@/app/api/[[...route]]/route";
import { eq, and, asc, ne, ilike, sql, inArray, gte, lte } from "drizzle-orm";
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
   * GET /
   * Lista todos os itens de inventário para todos os postos (apenas ADMIN).
   */
  .get(
    "/admin",
    zValidator(
      "query",
      z.object({
        search: z.string().optional(), // Busca por nome do produto
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("20"),
        stationIds: z.string().optional(), // Filtro por múltiplos postos (ex: "id1,id2,id3")
        categoryId: z.string().optional(), // Filtro por uma categoria
        status: z.string().optional(), // Filtro por status (ex: 'in_stock', 'expired')
        expiryFrom: z.string().optional(), // Data (ISO 8601)
        expiryTo: z.string().optional(), // Data (ISO 8601)
      })
    ),
    async (c) => {
      // 1. Autenticação e Autorização (Admin)
      const authUser = c.get("user");

      if (authUser?.role !== "admin") {
        return c.json({ message: "Não autorizado" }, 401);
      }

      // 2. Validar Parâmetros de Query
      const {
        search,
        page,
        limit,
        stationIds,
        categoryId,
        status,
        expiryFrom,
        expiryTo,
      } = c.req.valid("query");

      // 3. Paginação
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      // 4. Construção Dinâmica dos Filtros (Where)
      const whereConditions = [];

      // Filtro padrão: não mostrar itens 'empty'
      if (status) {
        whereConditions.push(eq(inventoryItems.status, status));
      }
      if (search) {
        whereConditions.push(ilike(products.name, `%${search}%`));
      }
      if (categoryId) {
        whereConditions.push(eq(products.categoryId, categoryId));
      }
      if (stationIds) {
        const ids = stationIds.split(",");
        if (ids.length > 0) {
          whereConditions.push(inArray(inventoryItems.stationId, ids));
        }
      }
      if (expiryFrom) {
        whereConditions.push(
          gte(inventoryItems.expiryDate, new Date(expiryFrom))
        );
      }
      if (expiryTo) {
        whereConditions.push(
          lte(inventoryItems.expiryDate, new Date(expiryTo))
        );
      }

      try {
        // 5. Query Principal (com todos os joins)
        const data = await db
          .select({
            id: inventoryItems.id,
            status: inventoryItems.status,
            currentQuantity: inventoryItems.currentQuantity,
            initialQuantity: inventoryItems.initialQuantity,
            expiryDate: inventoryItems.expiryDate,
            addedAt: inventoryItems.addedAt,
            // --- Dados dos JOINS ---
            productName: products.name,
            productBarcode: products.barcode,
            stationName: stations.name,
            categoryName: categories.name,
            addedBy: user.name,
          })
          .from(inventoryItems)
          .leftJoin(products, eq(products.id, inventoryItems.productId))
          .leftJoin(stations, eq(stations.id, inventoryItems.stationId))
          .leftJoin(categories, eq(categories.id, products.categoryId))
          .leftJoin(user, eq(user.id, inventoryItems.addedByUserId))
          .where(and(...whereConditions))
          .orderBy(asc(inventoryItems.expiryDate))
          .limit(limitNum)
          .offset(offset);

        // 6. Query de Contagem (para paginação)
        const [totalResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(inventoryItems)
          .leftJoin(products, eq(products.id, inventoryItems.productId))
          .leftJoin(categories, eq(categories.id, products.categoryId))
          .where(and(...whereConditions));

        const total = Number(totalResult.count);
        const totalPages = Math.ceil(total / limitNum);

        // 7. Retorno
        return c.json({
          data,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
          },
        });
      } catch (error) {
        console.error("Erro ao buscar inventário de admin:", error);
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
   * POST /
   * Delete um ou mais lotes de produto ao inventário.
   */
  .post(
    "/delete",
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      })
    ),
    async (c) => {
      const session = c.get("session");
      const authUser = c.get("user");
      const { ids } = c.req.valid("json");

      if (!session || !authUser) {
        return c.json({ message: "Usuário não autenticado" }, 401);
      }

      if (!authUser.stationId) {
        return c.json(
          { message: "Usuário não está associado a nenhum posto" },
          400
        );
      }

      if (ids.length === 0) {
        return c.json({ message: "Nenhum ID fornecido para exclusão" }, 400);
      }

      try {
        const data = await db
          .delete(inventoryItems)
          .where(
            and(
              eq(inventoryItems.stationId, authUser.stationId),
              inArray(inventoryItems.id, ids)
            )
          )
          .returning();

        if (data.length === 0) {
          return c.json(
            { message: "Nenhum item encontrado para deletar" },
            404
          );
        }

        return c.json({ data });
      } catch (error) {
        console.error("Erro ao deletar itens do inventário:", error);
        return c.json({ message: "Erro ao deletar itens do inventário" }, 500);
      }
    }
  )
  /**
   * POST /
   * Delete um ou mais lotes de produto ao inventário.
   */
  .post(
    "/admin/delete",
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      })
    ),
    async (c) => {
      const session = c.get("session");
      const authUser = c.get("user");
      const { ids } = c.req.valid("json");

      if (!session || !authUser || authUser.role !== "admin") {
        return c.json({ message: "Usuário não autenticado" }, 401);
      }

      if (ids.length === 0) {
        return c.json({ message: "Nenhum ID fornecido para exclusão" }, 400);
      }

      try {
        const data = await db
          .delete(inventoryItems)
          .where(inArray(inventoryItems.id, ids))
          .returning();

        if (data.length === 0) {
          return c.json(
            { message: "Nenhum item encontrado para deletar" },
            404
          );
        }

        return c.json({ data });
      } catch (error) {
        console.error("Erro ao deletar itens do inventário:", error);
        return c.json({ message: "Erro ao deletar itens do inventário" }, 500);
      }
    }
  )
  /**
   * POST /:id/activity
   * Registra uma atividade em um lote (venda, remoção, etc.)
   */
  .post("/:id/activity", zValidator("json", logActivitySchema), async (c) => {
    const session = c.get("session");
    const authUser = c.get("user");
    const inventoryItemId = c.req.param("id");
    const { action, quantity } = c.req.valid("json");

    // 1. Autenticação (Apenas Admin pode mexer no estoque manualmente)
    if (!session || !authUser) {
      return c.json({ message: "Não autorizado" }, 401);
    }

    try {
      const updatedItem = await db.transaction(async (tx) => {
        // ---------------------------------------------------------
        // PASSO 1: Buscar o Item com TRAVA DE BANCO (Row Locking)
        // ---------------------------------------------------------
        const [item] = await tx
          .select({
            currentQuantity: inventoryItems.currentQuantity,
            status: inventoryItems.status, // Necessário para a lógica de status
          })
          .from(inventoryItems)
          .where(
            and(
              eq(inventoryItems.id, inventoryItemId),
              eq(inventoryItems.stationId, authUser.stationId!)
            )
          )
          .for("update"); // <--- CRUCIAL: Impede condição de corrida

        if (!item) {
          throw new Error("ITEM_NOT_FOUND");
        }

        // ---------------------------------------------------------
        // PASSO 2: Definir Matemática (Soma ou Subtração?)
        // ---------------------------------------------------------
        // Se a ação for 'restock', é uma entrada (+). O resto é saída (-).
        const isAddition = action === "restock";

        // Define o valor real para o banco (ex: 10 ou -10)
        const quantityChange = isAddition
          ? Math.abs(quantity)
          : -Math.abs(quantity);

        // ---------------------------------------------------------
        // PASSO 3: Validação de Estoque Negativo
        // ---------------------------------------------------------
        // Só validamos saldo se for uma SAÍDA.
        // (Adicionar estoque nunca gera erro de saldo insuficiente)
        if (!isAddition && item.currentQuantity < Math.abs(quantityChange)) {
          throw new Error(`INSUFFICIENT_STOCK:${item.currentQuantity}`);
        }

        // ---------------------------------------------------------
        // PASSO 4: Registrar Log de Auditoria
        // ---------------------------------------------------------
        await tx.insert(inventoryActivityLog).values({
          inventoryItemId: inventoryItemId,
          userId: authUser.id,
          action: action,
          quantityChange: quantityChange, // Grava +10 ou -10
          timestamp: new Date(),
        });

        // ---------------------------------------------------------
        // PASSO 5: Calcular Novo Estado
        // ---------------------------------------------------------
        const newQuantity = item.currentQuantity + quantityChange;

        // Lógica inteligente de Status:
        let newStatus = item.status; // Padrão: mantém o status atual (ex: 'expired' continua 'expired')

        if (newQuantity === 0) {
          // Se zerou, vira 'empty' independente do que era antes
          newStatus = "empty";
        } else if (item.status === "empty" && newQuantity > 0) {
          // Se estava vazio e encheu, vira 'in_stock'
          newStatus = "in_stock";
        }
        // Nota: Se o status era 'expired' e adicionamos itens, ele CONTINUA 'expired'.
        // Isso é correto: misturar produto novo com vencido contamina o lote.

        // ---------------------------------------------------------
        // PASSO 6: Atualizar Item
        // ---------------------------------------------------------
        const [updatedItem] = await tx
          .update(inventoryItems)
          .set({
            currentQuantity: newQuantity,
            status: newStatus,
          })
          .where(eq(inventoryItems.id, inventoryItemId))
          .returning();

        return updatedItem;
      });

      return c.json({ data: updatedItem });
    } catch (error) {
      console.error("Erro na transação de inventário:", error);

      // Tratamento de Erros de Negócio
      if (error instanceof Error) {
        if (error.message === "ITEM_NOT_FOUND") {
          return c.json({ message: "Item não encontrado." }, 404);
        }
        if (error.message.startsWith("INSUFFICIENT_STOCK")) {
          const current = error.message.split(":")[1];
          return c.json(
            {
              message: `Estoque insuficiente para realizar a baixa. Atual: ${current}`,
            },
            400
          );
        }
      }

      return c.json({ message: "Erro interno ao processar estoque." }, 500);
    }
  })
  .post(
    "/:id/activity/admin",
    zValidator("json", logActivitySchema),
    async (c) => {
      const session = c.get("session");
      const authUser = c.get("user");
      const inventoryItemId = c.req.param("id");
      const { action, quantity } = c.req.valid("json");

      // 1. Autenticação (Apenas Admin pode mexer no estoque manualmente)
      if (!session || authUser?.role !== "admin") {
        return c.json({ message: "Não autorizado" }, 401);
      }

      try {
        const updatedItem = await db.transaction(async (tx) => {
          // ---------------------------------------------------------
          // PASSO 1: Buscar o Item com TRAVA DE BANCO (Row Locking)
          // ---------------------------------------------------------
          const [item] = await tx
            .select({
              currentQuantity: inventoryItems.currentQuantity,
              status: inventoryItems.status, // Necessário para a lógica de status
            })
            .from(inventoryItems)
            .where(eq(inventoryItems.id, inventoryItemId))
            .for("update"); // <--- CRUCIAL: Impede condição de corrida

          if (!item) {
            throw new Error("ITEM_NOT_FOUND");
          }

          // ---------------------------------------------------------
          // PASSO 2: Definir Matemática (Soma ou Subtração?)
          // ---------------------------------------------------------
          // Se a ação for 'restock', é uma entrada (+). O resto é saída (-).
          const isAddition = action === "restock";

          // Define o valor real para o banco (ex: 10 ou -10)
          const quantityChange = isAddition
            ? Math.abs(quantity)
            : -Math.abs(quantity);

          // ---------------------------------------------------------
          // PASSO 3: Validação de Estoque Negativo
          // ---------------------------------------------------------
          // Só validamos saldo se for uma SAÍDA.
          // (Adicionar estoque nunca gera erro de saldo insuficiente)
          if (!isAddition && item.currentQuantity < Math.abs(quantityChange)) {
            throw new Error(`INSUFFICIENT_STOCK:${item.currentQuantity}`);
          }

          // ---------------------------------------------------------
          // PASSO 4: Registrar Log de Auditoria
          // ---------------------------------------------------------
          await tx.insert(inventoryActivityLog).values({
            inventoryItemId: inventoryItemId,
            userId: authUser.id,
            action: action,
            quantityChange: quantityChange, // Grava +10 ou -10
            timestamp: new Date(),
          });

          // ---------------------------------------------------------
          // PASSO 5: Calcular Novo Estado
          // ---------------------------------------------------------
          const newQuantity = item.currentQuantity + quantityChange;

          // Lógica inteligente de Status:
          let newStatus = item.status; // Padrão: mantém o status atual (ex: 'expired' continua 'expired')

          if (newQuantity === 0) {
            // Se zerou, vira 'empty' independente do que era antes
            newStatus = "empty";
          } else if (item.status === "empty" && newQuantity > 0) {
            // Se estava vazio e encheu, vira 'in_stock'
            newStatus = "in_stock";
          }
          // Nota: Se o status era 'expired' e adicionamos itens, ele CONTINUA 'expired'.
          // Isso é correto: misturar produto novo com vencido contamina o lote.

          // ---------------------------------------------------------
          // PASSO 6: Atualizar Item
          // ---------------------------------------------------------
          const [updatedItem] = await tx
            .update(inventoryItems)
            .set({
              currentQuantity: newQuantity,
              status: newStatus,
            })
            .where(eq(inventoryItems.id, inventoryItemId))
            .returning();

          return updatedItem;
        });

        return c.json({ data: updatedItem });
      } catch (error) {
        console.error("Erro na transação de inventário:", error);

        // Tratamento de Erros de Negócio
        if (error instanceof Error) {
          if (error.message === "ITEM_NOT_FOUND") {
            return c.json({ message: "Item não encontrado." }, 404);
          }
          if (error.message.startsWith("INSUFFICIENT_STOCK")) {
            const current = error.message.split(":")[1];
            return c.json(
              {
                message: `Estoque insuficiente para realizar a baixa. Atual: ${current}`,
              },
              400
            );
          }
        }

        return c.json({ message: "Erro interno ao processar estoque." }, 500);
      }
    }
  );

export default app;
