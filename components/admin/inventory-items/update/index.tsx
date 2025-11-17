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

// ATUALIZAÇÃO 1: Adicionada a opção de Restock
const actions = [
  { label: "Vendido (-)", value: "sold" },
  { label: "Remoção Manual (-)", value: "removed_manual" },
  { label: "Produto Vencido (-)", value: "removed_expired" },
  { label: "Reabastecimento / Correção (+)", value: "restock" }, // Nova opção
];

export const UpdateInventoryItem = ({
  id,
  open,
  setOpen,
}: {
  id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { mutate, isPending } = useUpdateInventoryItem(id);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      action: "removed_manual", // Padrão seguro
      quantity: 0, // Começa zerado para forçar o usuário a digitar o ajuste
    } satisfies FormData as FormData,
    validators: {
      onSubmit: updateInventoryItemSchema,
    },
    onSubmit: async ({ value }) => {
      mutate(value, {
        onSuccess: () => {
          toast.success("Estoque atualizado com sucesso!");
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
          <DialogTitle>Ajuste de Estoque</DialogTitle>
          <DialogDescription>
            Selecione o tipo de movimentação e a quantidade.
          </DialogDescription>
        </DialogHeader>
        <form
          id="update-inventory-item-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}>
          <FieldGroup>
            {/* ATUALIZAÇÃO 2: Inverti a ordem. 
              É melhor selecionar a AÇÃO primeiro para entender o contexto da quantidade.
            */}
            <form.Field
              name="action"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor="select-action">
                        Tipo de Movimentação
                      </FieldLabel>
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
                        <SelectValue placeholder="Selecione o motivo" />
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

            <form.Field
              name="quantity"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Quantidade</FieldLabel>

                    {/* form.Subscribe para atualizar o texto dinamicamente */}
                    <FieldDescription>
                      <form.Subscribe
                        selector={(state) => state.values.action}
                        children={(action) => (
                          <span>
                            {action === "restock"
                              ? "Quantos itens você quer ADICIONAR ao lote?"
                              : "Quantos itens você quer REMOVER do lote?"}
                          </span>
                        )}
                      />
                    </FieldDescription>

                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Ex: 5"
                      value={field.state.value === 0 ? "" : field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/\D+/g, "");
                        field.handleChange(Number(onlyNumbers));
                      }}
                      aria-invalid={isInvalid}
                      disabled={isPending}
                      required
                      autoFocus
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <Field>
              <Button disabled={isPending} type="submit" className="w-full">
                {isPending ? "Atualizando..." : "Confirmar Ajuste"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};
