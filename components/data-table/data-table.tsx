"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Column,
  type ColumnPinningState,
  type VisibilityState,
} from "@tanstack/react-table"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SearchX } from "lucide-react"

import { buildColumns } from "./columns"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import type { TransactionRow, TransactionVariant } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

type Props = {
  data: TransactionRow[]
  total: number
  variant: TransactionVariant
  remarksCodes: string[]
}

function pinClasses<TData>(column: Column<TData, unknown>) {
  const isPinned = column.getIsPinned()
  if (!isPinned) return ""
  const isLastLeft =
    isPinned === "left" && column.getIsLastColumn("left")
  const isFirstRight =
    isPinned === "right" && column.getIsFirstColumn("right")
  return cn(
    "sticky z-10 bg-background",
    isLastLeft && "shadow-[inset_-1px_0_0_0_var(--border)]",
    isFirstRight && "shadow-[inset_1px_0_0_0_var(--border)]"
  )
}

function pinStyle<TData>(column: Column<TData, unknown>): React.CSSProperties {
  const isPinned = column.getIsPinned()
  if (!isPinned) return {}
  return {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
  }
}

export function DataTable({ data, total, variant, remarksCodes }: Props) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: [],
    right: [],
  })
  const columns = React.useMemo(() => buildColumns(variant), [variant])

  const table = useReactTable({
    data,
    columns,
    state: { columnVisibility, columnPinning },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableColumnPinning: true,
  })

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        table={table}
        variant={variant}
        remarksCodes={remarksCodes}
      />
      <div className="rounded-lg border">
        <div className="relative w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={pinClasses(header.column)}
                      style={pinStyle(header.column)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={pinClasses(cell.column)}
                        style={pinStyle(cell.column)}
                      >
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
                  <TableCell colSpan={columns.length} className="h-64 p-0">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <SearchX />
                        </EmptyMedia>
                        <EmptyTitle>No transactions found</EmptyTitle>
                        <EmptyDescription>
                          Try adjusting your filters or search query.
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent />
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <DataTablePagination total={total} />
    </div>
  )
}
