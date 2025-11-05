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
import { signUpSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
// import { authClient } from "@/lib/auth-client";
// import { useRouter } from "next/navigation";
import { useState } from "react";
// import { getErrorMessage } from "@/lib/auth-client";

type FormData = z.infer<typeof signUpSchema>;

export const Register = () => {
  // const { signUp } = authClient;
  // const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      repeat_password: "",
    } satisfies FormData as FormData,
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async () => {
      /*       await signUp.email(
        {
          email: value.email,
          password: value.password,
          role: "admin",
          name: value.name,
        },
        {
          onRequest: () => {
            setLoading(true);
          },
          onSuccess: async () => {
            setLoading(false);
            router.push(`/dashboard`);
          },
          onError: (ctx) => {
            console.error("Sign-up error:", ctx.error);
            toast.error(getErrorMessage(ctx.error.code, "ptBr"));
            setLoading(false);
          },
        }
      ); */

      toast.error("Registro desativado temporariamente.");
      setLoading(false);
    },
  });
  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Crie uma Conta</CardTitle>
        <CardDescription>
          Insira suas informações abaixo para criar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="sign-up-form"
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
                      placeholder="Seu nome completo"
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
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      disabled={loading}
                      autoComplete="email"
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
                      placeholder="Sua senha"
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
                      placeholder="Repita sua senha"
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
              <Button disabled={loading}>Registrar</Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
