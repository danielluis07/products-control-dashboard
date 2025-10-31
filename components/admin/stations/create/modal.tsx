"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateStationForm } from "@/components/admin/stations/create/form";

export const CreateStationModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Criar Posto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Posto</DialogTitle>
          <DialogDescription>
            Insira o nome do novo posto que deseja criar.
          </DialogDescription>
        </DialogHeader>
        <CreateStationForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
