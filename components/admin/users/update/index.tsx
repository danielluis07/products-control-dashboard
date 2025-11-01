"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
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
import { updateUserSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useGetStations } from "@/queries/stations/use-get-stations";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type FormData = z.infer<typeof updateUserSchema>;

export const UpdateUser = ({
  id,
  name,
  email,
  stationId,
  open,
  setOpen,
}: {
  id: string;
  name: string;
  email: string;
  stationId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { data: stationsData, isLoading: isLoadingStations } = useGetStations();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      id,
      name,
      email,
      stationId,
    } satisfies FormData as FormData,
    validators: {
      onSubmit: updateUserSchema,
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      const { data: newUser, error } = await authClient.admin.updateUser({
        userId: id,
        data: {
          name: value.name,
          email: value.email,
          stationId: value.stationId,
        },
      });

      if (error) {
        console.error("Error updating user:", error);
        toast.error("Erro ao atualizar usuário");
        setLoading(false);
        return;
      }

      if (newUser) {
        toast.success("Usuário atualizado com sucesso");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        setLoading(false);
        setOpen(false);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          isLoadingStations && "flex justify-center items-center",
          "h-[460px]"
        )}>
        {isLoadingStations ? (
          <Spinner className="size-10" />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Insira as informações do usuário que deseja editar.
              </DialogDescription>
            </DialogHeader>
            <form
              id="update-user-form"
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
                  name="stationId"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldContent>
                          <FieldLabel htmlFor="select-station">
                            Posto
                          </FieldLabel>
                          <FieldDescription>
                            {stationsData?.length === 0
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
                          disabled={loading || stationsData?.length === 0}
                          onValueChange={field.handleChange}>
                          <SelectTrigger
                            id="select-station"
                            aria-invalid={isInvalid}
                            className="">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent position="item-aligned">
                            {stationsData?.map((station) => (
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
                  <Button disabled={loading || stationsData?.length === 0}>
                    Atualizar
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
