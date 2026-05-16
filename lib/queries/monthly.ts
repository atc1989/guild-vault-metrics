import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  AMOUNT_COLUMNS,
  TRANSACTION_TABLES,
  type TransactionVariant,
} from "@/lib/supabase/types"
import type { TransactionFilters } from "@/lib/validations"

const SEARCH_COLUMNS = ["NAME", "USERNAME", "ACCOUNT", "REMARKS"] as const
const FETCH_LIMIT = 50_000

export type MonthlyTotal = {
  /** 1-based month number (1-12). */
  month: number
  total: number
}

/**
 * Aggregates the amount column by calendar month, scoped to the given
 * filter range. Used by the BIR 2307 generator to break the quarter
 * total into M1/M2/M3 buckets.
 */
export async function getMonthlyTotals(
  variant: TransactionVariant,
  filters: TransactionFilters,
  range: { fromIso: string; toIso: string }
): Promise<MonthlyTotal[]> {
  const supabase = createSupabaseServerClient()
  const table = TRANSACTION_TABLES[variant]
  const amountCol = AMOUNT_COLUMNS[variant]

  let query = supabase
    .from(table)
    .select(`DATE, ${amountCol}`)
    .gte("DATE", range.fromIso)
    .lte("DATE", range.toIso)
    .limit(FETCH_LIMIT)

  if (filters.q.trim()) {
    const term = `%${filters.q.trim().replace(/[(),]/g, " ")}%`
    const orExpr = SEARCH_COLUMNS.map((col) => `${col}.ilike.${term}`).join(",")
    query = query.or(orExpr)
  }
  if (filters.accounts.length > 0) {
    query = query.in("ACCOUNT", filters.accounts)
  }
  if (filters.remarks_codes.length > 0) {
    query = query.in("REMARKS_CODE", filters.remarks_codes)
  }

  const { data, error } = (await query) as {
    data: Array<Record<string, unknown>> | null
    error: { message: string } | null
  }
  if (error) throw new Error(`getMonthlyTotals failed: ${error.message}`)

  const buckets = new Map<number, number>()
  // Parse the month digits straight out of the timestamp string instead
  // of going through `new Date()`. The DATE column is stored without a
  // timezone (e.g. "2026-04-01T02:59:43") and the user views those values
  // as Philippine local time. If we let JS parse them, it interprets the
  // naked timestamp as local time on the *server* and converts to UTC for
  // `getUTCMonth()`, which silently pushes any record before ~08:00 PHT on
  // the 1st of a month into the previous month's bucket. Reading the
  // month digits literally gives us the "calendar month the user sees"
  // and matches what their SQL queries return.
  for (const row of data ?? []) {
    const dateRaw = row.DATE
    if (typeof dateRaw !== "string") continue
    const match = /^\d{4}-(\d{2})-/.exec(dateRaw)
    if (!match) continue
    const month = Number(match[1])
    if (!Number.isFinite(month) || month < 1 || month > 12) continue
    const amount = row[amountCol]
    const num =
      typeof amount === "number" ? amount : parseFloat(String(amount ?? 0))
    if (Number.isNaN(num)) continue
    buckets.set(month, (buckets.get(month) ?? 0) + num)
  }

  return Array.from(buckets.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month - b.month)
}
