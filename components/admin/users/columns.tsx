"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { client } from "@/lib/hono";
import { ColumnDef } from "@tanstack/react-table";
import { InferResponseType } from "hono";
import { format } from "date-fns";
import { UsersCellAction } from "./cell-action";

export type Response = InferResponseType<
  (typeof client.api.users)["$get"],
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
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "createdAt",
    header: "Criado em",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return format(date, "dd/MM/yyyy");
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const { id, name, email, stationId } = row.original;

      if (!stationId) {
        return null;
      }

      return (
        <UsersCellAction
          id={id}
          name={name}
          email={email}
          stationId={stationId}
        />
      );
    },
  },
];
