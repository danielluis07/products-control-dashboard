"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit } from "lucide-react";
import { useState } from "react";
import { UpdateProduct } from "./update";

export const ProductsCellAction = ({
  id,
  name,
  categoryId,
  notificationThresholdDays,
  barcode,
  description,
  imageUrl,
}: {
  id: string;
  name: string;
  categoryId: string | null;
  notificationThresholdDays: number;
  barcode: string | null;
  description: string | null;
  imageUrl: string | null;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <UpdateProduct
        id={id}
        name={name}
        categoryId={categoryId}
        notificationThresholdDays={notificationThresholdDays}
        barcode={barcode}
        description={description}
        imageUrl={imageUrl}
        open={open}
        setOpen={setOpen}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
