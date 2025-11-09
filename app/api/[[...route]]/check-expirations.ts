import { Resend } from "resend";
import { Hono } from "hono";
import { db } from "@/db";
import {
  inventoryItems,
  products,
  stations,
  user,
  notifications,
} from "@/db/schema";
import type { AppVariables } from "@/app/api/[[...route]]/route";
import { eq, lt, and, sql, notExists } from "drizzle-orm";
import { EmailTemplate } from "@/components/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export type ItemToNotify = {
  inventoryItemId: string;
  productName: string;
  quantity: number;
  expiryDate: string;
  managerEmail: string;
  managerName: string | null;
  managerId: string;
  stationId: string;
};

const app = new Hono<{
  Variables: AppVariables;
}>().post("/", async (c) => {
  // -----------------------------------------------------------------
  // PONTO 1: Autenticação
  // -----------------------------------------------------------------
  const authHeader = c.req.header("Authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log("Falha de autenticação no Cron Job");
    return c.json({ message: "Não autorizado" }, 401);
  }

  // -----------------------------------------------------------------
  // PONTO 2: A Query
  // -----------------------------------------------------------------
  let itemsToNotify: ItemToNotify[] = [];
  try {
    itemsToNotify = await db
      .select({
        inventoryItemId: inventoryItems.id,
        productName: products.name,
        quantity: inventoryItems.currentQuantity,
        expiryDate: sql<string>`${inventoryItems.expiryDate}::text`,
        managerEmail: user.email,
        managerName: user.name,
        managerId: user.id, // Para a tabela 'notifications'
        stationId: stations.id, // Para a tabela 'notifications'
      })
      .from(inventoryItems)
      .innerJoin(products, eq(inventoryItems.productId, products.id))
      .innerJoin(stations, eq(inventoryItems.stationId, stations.id))
      .innerJoin(user, eq(user.stationId, stations.id))
      .where(
        and(
          // Condição 1: Apenas itens em estoque
          eq(inventoryItems.status, "in_stock"), // Usando seu campo 'status'

          // Condição 2: Dentro da janela de alerta
          lt(
            inventoryItems.expiryDate,
            sql`now() + (products.notification_threshold_days * interval '1 day')`
          ),

          // Condição 3: Apenas o gerente daquele posto
          // !!! VERIFIQUE ESTE VALOR 'manager' com seu enum !!!
          eq(user.role, "user"),

          // Condição 4 (CRÍTICA): E para o qual NENHUMA notificação foi enviada ainda.
          notExists(
            db
              .select()
              .from(notifications)
              .where(eq(notifications.inventoryItemId, inventoryItems.id))
          )
        )
      );

    if (!itemsToNotify.length) {
      return c.json({ message: "Nenhum item novo para notificar hoje." });
    }
  } catch (dbError) {
    console.error("Erro ao buscar itens no DB:", dbError);
    return c.json({ error: "Falha ao consultar banco de dados" }, 500);
  }

  // -----------------------------------------------------------------
  // PONTO 3: Inserir na tabela Notifications
  // -----------------------------------------------------------------

  // Mapeia os itens para o formato da tabela 'notifications'
  const newNotifications = itemsToNotify.map((item) => ({
    inventoryItemId: item.inventoryItemId,
    userId: item.managerId,
    stationId: item.stationId,
    // TODO: Criar uma mensagem mais dinâmica aqui
    message: `Produto "${item.productName}" (${item.quantity}un) está próximo do vencimento.`,
  }));

  try {
    if (newNotifications.length > 0) {
      await db.insert(notifications).values(newNotifications);
    }
  } catch (dbInsertError) {
    console.error("Erro ao inserir notificações no DB:", dbInsertError);
  }

  // -----------------------------------------------------------------
  // PONTO 4: Agrupar e Enviar E-mails
  // -----------------------------------------------------------------

  // Agrupar os *novos* itens por gerente
  const itemsByManager = itemsToNotify.reduce(
    (acc, item) => {
      const email = item.managerEmail;
      if (!acc[email]) {
        acc[email] = {
          managerName: item.managerName || "Gerente",
          items: [],
        };
      }
      acc[email].items.push(item);
      return acc;
    },
    {} as Record<
      string,
      {
        managerName: string;
        items: Omit<
          ItemToNotify,
          "managerEmail" | "managerName" | "managerId" | "stationId"
        >[];
      }
    >
  );

  let sentEmails = 0;
  let failedEmails = 0;
  let adminEmailStatus: string = "não configurado";

  // Enviar e-mail para cada gerente (APENAS SOBRE OS ITENS NOVOS)
  for (const [email, data] of Object.entries(itemsByManager)) {
    const { managerName, items } = data;

    try {
      await resend.emails.send({
        from: "Alertas <alertas@gasfortcontagem.online>",
        to: [email],
        subject: `Alerta: Você tem ${items.length} novos lotes próximos do vencimento!`,
        react: EmailTemplate({
          firstName: managerName,
          // @ts-expect-error - Adaptar 'items' para o que o EmailTemplate espera
          items: items,
        }),
      });
      sentEmails++;
    } catch (emailError) {
      console.error(`Falha ao enviar e-mail para ${email}:`, emailError);
      failedEmails++;
    }
  }

  // -----------------------------------------------------------------
  // PONTO 5: Enviar E-mail de Resumo para o ADMIN
  // -----------------------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL;

  if (adminEmail && itemsToNotify.length > 0) {
    try {
      await resend.emails.send({
        from: "Alertas <alertas@gasfortcontagem.online>",
        to: [adminEmail],
        subject: `Resumo Diário: ${itemsToNotify.length} novos itens próximos do vencimento`,
        react: EmailTemplate({
          firstName: "Admin",
          items: itemsToNotify, // Envia TODOS os itens
          isGlobalAdminSummary: true,
        }),
      });
      adminEmailStatus = "enviado";
    } catch (adminEmailError) {
      console.error(
        `Falha ao enviar e-mail para ADMIN ${adminEmail}:`,
        adminEmailError
      );
      adminEmailStatus = "falhou";
    }
  }

  return c.json({
    message: "Verificação de vencimentos concluída.",
    novasNotificacoesCriadas: newNotifications.length,
    sentEmails,
    failedEmails,
    adminEmailStatus,
  });
});

export default app;
