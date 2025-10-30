import { Hono } from "hono";
import { db } from "@/db";
import { categories } from "@/db/schema";
import type { AppVariables } from "@/app/api/[[...route]]/route";

const app = new Hono<{
  Variables: AppVariables;
}>().get("/", async (c) => {
  const session = c.get("session");

  if (!session) {
    return c.json({ message: "Não autorizado" }, 401);
  }

  const data = await db.select().from(categories);

  return c.json({ data: data });
});

export default app;
