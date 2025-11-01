"use client";

import { columns } from "@/components/admin/users/columns";
import { DataTable } from "@/components/ui/data-table";
import { useConfirm } from "@/providers/confirm-provider";
import { CreateUser } from "@/components/admin/users/create";
import { useGetUsers } from "@/queries/users/use-get-users";
import { useDeleteUsers } from "@/queries/users/use-delete-users";

export const UsersClient = ({
  stationsData,
}: {
  stationsData: {
    id: string;
    name: string;
  }[];
}) => {
  const { data, isLoading } = useGetUsers();
  const { mutate } = useDeleteUsers();
  const { closeConfirm, setPending } = useConfirm();

  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Usuários</h2>
        <CreateUser stationsData={stationsData} />
      </div>
      <DataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        onDelete={(row) => {
          const ids = row.map((r) => r.original.id);
          mutate(ids, {
            onSettled: () => {
              closeConfirm();
              setPending(false);
            },
          });
        }}
        searchKey="name"
      />
    </div>
  );
};
