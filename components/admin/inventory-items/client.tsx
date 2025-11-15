"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { columns } from "@/components/admin/inventory-items/columns";
import type { Response } from "@/components/admin/inventory-items/columns";
import { DataTable } from "@/components/admin/inventory-items/data-table";
import { useGetInventoryItems } from "@/queries/inventory-items/use-get-inventory-items";
import { useDebounce } from "@/hooks/use-debounce";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { SelectTag } from "@/components/ui/select-tag";
import { SelectFilters } from "@/components/admin/inventory-items/select-filter";
import { CommandFilters } from "@/components/admin/inventory-items/command-filter";
import { X } from "lucide-react";
import { useDeleteInventoryItems } from "@/queries/inventory-items/use-delete-inventory-items";
import { Row } from "@tanstack/react-table";
import { useConfirm } from "@/providers/confirm-provider";

const status = [
  {
    id: "in_stock",
    name: "Em estoque",
  },
  { id: "expired", name: "Vencido" },
  { id: "empty", name: "Esgotado" },
];

const defaultData: Response[] = [];

export const InventoryItemsClient = ({
  stations,
  categories,
}: {
  stations: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { mutate } = useDeleteInventoryItems();
  const { closeConfirm, setPending } = useConfirm();

  // Estados separados para page e limit
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [rowSelection, setRowSelection] = useState({});
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Reset para primeira página quando filtros mudam
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, selectedStations, selectedCategory, selectedStatus]);

  const onDeleteRows = useCallback(
    (
      row: Row<{
        id: string;
        status: string;
        currentQuantity: number;
        initialQuantity: number;
        expiryDate: string;
        addedAt: string | null;
        productName: string | null;
        productBarcode: string | null;
        stationName: string | null;
        categoryName: string | null;
        addedBy: string | null;
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
    []
  );

  const apiParams = useMemo(() => {
    const stationIds =
      selectedStations.length > 0 ? selectedStations.join(",") : undefined;

    return {
      page: page.toString(),
      limit: limit.toString(),
      search: debouncedSearchTerm,
      stationIds: stationIds,
      categoryId: selectedCategory,
      status: selectedStatus,
    };
  }, [
    page,
    limit,
    debouncedSearchTerm,
    selectedStations,
    selectedCategory,
    selectedStatus,
  ]);

  const { data: response, isLoading } = useGetInventoryItems(apiParams);

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
      <h2 className="text-2xl font-bold">Itens de Inventário</h2>
      <div className="flex items-center gap-4 my-4">
        <div className="relative w-80">
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
        <SelectTag
          items={stations}
          placeholder="Procurar posto"
          value={selectedStations}
          onChange={setSelectedStations}
        />
        <CommandFilters
          items={categories}
          placeholder="Categoria"
          value={selectedCategory}
          onChange={setSelectedCategory}
        />
        <SelectFilters
          items={status}
          placeholder="Status"
          value={selectedStatus}
          onChange={setSelectedStatus}
        />
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
