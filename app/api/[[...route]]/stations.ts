import { z } from "zod";
import { Hono } from "hono";
import { db } from "@/db";
import { zValidator } from "@hono/zod-validator";
import { stations } from "@/db/schema";
import type { AppVariables } from "@/app/api/[[...route]]/route";
import { eq, inArray } from "drizzle-orm";
import { createStationSchema, updateStationSchema } from "@/schemas";

const app = new Hono<{
  Variables: AppVariables;
}>()
  .get("/", async (c) => {
    const session = c.get("session");

    if (!session) {
      return c.json({ message: "Não autorizado" }, 401);
    }

    try {
      const data = await db.select().from(stations).orderBy(stations.name);

      return c.json({ data });
    } catch (error) {
      console.error("Erro ao buscar postos:", error);
      return c.json({ message: "Erro ao buscar os postos" }, 500);
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
        .from(stations)
        .where(eq(stations.id, id));

      if (!data) {
        return c.json({ message: "Posto não encontrado" }, 404);
      }

      return c.json({ data });
    } catch (error) {
      console.error("Erro ao buscar o posto:", error);
      return c.json({ message: "Erro ao buscar o posto" }, 500);
    }
  })
  .post("/", zValidator("json", createStationSchema), async (c) => {
    const session = c.get("session");
    const values = c.req.valid("json");

    if (!session) {
      return c.json({ message: "Não autorizado" }, 401);
    }

    try {
      const [data] = await db.insert(stations).values(values).returning();

      return c.json({ data });
    } catch (error) {
      console.error("Erro ao criar o posto:", error);
      return c.json({ message: "Erro ao criar o posto" }, 500);
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
          .delete(stations)
          .where(inArray(stations.id, values.ids));

        return c.json({ data });
      } catch (error) {
        console.error("Erro ao deletar postos:", error);
        return c.json({ message: "Erro ao deletar postos" }, 500);
      }
    }
  )
  .patch("/:id", zValidator("json", updateStationSchema), async (c) => {
    const session = c.get("session");
    const authUser = c.get("user");
    const { id } = c.req.param();
    const values = c.req.valid("json");

    if (!session || authUser?.role !== "admin") {
      return c.json({ message: "Não autorizado" }, 401);
    }

    try {
      const [data] = await db
        .update(stations)
        .set({
          name: values.name,
        })
        .where(eq(stations.id, id))
        .returning();

      if (!data) {
        return c.json({ message: "Posto não encontrado" }, 404);
      }

      return c.json({ data });
    } catch (error) {
      console.error("Erro ao atualizar o posto:", error);
      return c.json({ message: "Erro ao atualizar o posto" }, 500);
    }
  });

export default app;
