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
import { UpdateUser } from "@/components/admin/users/update";
import { UpdateUserPassword } from "@/components/admin/users/update/password";

export const UsersCellAction = ({
  id,
  name,
  email,
  stationId,
}: {
  id: string;
  name: string;
  email: string;
  stationId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);

  return (
    <>
      <UpdateUser
        id={id}
        name={name}
        email={email}
        stationId={stationId}
        open={open}
        setOpen={setOpen}
      />
      <UpdateUserPassword
        id={id}
        open={openPassword}
        setOpen={setOpenPassword}
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
          <DropdownMenuItem onClick={() => setOpenPassword(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Alterar Senha
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
