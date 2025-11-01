"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { CreateCategoryForm } from "@/components/admin/categories/create/form";
import { Button } from "@/components/ui/button";

export const CreateCategoryModal = () => {
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Criar Categoria</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Categoria</DialogTitle>
          <DialogDescription>
            Insira o nome da nova categoria que deseja criar.
          </DialogDescription>
        </DialogHeader>
        <CreateCategoryForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
