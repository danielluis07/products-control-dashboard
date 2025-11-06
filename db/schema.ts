import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

// --- ENUMS ---

// Define as permissões/cargos dos usuários
export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);

// Define as ações que podem ser registradas para um item de inventário
export const activityActionEnum = pgEnum("activity_action", [
  "sold", // Item foi vendido
  "removed_expired", // Item removido por vencimento
  "removed_manual", // Item removido manualmente (dano, perda, etc.)
]);

// --- TABELAS DE AUTENTICAÇÃO E USUÁRIO ---

export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("admin"),
  banned: boolean("banned").notNull().default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  stationId: text("station_id").references(() => stations.id),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const jwks = pgTable("jwks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  publicKey: text("public_key"),
  privateKey: text("private_key"),
  createdAt: timestamp("created_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  impersonatedBy: text("impersonated_by"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

// Tabela para os postos de combustível
export const stations = pgTable("stations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  address: text("address"), // Endereço do posto
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Tabela para as Categorias de Produtos (Bebidas, Lubrificantes, Snacks, etc.)
// Assumindo que as categorias são globais para todos os postos
export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  description: text("description"),
});

// Tabela para o "Catálogo" de produtos
// Define o *tipo* de produto (ex: Coca-Cola 500ml), não o item físico
export const products = pgTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(), // Ex: "Coca-Cola Lata 350ml"
  barcode: text("barcode").unique(), // Código de barras (SKU/EAN)
  description: text("description"),
  imageUrl: text("image_url"),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }), // A qual categoria pertence
  // Dias de antecedência para notificar sobre o vencimento
  // Ex: 7 dias para bebidas, 30 dias para óleos
  notificationThresholdDays: integer("notification_threshold_days")
    .notNull()
    .default(7),
});

// Tabela de Itens de Inventário (O CORAÇÃO DO SISTEMA)
// Cada linha é um "lote" de um produto em um posto com uma data de validade específica
export const inventoryItems = pgTable("inventory_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }), // Link para o catálogo
  stationId: text("station_id")
    .notNull()
    .references(() => stations.id, { onDelete: "cascade" }), // Link para o posto
  expiryDate: timestamp("expiry_date", { withTimezone: true }).notNull(), // Data de validade
  initialQuantity: integer("initial_quantity").notNull(), // Qtd. adicionada inicialmente
  currentQuantity: integer("current_quantity").notNull(), // Qtd. atual (inicial - saídas)
  addedByUserId: text("added_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }), // Quem adicionou
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow(),
  // Opcional: status para facilitar queries de "vencidos" vs "em estoque"
  // Pode ser 'in_stock', 'expired', 'empty'
  status: text("status").notNull().default("in_stock"),
});

// Tabela para registrar atividades de saída (venda, remoção, etc.)
// Isso dá um histórico completo do que aconteceu com cada lote
export const inventoryActivityLog = pgTable("inventory_activity_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  inventoryItemId: text("inventory_item_id")
    .notNull()
    .references(() => inventoryItems.id, { onDelete: "cascade" }), // Qual lote foi afetado
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }), // Quem registrou a ação
  action: activityActionEnum("action").notNull(), // O que aconteceu
  quantityChange: integer("quantity_change").notNull(), // Qtd. removida (deve ser um nº negativo, ex: -1)
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
});

// Tabela para rastrear as notificações de vencimento enviadas
export const notifications = pgTable("notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  inventoryItemId: text("inventory_item_id")
    .notNull()
    .references(() => inventoryItems.id, { onDelete: "cascade" }), // Sobre qual item
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // Para qual usuário (gerente)
  stationId: text("station_id")
    .notNull()
    .references(() => stations.id, { onDelete: "cascade" }), // De qual posto
  message: text("message").notNull(), // Ex: "Produto X está a 3 dias de vencer."
  status: text("status").notNull().default("sent"), // 'sent', 'failed', 'read'
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow(),
});

/**
 * -----------------------------------------------------------------------------
 * RELATIONS (Para facilitar as queries com o ORM do Drizzle)
 * -----------------------------------------------------------------------------
 */

// Relações da tabela `stations`
export const stationsRelations = relations(stations, ({ many }) => ({
  // Um posto tem muitos usuários (funcionários/gerentes)
  users: many(user),
  // Um posto tem muitos itens de inventário
  inventoryItems: many(inventoryItems),
  // Um posto tem muitas notificações
  notifications: many(notifications),
}));

// Relações da tabela `users`
export const usersRelations = relations(user, ({ one, many }) => ({
  // Um usuário pertence a um posto
  station: one(stations, {
    fields: [user.stationId],
    references: [stations.id],
  }),
  // Um usuário adicionou muitos lotes de inventário
  addedInventoryItems: many(inventoryItems, { relationName: "addedBy" }),
  // Um usuário realizou muitas atividades de log
  activityLogs: many(inventoryActivityLog),
  // Um usuário recebeu muitas notificações
  notifications: many(notifications),
}));

// Relações da tabela `categories`
export const categoriesRelations = relations(categories, ({ many }) => ({
  // Uma categoria tem muitos produtos no catálogo
  products: many(products),
}));

// Relações da tabela `productsCatalog`
export const productsCatalogRelations = relations(
  products,
  ({ one, many }) => ({
    // Um produto do catálogo pertence a uma categoria
    category: one(categories, {
      fields: [products.categoryId],
      references: [categories.id],
    }),
    // Um produto do catálogo está em muitos lotes de inventário
    inventoryItems: many(inventoryItems),
  })
);

// Relações da tabela `inventoryItems`
export const inventoryItemsRelations = relations(
  inventoryItems,
  ({ one, many }) => ({
    // Um item de inventário (lote) refere-se a um produto do catálogo
    product: one(products, {
      fields: [inventoryItems.productId],
      references: [products.id],
    }),
    // Um item de inventário pertence a um posto
    station: one(stations, {
      fields: [inventoryItems.stationId],
      references: [stations.id],
    }),
    // Um item de inventário foi adicionado por um usuário
    addedByUser: one(user, {
      fields: [inventoryItems.addedByUserId],
      references: [user.id],
      relationName: "addedBy",
    }),
    // Um item de inventário tem um histórico de atividades
    activityLogs: many(inventoryActivityLog),
    // Um item de inventário gerou muitas notificações
    notifications: many(notifications),
  })
);

// Relações da tabela `inventoryActivityLog`
export const inventoryActivityLogRelations = relations(
  inventoryActivityLog,
  ({ one }) => ({
    // Um log de atividade pertence a um lote de inventário
    inventoryItem: one(inventoryItems, {
      fields: [inventoryActivityLog.inventoryItemId],
      references: [inventoryItems.id],
    }),
    // Um log de atividade foi registrado por um usuário
    user: one(user, {
      fields: [inventoryActivityLog.userId],
      references: [user.id],
    }),
  })
);

// Relações da tabela `notifications`
export const notificationsRelations = relations(notifications, ({ one }) => ({
  // Uma notificação é sobre um lote de inventário
  inventoryItem: one(inventoryItems, {
    fields: [notifications.inventoryItemId],
    references: [inventoryItems.id],
  }),
  // Uma notificação é para um usuário
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
  // Uma notificação é de um posto
  station: one(stations, {
    fields: [notifications.stationId],
    references: [stations.id],
  }),
}));
