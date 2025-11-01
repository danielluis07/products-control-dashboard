"use client";

import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  Field,
  FieldContent,
  FieldDescription,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { createUserSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

type FormData = z.infer<typeof createUserSchema>;

export const CreateUser = ({
  stationsData,
}: {
  stationsData: {
    id: string;
    name: string;
  }[];
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      stationId: "",
    } satisfies FormData as FormData,
    validators: {
      onSubmit: createUserSchema,
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      console.log("Creating user with values:", value);
      const { data: newUser, error } = await authClient.admin.createUser({
        email: value.email,
        password: value.password,
        name: value.name,
        data: { stationId: value.stationId },
        role: "user",
      });

      if (error) {
        console.error("Error creating user:", error);
        toast.error("Erro ao criar usuário");
        setLoading(false);
        return;
      }

      if (newUser) {
        toast.success("Usuário criado com sucesso");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        setLoading(false);
        setOpen(false);
        form.reset();
      }
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Criar Usuário</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Usuário</DialogTitle>
          <DialogDescription>
            Insira as informações do usuário que deseja criar.
          </DialogDescription>
        </DialogHeader>
        <form
          id="create-user-form"
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
                      autoComplete="name"
                      aria-invalid={isInvalid}
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
              name="stationId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor="select-station">Posto</FieldLabel>
                      <FieldDescription>
                        {stationsData.length === 0
                          ? "Nenhum posto disponível. Crie um posto antes de criar um usuário."
                          : "Selecione o posto ao qual o usuário estará associado."}
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      disabled={loading || stationsData.length === 0}
                      onValueChange={field.handleChange}>
                      <SelectTrigger
                        id="select-station"
                        aria-invalid={isInvalid}
                        className="">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        {stationsData.map((station) => (
                          <SelectItem key={station.id} value={station.id}>
                            {station.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                );
              }}
            />
            <Field>
              <Button disabled={loading || stationsData.length === 0}>
                Criar
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};
