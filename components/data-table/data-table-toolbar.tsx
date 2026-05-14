"use client"

import { X } from "lucide-react"
import { useQueryStates } from "nuqs"
import * as React from "react"
import type { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { DataTableSearch } from "./data-table-search"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { DataTableDateRangeFilter } from "./data-table-date-range-filter"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableExportMenu } from "./data-table-export-menu"
import type { TransactionVariant } from "@/lib/supabase/types"
import { transactionsSearchParams } from "@/lib/validations"

type Props<TData> = {
  table: Table<TData>
  variant: TransactionVariant
  remarksCodes: string[]
}

export function DataTableToolbar<TData>({
  table,
  variant,
  remarksCodes,
}: Props<TData>) {
  const [params, setParams] = useQueryStates(
    {
      q: transactionsSearchParams.q,
      from: transactionsSearchParams.from,
      to: transactionsSearchParams.to,
      accounts: transactionsSearchParams.accounts,
      remarks_codes: transactionsSearchParams.remarks_codes,
      page: transactionsSearchParams.page,
    },
    { shallow: false }
  )

  const isFiltered =
    params.q !== "" ||
    params.from !== "" ||
    params.to !== "" ||
    params.accounts.length > 0 ||
    params.remarks_codes.length > 0

  async function loadAccountOptions(q: string) {
    const url = new URL("/api/accounts", window.location.origin)
    url.searchParams.set("variant", variant)
    if (q) url.searchParams.set("q", q)
    const res = await fetch(url.toString(), { cache: "no-store" })
    if (!res.ok) return []
    const data = (await res.json()) as { accounts: string[] }
    return data.accounts.map((a) => ({ label: a, value: a }))
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DataTableSearch />
      <DataTableDateRangeFilter
        from={params.from}
        to={params.to}
        onChange={(next) =>
          setParams({ from: next.from || null, to: next.to || null, page: 1 })
        }
      />
      <DataTableFacetedFilter
        title="Accounts"
        selected={params.accounts}
        onChange={(next) =>
          setParams({ accounts: next.length ? next : null, page: 1 })
        }
        loadOptions={loadAccountOptions}
        emptyText="Type to search accounts."
      />
      <DataTableFacetedFilter
        title="Remarks Code"
        selected={params.remarks_codes}
        onChange={(next) =>
          setParams({ remarks_codes: next.length ? next : null, page: 1 })
        }
        options={remarksCodes.map((r) => ({ label: r, value: r }))}
      />
      {isFiltered && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setParams({
              q: null,
              from: null,
              to: null,
              accounts: null,
              remarks_codes: null,
              page: 1,
            })
          }
        >
          Reset
          <X data-icon="inline-end" />
        </Button>
      )}
      <div className="ml-auto flex items-center gap-2">
        <DataTableViewOptions table={table} />
        <DataTableExportMenu variant={variant} />
      </div>
    </div>
  )
}
