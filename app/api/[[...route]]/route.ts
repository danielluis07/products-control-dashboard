import { auth } from "@/lib/auth";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import categories from "@/app/api/[[...route]]/categories";

export type AppVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const app = new Hono<{
  Variables: AppVariables;
}>().basePath("/api");

// Auth handler FIRST - before session middleware
app.on(["POST", "GET"], "/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

// Session middleware for all other routes
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }
  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

const routes = app.route("/categories", categories);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
