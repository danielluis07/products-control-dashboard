"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateCategory } from "@/queries/categories/use-update-category";
import { MoreHorizontal } from "lucide-react";

export const CategoriesCellAction = ({ id }: { id: string }) => {
  const { mutate } = useUpdateCategory(id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {}}>Editar</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Deletar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
