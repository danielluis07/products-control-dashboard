"use client";

import { columns } from "@/components/admin/stations/columns";
import { DataTable } from "@/components/ui/data-table";
import { useConfirm } from "@/providers/confirm-provider";
import { useGetStations } from "@/queries/stations/use-get-stations";
import { useDeleteStations } from "@/queries/stations/use-delete-stations";
import { CreateStationModal } from "@/components/admin/stations/create/modal";

export const StationsClient = () => {
  const { data, isLoading } = useGetStations();
  const { mutate } = useDeleteStations();
  const { closeConfirm, setPending } = useConfirm();

  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Postos</h2>
        <CreateStationModal />
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
