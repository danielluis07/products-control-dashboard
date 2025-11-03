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
import { updateUserDataSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

type FormData = z.infer<typeof updateUserDataSchema>;

export const UpdateUserData = ({
  id,
  name,
  email,
}: {
  id: string;
  name: string;
  email: string;
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      id,
      name,
      email,
    } satisfies FormData as FormData,
    validators: {
      onSubmit: updateUserDataSchema,
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      const { data, error } = await authClient.admin.updateUser({
        userId: value.id,
        data: {
          name: value.name,
          email: value.email,
        },
      });

      if (error) {
        console.error(error);
        toast.error("Erro ao atualizar os dados");
        setLoading(false);
        return;
      }

      if (data) {
        toast.success("Dados atualizados com sucesso!");
        setLoading(false);
      }
    },
  });

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Atualize seus Dados</CardTitle>
        <CardDescription>
          Insira suas informações abaixo para atualizar seus dados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="update-data-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}>
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Seu nome"
                      disabled={loading}
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
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      type="email"
                      name={field.name}
                      autoComplete="email"
                      disabled={loading}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Seu email"
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
