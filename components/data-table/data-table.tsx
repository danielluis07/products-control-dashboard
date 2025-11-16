"use client";

import React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
  RowSelectionState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useConfirm } from "@/providers/confirm-provider";
import { Trash2 } from "lucide-react";
import { DataTablePagination } from "@/components/data-table/pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDelete: (rows: Row<TData>[]) => void;
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: React.Dispatch<
    React.SetStateAction<ColumnFiltersState>
  >;
  sorting: SortingState;
  onSortingChange: React.Dispatch<React.SetStateAction<SortingState>>;
  rowSelection: RowSelectionState;
  onRowSelectionChange: React.Dispatch<React.SetStateAction<RowSelectionState>>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onDelete,
  isLoading,
  pagination,
  onPageChange,
  onPageSizeChange,
  columnFilters,
  onColumnFiltersChange,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const { confirm, setPending } = useConfirm();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: pagination.totalPages,
    onColumnFiltersChange: onColumnFiltersChange,
    onSortingChange: onSortingChange,
    onRowSelectionChange: onRowSelectionChange,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-end h-12">
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            variant="destructive"
            onClick={async () => {
              const confirmed = await confirm(
                "Tem certeza que deseja deletar os itens selecionados?",
                "Esta ação não pode ser desfeita."
              );

              if (confirmed) {
                setPending(true);
                onDelete(table.getFilteredSelectedRowModel().rows);
                table.resetRowSelection();
              }
            }}>
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar ({table.getFilteredSelectedRowModel().rows.length})
          </Button>
        )}
      </div>

      {/* A Tabela (Renderização) */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center">
                  <div className="flex items-center justify-center">
                    <Spinner className="size-14 text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="py-4">
        <DataTablePagination
          table={table}
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
}
