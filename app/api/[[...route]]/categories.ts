import { z } from "zod";
import { Hono } from "hono";
import { db } from "@/db";
import { zValidator } from "@hono/zod-validator";
import { categories } from "@/db/schema";
import type { AppVariables } from "@/app/api/[[...route]]/route";
import { eq, inArray } from "drizzle-orm";
import { createCategorySchema } from "@/schemas";

const app = new Hono<{
  Variables: AppVariables;
}>()
  .get("/", async (c) => {
    const session = c.get("session");

    if (!session) {
      return c.json({ message: "Não autorizado" }, 401);
    }

    try {
      const data = await db.select().from(categories).orderBy(categories.name);

      return c.json({ data });
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      return c.json({ message: "Erro ao buscar as categorias" }, 500);
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
        .from(categories)
        .where(eq(categories.id, id));

      if (!data) {
        return c.json({ message: "Categoria não encontrada" }, 404);
      }

      return c.json({ data });
    } catch (error) {
      console.error("Erro ao buscar a categoria:", error);
      return c.json({ message: "Erro ao buscar a categoria" }, 500);
    }
  })
  .post("/", zValidator("json", createCategorySchema), async (c) => {
    const session = c.get("session");
    const { name } = c.req.valid("json");

    if (!session) {
      return c.json({ message: "Não autorizado" }, 401);
    }

    try {
      const [data] = await db.insert(categories).values({ name }).returning();

      return c.json({ data });
    } catch (error) {
      console.error("Erro ao criar a categoria:", error);
      return c.json({ message: "Erro ao criar a categoria" }, 500);
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
      const values = c.req.valid("json");

      if (!session) {
        return c.json({ message: "Não autorizado" }, 401);
      }

      try {
        const data = await db
          .delete(categories)
          .where(inArray(categories.id, values.ids));

        return c.json({ data });
      } catch (error) {
        console.error("Erro ao deletar categorias:", error);
        return c.json({ message: "Erro ao deletar categorias" }, 500);
      }
    }
  );

export default app;
