import { auth } from "@/lib/auth";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import stations from "@/app/api/[[...route]]/stations";
import categories from "@/app/api/[[...route]]/categories";
import users from "@/app/api/[[...route]]/users";
import products from "@/app/api/[[...route]]/products";
import inventoryItems from "@/app/api/[[...route]]/inventory-items";

export type AppVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const app = new Hono<{
  Variables: AppVariables;
}>().basePath("/api");

// Auth handler FIRST - before session middleware
app.on(["POST", "GET"], "/auth/**", (c) => {
  console.log("Auth route accessed");
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

const _routes = app
  .route("/categories", categories)
  .route("/stations", stations)
  .route("/users", users)
  .route("/products", products)
  .route("/inventory-items", inventoryItems);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof _routes;
