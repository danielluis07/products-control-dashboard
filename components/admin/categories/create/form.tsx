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
import { Input } from "@/components/ui/input";
import { createCategorySchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useCreateCategory } from "@/queries/categories/use-create-category";
import { useQueryClient } from "@tanstack/react-query";

type FormData = z.infer<typeof createCategorySchema>;

export const CreateCategoryForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const { mutate, isPending } = useCreateCategory();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
    } satisfies FormData as FormData,
    validators: {
      onSubmit: createCategorySchema,
    },
    onSubmit: async ({ value }) => {
      mutate(value, {
        onSuccess: () => {
          toast.success("Categoria criada!");
          queryClient.invalidateQueries({
            queryKey: ["categories"],
          });
          setOpen(false);
        },
      });
    },
  });
  return (
    <form
      id="create-category-form"
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
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <Field>
          <Button disabled={isPending}>Criar</Button>
        </Field>
      </FieldGroup>
    </form>
  );
};
