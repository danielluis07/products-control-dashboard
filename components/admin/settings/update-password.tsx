"use client";

import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateAdminPasswordSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

type FormData = z.infer<typeof updateAdminPasswordSchema>;

export const UpdateUserPassword = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      id,
      current_password: "",
      new_password: "",
      repeat_password: "",
    } satisfies FormData as FormData,
    validators: {
      onSubmit: updateAdminPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setLoading(true);

      try {
        const { data, error } = await authClient.changePassword({
          newPassword: value.new_password,
          currentPassword: value.current_password,
          revokeOtherSessions: true,
        });

        if (error) {
          switch (error.code) {
            case "INVALID_PASSWORD":
              toast.error("A senha atual está incorreta");
              break;
            default:
              toast.error("Erro ao atualizar senha do usuário");
          }
          return;
        }

        if (data) {
          toast.success("Senha atualizada com sucesso");
        }
      } catch (error) {
        console.error("Unexpected error updating user password:", error);
        toast.error("Erro ao atualizar senha do usuário");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Atualize sua Senha</CardTitle>
        <CardDescription>
          Insira suas informações abaixo para atualizar sua senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="update-user-password-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}>
          <FieldGroup>
            <form.Field
              name="current_password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Senha Atual</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      disabled={loading}
                      placeholder="Senha Atual"
                      required
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="new_password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Nova Senha</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      disabled={loading}
                      placeholder="Nova senha"
                      required
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="repeat_password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Repita a Senha</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      disabled={loading}
                      placeholder="Repita a senha"
                      required
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <Field>
              <Button disabled={loading}>Salvar</Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
