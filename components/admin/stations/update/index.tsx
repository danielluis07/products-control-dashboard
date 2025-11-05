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
import { Input } from "@/components/ui/input";
import { updateStationSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateStation } from "@/queries/stations/use-update-station";

type FormData = z.infer<typeof updateStationSchema>;

export const UpdateStation = ({
  id,
  name,
  open,
  setOpen,
}: {
  id: string;
  name: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { mutate, isPending } = useUpdateStation(id);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      id,
      name,
    } satisfies FormData as FormData,
    validators: {
      onSubmit: updateStationSchema,
    },
    onSubmit: async ({ value }) => {
      mutate(value, {
        onSuccess: () => {
          toast.success("Posto atualizado!");
          queryClient.invalidateQueries({
            queryKey: ["stations"],
          });
          setOpen(false);
        },
      });
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Posto</DialogTitle>
          <DialogDescription>Atualize o nome do posto.</DialogDescription>
        </DialogHeader>
        <form
          id="update-station-form"
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
                      disabled={isPending}
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
              <Button disabled={isPending}>Salvar</Button>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};
