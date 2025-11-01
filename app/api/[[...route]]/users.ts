import { z } from "zod";
import { Hono } from "hono";
import { db } from "@/db";
import { zValidator } from "@hono/zod-validator";
import { user } from "@/db/schema";
import type { AppVariables } from "@/app/api/[[...route]]/route";
import { eq, ne, inArray } from "drizzle-orm";

const app = new Hono<{
  Variables: AppVariables;
}>()
  .get("/", async (c) => {
    const session = c.get("session");
    const authUser = c.get("user");

    if (!session || authUser?.role !== "admin") {
      return c.json({ message: "Não autorizado" }, 401);
    }

    try {
      const data = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          stationId: user.stationId,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(ne(user.role, "admin"))
        .orderBy(user.name);

      return c.json({ data });
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return c.json({ message: "Erro ao buscar os usuários" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const session = c.get("session");
    const authUser = c.get("user");
    const { id } = c.req.param();

    if (!session || authUser?.role !== "admin") {
      return c.json({ message: "Não autorizado" }, 401);
    }

    try {
      const [data] = await db.select().from(user).where(eq(user.id, id));

      if (!data) {
        return c.json({ message: "Usuário não encontrado" }, 404);
      }

      return c.json({ data });
    } catch (error) {
      console.error("Erro ao buscar o usuário:", error);
      return c.json({ message: "Erro ao buscar o usuário" }, 500);
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
        const data = await db.delete(user).where(inArray(user.id, values.ids));

        return c.json({ data });
      } catch (error) {
        console.error("Erro ao deletar usuários:", error);
        return c.json({ message: "Erro ao deletar usuários" }, 500);
      }
    }
  );

export default app;
