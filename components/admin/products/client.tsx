"use client";

import { Row } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "@/components/data-table/data-table";
import { useConfirm } from "@/providers/confirm-provider";
import { columns } from "@/components/admin/products/columns";
import type { Response } from "@/components/admin/products/columns";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useGetProducts } from "@/queries/products/use-get-products";
import { CreateProductForm } from "@/components/admin/products/create";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useDeleteProducts } from "@/queries/products/use-delete-products";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const defaultData: Response[] = [];

export const ProductsClient = ({
  categoriesData,
}: {
  categoriesData: {
    id: string;
    name: string;
  }[];
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { mutate } = useDeleteProducts();
  const { closeConfirm, setPending } = useConfirm();

  // Estados separados para page e limit
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [rowSelection, setRowSelection] = useState({});

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const onDeleteRows = useCallback(
    (
      row: Row<{
        id: string;
        name: string;
        categoryId: string | null;
        categoryName: string | null;
        barcode: string | null;
        notificationThresholdDays: number;
        description: string | null;
        imageUrl: string | null;
      }>[]
    ) => {
      const ids = row.map((r) => r.original.id);
      mutate(ids, {
        onSettled: () => {
          closeConfirm();
          setPending(false);
        },
      });
    },
    [mutate, closeConfirm, setPending]
  );

  const apiParams = useMemo(() => {
    return {
      page: page.toString(),
      limit: limit.toString(),
      search: debouncedSearchTerm,
    };
  }, [page, limit, debouncedSearchTerm]);

  // Reset para primeira página quando filtros mudam
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const { data: response, isLoading } = useGetProducts(apiParams);

  const tableData = response?.data || defaultData;
  const paginationData = response?.pagination || {
    page,
    limit,
    total: 0,
    totalPages: 1,
  };

  // Handlers para paginação
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    setPage(1); // Reset para primeira página ao mudar tamanho
  };

  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Produtos</h2>
        <CreateProductForm categoriesData={categoriesData} />
      </div>
      <div className="relative w-80 mt-5">
        <Input
          placeholder="Procurar por nome..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="h-10"
        />
        {searchTerm && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchTerm("")}
            aria-label="Clear search">
            <X className="size-4" />
          </button>
        )}
      </div>
      <DataTable
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        onDelete={onDeleteRows}
        pagination={paginationData}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </div>
  );
};
