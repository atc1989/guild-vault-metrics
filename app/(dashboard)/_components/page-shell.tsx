import * as React from "react"

import { DataTable } from "@/components/data-table/data-table"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { SummaryCardsSkeleton } from "@/components/dashboard/summary-cards-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { listRemarksCodes } from "@/lib/queries/accounts"
import {
  getTransactionStats,
  getTransactions,
} from "@/lib/queries/transactions"
import type { TransactionVariant } from "@/lib/supabase/types"
import {
  curatedRemarksCodes,
  type TransactionFilters,
} from "@/lib/validations"

async function StatsBlock({
  variant,
  filters,
}: {
  variant: TransactionVariant
  filters: TransactionFilters
}) {
  const stats = await getTransactionStats(variant, filters)
  return <SummaryCards stats={stats} variant={variant} />
}

async function TableBlock({
  variant,
  filters,
}: {
  variant: TransactionVariant
  filters: TransactionFilters
}) {
  const [{ rows, total }, remarksCodes] = await Promise.all([
    getTransactions(variant, filters),
    listRemarksCodes(variant),
  ])
  const mergedRemarksCodes = Array.from(
    new Set([...curatedRemarksCodes(variant), ...remarksCodes])
  ).sort()
  return (
    <DataTable
      data={rows}
      total={total}
      variant={variant}
      remarksCodes={mergedRemarksCodes}
    />
  )
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-[280px]" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-[480px] w-full rounded-lg" />
    </div>
  )
}

export function TransactionPage({
  variant,
  filters,
}: {
  variant: TransactionVariant
  filters: TransactionFilters
}) {
  const heading = variant === "debit" ? "Debit History" : "Credit History"
  const description =
    variant === "debit"
      ? "All debit transactions across imported source files."
      : "All credit (bonus) transactions across imported source files."

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      <React.Suspense fallback={<SummaryCardsSkeleton />}>
        <StatsBlock variant={variant} filters={filters} />
      </React.Suspense>

      <React.Suspense fallback={<TableSkeleton />}>
        <TableBlock variant={variant} filters={filters} />
      </React.Suspense>
    </div>
  )
}
