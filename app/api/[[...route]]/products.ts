import { z } from "zod";
import { Hono } from "hono";
import { db } from "@/db";
import { zValidator } from "@hono/zod-validator";
import { categories, products } from "@/db/schema";
import type { AppVariables } from "@/app/api/[[...route]]/route";
import { eq, inArray } from "drizzle-orm";
import { createProductSchema, updateProductSchema } from "@/schemas";

const app = new Hono<{
  Variables: AppVariables;
}>()
  .get("/", async (c) => {
    const session = c.get("session");
    const { barcode } = c.req.query();

    if (!session) {
      return c.json({ message: "Não autorizado" }, 401);
    }

    if (barcode) {
      try {
        const [data] = await db
          .select()
          .from(products)
          .where(eq(products.barcode, barcode));

        if (!data) {
          return c.json({ message: "Produto não encontrado no catálogo" }, 404);
        }

        return c.json({ data });
      } catch (error) {
        console.error("Erro ao buscar produto por barcode:", error);
        return c.json({ message: "Erro ao buscar o produto" }, 500);
      }
    }

    try {
      const data = await db
        .select({
          id: products.id,
          name: products.name,
          categoryId: products.categoryId,
          categoryName: categories.name,
          barcode: products.barcode,
          notificationThresholdDays: products.notificationThresholdDays,
          description: products.description,
          imageUrl: products.imageUrl,
        })
        .from(products)
        .leftJoin(categories, eq(categories.id, products.categoryId))
        .orderBy(products.name);

      return c.json({ data });
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return c.json({ message: "Erro ao buscar os produtos" }, 500);
    }
  })

  .get("/:id", async (c) => {
    const session = c.get("session");
    const { id } = c.req.param();

    if (!session) {
      return c.json({ message: "Não autorizado" }, 401);
    }

    try {
      const [data] = await db
        .select()
        .from(products)
        .where(eq(products.id, id));

      if (!data) {
        return c.json({ message: "Produto não encontrado" }, 404);
      }

      return c.json({ data });
    } catch (error) {
      console.error("Erro ao buscar o produto:", error);
      return c.json({ message: "Erro ao buscar o produto" }, 500);
    }
  })
  .post("/", zValidator("json", createProductSchema), async (c) => {
    const session = c.get("session");
    const authUser = c.get("user");
    const values = c.req.valid("json");

    if (!session || authUser?.role !== "admin") {
      return c.json({ message: "Não autorizado" }, 401);
    }

    try {
      const [data] = await db.insert(products).values(values).returning();

      return c.json({ data });
    } catch (error) {
      console.error("Erro ao criar o produto:", error);
      return c.json({ message: "Erro ao criar o produto" }, 500);
    }
  })
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
      const values = c.req.valid("json");

      if (!session || authUser?.role !== "admin") {
        return c.json({ message: "Não autorizado" }, 401);
      }

      try {
        const data = await db
          .delete(products)
          .where(inArray(products.id, values.ids));

        return c.json({ data });
      } catch (error) {
        console.error("Erro ao deletar produtos:", error);
        return c.json({ message: "Erro ao deletar produtos" }, 500);
      }
    }
  )
  .patch("/:id", zValidator("json", updateProductSchema), async (c) => {
    const session = c.get("session");
    const authUser = c.get("user");
    const { id } = c.req.param();
    const values = c.req.valid("json");

    if (!session || authUser?.role !== "admin") {
      return c.json({ message: "Não autorizado" }, 401);
    }

    try {
      const [data] = await db
        .update(products)
        .set(values)
        .where(eq(products.id, id))
        .returning();

      if (!data) {
        return c.json({ message: "Produto não encontrado" }, 404);
      }

      return c.json({ data });
    } catch (error) {
      console.error("Erro ao atualizar o produto:", error);
      return c.json({ message: "Erro ao atualizar o produto" }, 500);
    }
  });

export default app;
