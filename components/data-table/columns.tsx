"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCurrency, formatDateTime } from "@/lib/format"
import type { TransactionRow, TransactionVariant } from "@/lib/supabase/types"

import { DataTableColumnHeader } from "./data-table-column-header"

export function buildColumns(
  variant: TransactionVariant
): ColumnDef<TransactionRow, unknown>[] {
  const amountKey = variant === "debit" ? "DEBIT" : "CREDIT"
  const amountLabel = variant === "debit" ? "Debit" : "Credit"

  return [
    {
      id: "ID#",
      accessorKey: "ID#",
      header: ({ column }) => <DataTableColumnHeader column={column} label="ID#" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {String(row.original["ID#"] ?? "")}
        </span>
      ),
      meta: { label: "ID#" },
      enableHiding: true,
    },
    {
      id: "DATE",
      accessorKey: "DATE",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} sortKey="DATE" label="Date" />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {formatDateTime(row.original.DATE)}
        </span>
      ),
      meta: { label: "Date" },
    },
    {
      id: "NAME",
      accessorKey: "NAME",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} sortKey="NAME" label="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.NAME ?? "—"}</span>
      ),
      meta: { label: "Name" },
    },
    {
      id: "USERNAME",
      accessorKey: "USERNAME",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          sortKey="USERNAME"
          label="Username"
        />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.USERNAME ?? "—"}
        </span>
      ),
      meta: { label: "Username" },
    },
    {
      id: "amount",
      accessorKey: amountKey,
      header: ({ column }) => (
        <div className="text-right">
          <DataTableColumnHeader
            column={column}
            sortKey="amount"
            label={amountLabel}
            align="right"
          />
        </div>
      ),
      cell: ({ row }) => {
        const raw = (row.original as Record<string, unknown>)[amountKey]
        return (
          <div className="text-right font-medium tabular-nums">
            {formatCurrency(raw as number | string | null | undefined)}
          </div>
        )
      },
      meta: { label: amountLabel },
    },
    {
      id: "REMARKS_CODE",
      accessorKey: "REMARKS_CODE",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          sortKey="REMARKS_CODE"
          label="Remarks Code"
        />
      ),
      cell: ({ row }) =>
        row.original.REMARKS_CODE ? (
          <Badge variant="secondary" className="font-normal">
            {row.original.REMARKS_CODE}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      meta: { label: "Remarks Code" },
    },
    {
      id: "ACCOUNT",
      accessorKey: "ACCOUNT",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          sortKey="ACCOUNT"
          label="Account"
        />
      ),
      cell: ({ row }) => (
        <span className="max-w-[260px] truncate text-sm">
          {row.original.ACCOUNT ?? "—"}
        </span>
      ),
      meta: { label: "Account" },
    },
    {
      id: "REMARKS",
      accessorKey: "REMARKS",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Remarks" />
      ),
      cell: ({ row }) => {
        const remarks = row.original.REMARKS ?? ""
        if (!remarks) return <span className="text-muted-foreground">—</span>
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block max-w-[360px] truncate text-sm text-muted-foreground">
                {remarks}
              </span>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-md whitespace-pre-wrap">
              {remarks}
            </TooltipContent>
          </Tooltip>
        )
      },
      meta: { label: "Remarks" },
    },
    {
      id: "SOURCE_FILE",
      accessorKey: "SOURCE_FILE",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Source" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.SOURCE_FILE ?? "—"}
        </span>
      ),
      meta: { label: "Source File" },
    },
  ]
}
