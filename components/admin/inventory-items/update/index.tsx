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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updateInventoryItemSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateInventoryItem } from "@/queries/inventory-items/use-update-inventory-items";

type FormData = z.infer<typeof updateInventoryItemSchema>;

const actions = [
  { label: "Vendido", value: "sold" },
  { label: "Remoção Manual", value: "removed_manual" },
  { label: "Produto Vencido", value: "removed_expired" },
];

export const UpdateInventoryItem = ({
  id,
  quantity,
  open,
  setOpen,
}: {
  id: string;
  quantity: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { mutate, isPending } = useUpdateInventoryItem(id);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      action: "removed_manual",
      quantity,
    } satisfies FormData as FormData,
    validators: {
      onSubmit: updateInventoryItemSchema,
    },
    onSubmit: async ({ value }) => {
      mutate(value, {
        onSuccess: () => {
          toast.success("Item atualizado!");
          queryClient.invalidateQueries({
            queryKey: ["inventory-items"],
            exact: false,
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
          <DialogTitle>Editar Lote</DialogTitle>
          <DialogDescription>
            Insira os detalhes do lote que deseja editar.
          </DialogDescription>
        </DialogHeader>
        <form
          id="update-inventory-item-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}>
          <FieldGroup>
            <form.Field
              name="quantity"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Quantidade</FieldLabel>
                    <FieldDescription>
                      Insira a quantidade de itens que deseja remover
                    </FieldDescription>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/\D+/g, "");
                        field.handleChange(Number(onlyNumbers));
                      }}
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
            <form.Field
              name="action"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor="select-action">Ação</FieldLabel>
                      <FieldDescription>
                        Selecione o motivo da alteração de quantidade
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      disabled={isPending}
                      onValueChange={(value) =>
                        field.handleChange(value as FormData["action"])
                      }>
                      <SelectTrigger
                        id="select-action"
                        aria-invalid={isInvalid}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        {actions.map((action, i) => (
                          <SelectItem key={i} value={action.value}>
                            {action.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
