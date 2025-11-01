"use client";

import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { updateUserPasswordSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

type FormData = z.infer<typeof updateUserPasswordSchema>;

export const UpdateUserPassword = ({
  id,
  open,
  setOpen,
}: {
  id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      id,
      password: "",
      repeat_password: "",
    } satisfies FormData as FormData,
    validators: {
      onSubmit: updateUserPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      const { data: newUser, error } = await authClient.admin.setUserPassword({
        userId: id,
        newPassword: value.password,
      });

      if (error) {
        console.error("Error updating user password:", error);
        toast.error("Erro ao atualizar senha do usuário");
        setLoading(false);
        return;
      }

      if (newUser) {
        toast.success("Senha atualizada com sucesso");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        setLoading(false);
        setOpen(false);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Senha</DialogTitle>
          <DialogDescription>
            Altere a senha do usuário selecionado.
          </DialogDescription>
        </DialogHeader>
        <form
          id="update-user-password-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}>
          <FieldGroup>
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Senha</FieldLabel>
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
      </DialogContent>
    </Dialog>
  );
};
