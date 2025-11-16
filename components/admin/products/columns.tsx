"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { client } from "@/lib/hono";
import { ColumnDef } from "@tanstack/react-table";
import { InferResponseType } from "hono";
import { ProductsCellAction } from "@/components/admin/products/cell-action";

export type Response = InferResponseType<
  (typeof client.api.products.admin)["$get"],
  200
>["data"][0];

export const columns: ColumnDef<Response>[] = [
  {
    id: "id",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "categoryName",
    header: "Categoria",
  },
  {
    accessorKey: "barcode",
    header: "Código de Barras",
  },
  {
    accessorKey: "notificationThresholdDays",
    header: "Prazo de Notificação (dias)",
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const {
        id,
        name,
        barcode,
        categoryId,
        notificationThresholdDays,
        description,
        imageUrl,
      } = row.original;

      return (
        <ProductsCellAction
          id={id}
          name={name}
          categoryId={categoryId}
          notificationThresholdDays={notificationThresholdDays}
          barcode={barcode}
          description={description}
          imageUrl={imageUrl}
        />
      );
    },
  },
];
