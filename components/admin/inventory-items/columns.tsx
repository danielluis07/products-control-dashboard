"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { client } from "@/lib/hono";
import { ColumnDef } from "@tanstack/react-table";
import { InferResponseType } from "hono";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export type Response = InferResponseType<
  (typeof client.api)["inventory-items"]["admin"]["$get"],
  200
>["data"][0];

const translateStatus = (status: string) => {
  switch (status) {
    case "in_stock":
      return "Em estoque";
    case "expired":
      return "Vencido";
    case "empty":
      return "Esgotado";
  }
};

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
    accessorKey: "productName",
    header: "Nome do Produto",
  },
  {
    accessorKey: "stationName",
    header: "Posto",
  },
  {
    accessorKey: "currentQuantity",
    header: "Quantidade Atual",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: "default" | "destructive" | "secondary" = "secondary";

      if (status === "expired") {
        variant = "destructive";
      } else if (status === "in_stock") {
        variant = "default";
      } else if (status === "empty") {
        variant = "secondary";
      }

      return <Badge variant={variant}>{translateStatus(status)}</Badge>;
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Data de Validade",
    cell: ({ row }) => {
      const date = new Date(row.original.expiryDate);

      // --- CÓDIGO ATUALIZADO ---
      // Formata a data com date-fns para "dd/MM/yyyy"
      const formatted = format(date, "dd/MM/yyyy", { locale: ptBR });
      // -------------------------

      // Lógica de Cor para o Badge (permanece a mesma)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(date);
      expiry.setHours(0, 0, 0, 0);

      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let variant: "default" | "destructive" | "secondary" = "secondary";

      if (diffDays < 0) {
        variant = "destructive"; // Vencido
      } else if (diffDays <= 7) {
        variant = "default"; // Alerta (Amarelo)
      }

      return <Badge variant={variant}>{formatted}</Badge>;
    },
  },
  {
    accessorKey: "categoryName",
    header: "Categoria",
    cell: ({ row }) => {
      // Evita "null" se um produto não tiver categoria
      return (
        row.original.categoryName ?? (
          <span className="text-muted-foreground">N/A</span>
        )
      );
    },
  },
  {
    accessorKey: "addedBy",
    header: "Adicionado Por",
  },
];
