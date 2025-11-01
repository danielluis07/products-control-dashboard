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
import { updateProductSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateProduct } from "@/queries/products/use-update-product";
import { formatBarcode } from "@/lib/utils";
import { useGetCategories } from "@/queries/categories/use-get-categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormData = z.infer<typeof updateProductSchema>;

export const UpdateProduct = ({
  id,
  name,
  categoryId,
  notificationThresholdDays,
  barcode,
  description,
  imageUrl,
  open,
  setOpen,
}: {
  id: string;
  name: string;
  categoryId: string | null;
  notificationThresholdDays: number;
  barcode: string | null;
  description: string | null;
  imageUrl: string | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { mutate, isPending } = useUpdateProduct(id);
  const { data: categoriesData } = useGetCategories();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      id,
      name,
      categoryId: categoryId || "",
      notificationThresholdDays,
      barcode: barcode || "",
      description: description || "",
      imageUrl: imageUrl || "",
    } satisfies FormData as FormData,
    validators: {
      onSubmit: updateProductSchema,
    },
    onSubmit: async ({ value }) => {
      mutate(value, {
        onSuccess: () => {
          toast.success("Produto atualizado!");
          queryClient.invalidateQueries({
            queryKey: ["products"],
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
          <DialogTitle>Editar Produto</DialogTitle>
          <DialogDescription>
            Insira os detalhes do produto que deseja editar.
          </DialogDescription>
        </DialogHeader>
        <form
          id="update-product-form"
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
            <form.Field
              name="categoryId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor="select-category">
                        Categoria
                      </FieldLabel>
                      <FieldDescription>
                        Selecione a categoria à qual o produto estará associado
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      disabled={isPending || categoriesData?.length === 0}
                      onValueChange={field.handleChange}>
                      <SelectTrigger
                        id="select-category"
                        aria-invalid={isInvalid}
                        className="">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        {categoriesData?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                );
              }}
            />
            <form.Field
              name="barcode"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Código de Barras
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const formatted = formatBarcode(e.target.value);
                        field.handleChange(formatted);
                      }}
                      autoComplete="barcode"
                      aria-invalid={isInvalid}
                      disabled={isPending}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="notificationThresholdDays"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Notificação (dias)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        field.handleChange(isNaN(value) ? 0 : value);
                      }}
                      autoComplete="notificationThresholdDays"
                      aria-invalid={isInvalid}
                      disabled={isPending}
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
