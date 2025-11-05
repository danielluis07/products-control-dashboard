import { activityActionEnum } from "@/db/schema";
import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z.email("Insira um email válido"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    repeat_password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres"),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: "As senhas não coincidem",
    path: ["repeat_password"],
  });

export const signInSchema = z.object({
  email: z.email("Insira um email válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export const updateUserDataSchema = z.object({
  id: z.string().min(1, "Selecione um usuário"),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.email("Insira um email válido"),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
});

export const updateCategorySchema = z.object({
  id: z.string().min(1, "Selecione uma categoria"),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
});

export const createStationSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  address: z.string().optional(),
});

export const updateStationSchema = z.object({
  id: z.string().min(1, "Selecione um posto"),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  address: z.string().optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.email("Insira um email válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  stationId: z.string().min(1, "Selecione um posto"),
});

export const updateUserSchema = z.object({
  id: z.string().min(1, "Selecione um usuário"),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.email("Insira um email válido"),
  stationId: z.string().min(1, "Selecione um posto"),
});

export const updateUserPasswordSchema = z
  .object({
    id: z.string().min(1, "Selecione um usuário"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    repeat_password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres"),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: "As senhas não coincidem",
    path: ["repeat_password"],
  });

export const updateAdminPasswordSchema = z
  .object({
    id: z.string().min(1, "Selecione um usuário"),
    current_password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres"),
    new_password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    repeat_password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres"),
  })
  .refine((data) => data.new_password === data.repeat_password, {
    message: "As senhas não coincidem",
    path: ["repeat_password"],
  });

export const createProductSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  barcode: z
    .string()
    .regex(/^\d+$/, "O código de barras deve conter apenas números")
    .min(8, "O código de barras deve ter pelo menos 8 dígitos")
    .max(14, "O código de barras deve ter no máximo 14 dígitos")
    .optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  notificationThresholdDays: z
    .number()
    .min(1, "O limite de notificação deve ser pelo menos 1 dia")
    .default(7)
    .nonoptional(),
});

export const updateProductSchema = z.object({
  id: z.string().min(1, "Selecione um produto"),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  barcode: z
    .string()
    .regex(/^\d+$/, "O código de barras deve conter apenas números")
    .min(8, "O código de barras deve ter pelo menos 8 dígitos")
    .max(14, "O código de barras deve ter no máximo 14 dígitos")
    .optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  notificationThresholdDays: z
    .number()
    .min(1, "O limite de notificação deve ser pelo menos 1 dia")
    .default(7)
    .nonoptional(),
});

export const createInventoryItemSchema = z.object({
  productId: z.string().min(1, "Selecione um produto"),
  expiryDate: z.coerce.date({ message: "Data de validade inválida" }),
  initialQuantity: z.coerce
    .number()
    .int()
    .positive("A quantidade deve ser maior que zero"),
});

export const logActivitySchema = z.object({
  action: z.enum(activityActionEnum.enumValues, {
    message: "Ação inválida",
  }),
  // Quantidade que está sendo REMOVIDA
  quantity: z.coerce
    .number()
    .int()
    .positive("A quantidade deve ser maior que zero"),
});
