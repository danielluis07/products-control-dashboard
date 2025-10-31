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

export const createCategorySchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
});
