"use client";

import { columns } from "@/components/admin/products/columns";
import { DataTable } from "@/components/ui/data-table";
import { useConfirm } from "@/providers/confirm-provider";
import { useGetProducts } from "@/queries/products/use-get-products";
import { CreateProductForm } from "@/components/admin/products/create";
import { useDeleteProducts } from "@/queries/products/use-delete-products";

export const ProductsClient = ({
  categoriesData,
}: {
  categoriesData: {
    id: string;
    name: string;
  }[];
}) => {
  const { data, isLoading } = useGetProducts();
  const { mutate } = useDeleteProducts();
  const { closeConfirm, setPending } = useConfirm();

  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Produtos</h2>
        <CreateProductForm categoriesData={categoriesData} />
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
