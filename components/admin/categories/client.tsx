"use client";

import { columns } from "@/components/admin/categories/columns";
import { DataTable } from "@/components/ui/data-table";
import { useGetCategories } from "@/queries/categories/use-get-categories";
import { CreateCategoryModal } from "@/components/admin/categories/create/modal";
import { useDeleteCategories } from "@/queries/categories/use-delete-categories";
import { useConfirm } from "@/providers/confirm-provider";

export const CategoriesClient = () => {
  const { data, isLoading } = useGetCategories();
  const { mutate } = useDeleteCategories();
  const { closeConfirm, setPending } = useConfirm();

  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Categorias</h2>
        <CreateCategoryModal />
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
