import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, adminClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), adminClient()],
});

export type Session = typeof authClient.$Infer.Session;

type ErrorTypes = Partial<
  Record<
    keyof typeof authClient.$ERROR_CODES,
    {
      en: string;
      ptBr: string;
    }
  >
>;

const errorCodes = {
  USER_ALREADY_EXISTS: {
    en: "User already exists",
    ptBr: "Usuário já existe",
  },
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: {
    en: "User already registered, use another email",
    ptBr: "Usuário já registrado, use outro email",
  },
  USER_ALREADY_HAS_PASSWORD: {
    en: "User already has a password",
    ptBr: "Usuário já possui uma senha",
  },
  USER_NOT_FOUND: {
    en: "User not found",
    ptBr: "Usuário não encontrado",
  },
  INVALID_EMAIL_OR_PASSWORD: {
    en: "Invalid email or password",
    ptBr: "Email ou senha inválidos",
  },
  INVALID_EMAIL: {
    en: "Invalid email",
    ptBr: "Email inválido",
  },
  INVALID_PASSWORD: {
    en: "Invalid password",
    ptBr: "Senha inválida",
  },
  ACCOUNT_NOT_FOUND: {
    en: "Account not found",
    ptBr: "Conta não encontrada",
  },
  INVALID_TOKEN: {
    en: "Invalid token",
    ptBr: "Token inválido",
  },
  USER_EMAIL_NOT_FOUND: {
    en: "User email not found",
    ptBr: "Email de usuário não encontrado",
  },
  CREDENTIAL_ACCOUNT_NOT_FOUND: {
    en: "Credential account not found",
    ptBr: "Conta de credencial não encontrada",
  },
  SOCIAL_ACCOUNT_ALREADY_LINKED: {
    en: "Social account already linked",
    ptBr: "Conta social já vinculada",
  },
  SESSION_EXPIRED: {
    en: "Session expired",
    ptBr: "Sessão expirada",
  },
  PROVIDER_NOT_FOUND: {
    en: "Provider not found",
    ptBr: "Provedor não encontrado",
  },
  EMAIL_CAN_NOT_BE_UPDATED: {
    en: "Email cannot be updated",
    ptBr: "Email não pode ser atualizado",
  },
  EMAIL_NOT_VERIFIED: {
    en: "Email not verified",
    ptBr: "Email não verificado",
  },
  FAILED_TO_CREATE_SESSION: {
    en: "Failed to create session",
    ptBr: "Falha ao criar sessão",
  },
  FAILED_TO_CREATE_USER: {
    en: "Failed to create user",
    ptBr: "Falha ao criar usuário",
  },
  FAILED_TO_GET_SESSION: {
    en: "Failed to get session",
    ptBr: "Falha ao obter sessão",
  },
  FAILED_TO_GET_USER_INFO: {
    en: "Failed to get user info",
    ptBr: "Falha ao obter informações do usuário",
  },
  FAILED_TO_UNLINK_LAST_ACCOUNT: {
    en: "Failed to unlink last account",
    ptBr: "Falha ao desvincular última conta",
  },
  FAILED_TO_UPDATE_USER: {
    en: "Failed to update user",
    ptBr: "Falha ao atualizar usuário",
  },
  ID_TOKEN_NOT_SUPPORTED: {
    en: "ID token not supported",
    ptBr: "Token de ID não suportado",
  },
  PASSWORD_TOO_LONG: {
    en: "Password too long",
    ptBr: "Senha muito longa",
  },
  PASSWORD_TOO_SHORT: {
    en: "Password too short",
    ptBr: "Senha muito curta",
  },
} satisfies ErrorTypes;

export const getErrorMessage = (code: string, lang: "en" | "ptBr") => {
  if (code in errorCodes) {
    return errorCodes[code as keyof typeof errorCodes][lang];
  }
  return "";
};
