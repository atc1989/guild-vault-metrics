import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  AMOUNT_COLUMNS,
  TRANSACTION_TABLES,
  type TransactionRow,
  type TransactionVariant,
} from "@/lib/supabase/types"
import { parseSort, type TransactionFilters } from "@/lib/validations"

const SEARCH_COLUMNS = ["NAME", "USERNAME", "ACCOUNT", "REMARKS"] as const
const STATS_FETCH_LIMIT = 50_000

type ListResult = {
  rows: TransactionRow[]
  total: number
}

type StatsResult = {
  count: number
  totalAmount: number
  uniqueAccounts: number
  topRemarksCode: { code: string; count: number } | null
}

type QueryBuilder = ReturnType<
  ReturnType<typeof createSupabaseServerClient>["from"]
>

function escapeForOr(value: string) {
  return value.replace(/[(),]/g, " ")
}

function applyFilters<T extends QueryBuilder>(
  query: T,
  filters: Omit<TransactionFilters, "page" | "per_page" | "sort">
): T {
  let q = query as QueryBuilder

  if (filters.q.trim()) {
    const term = `%${escapeForOr(filters.q.trim())}%`
    const orExpr = SEARCH_COLUMNS.map((col) => `${col}.ilike.${term}`).join(",")
    q = q.or(orExpr)
  }
  if (filters.from) q = q.gte("DATE", filters.from)
  if (filters.to) q = q.lte("DATE", filters.to)
  if (filters.accounts.length > 0) q = q.in("ACCOUNT", filters.accounts)
  if (filters.remarks_codes.length > 0)
    q = q.in("REMARKS_CODE", filters.remarks_codes)

  return q as T
}

export async function getTransactions(
  variant: TransactionVariant,
  filters: TransactionFilters,
  options: { paginate?: boolean } = { paginate: true }
): Promise<ListResult> {
  const supabase = createSupabaseServerClient()
  const table = TRANSACTION_TABLES[variant]
  const amountCol = AMOUNT_COLUMNS[variant]
  const { column, direction } = parseSort(filters.sort)
  const sortColumn = column === "amount" ? amountCol : column

  let query = supabase
    .from(table)
    .select("*", { count: "exact" })
    .order(sortColumn, { ascending: direction === "asc" })

  query = applyFilters(query, filters)

  if (options.paginate !== false) {
    const from = (filters.page - 1) * filters.per_page
    const to = from + filters.per_page - 1
    query = query.range(from, to)
  } else {
    query = query.limit(STATS_FETCH_LIMIT)
  }

  const { data, error, count } = await query
  if (error) throw new Error(`getTransactions failed: ${error.message}`)

  return {
    rows: (data ?? []) as TransactionRow[],
    total: count ?? 0,
  }
}

export async function getTransactionStats(
  variant: TransactionVariant,
  filters: TransactionFilters
): Promise<StatsResult> {
  const supabase = createSupabaseServerClient()
  const table = TRANSACTION_TABLES[variant]
  const amountCol = AMOUNT_COLUMNS[variant]

  const countQuery = applyFilters(
    supabase.from(table).select("*", { count: "exact", head: true }),
    filters
  )
  const { count, error: countErr } = await countQuery
  if (countErr) throw new Error(`stats count failed: ${countErr.message}`)

  const sampleQuery = applyFilters(
    supabase
      .from(table)
      .select(`${amountCol}, ACCOUNT, REMARKS_CODE`)
      .limit(STATS_FETCH_LIMIT),
    filters
  )
  const { data: sample, error: sampleErr } = await sampleQuery
  if (sampleErr) throw new Error(`stats sample failed: ${sampleErr.message}`)

  let totalAmount = 0
  const accounts = new Set<string>()
  const remarksCounts = new Map<string, number>()

  for (const row of sample ?? []) {
    const rawAmount = (row as Record<string, unknown>)[amountCol]
    const num =
      typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount))
    if (!Number.isNaN(num)) totalAmount += num

    const account = (row as Record<string, unknown>).ACCOUNT
    if (typeof account === "string" && account) accounts.add(account)

    const rc = (row as Record<string, unknown>).REMARKS_CODE
    if (typeof rc === "string" && rc) {
      remarksCounts.set(rc, (remarksCounts.get(rc) ?? 0) + 1)
    }
  }

  let topRemarksCode: StatsResult["topRemarksCode"] = null
  for (const [code, c] of remarksCounts) {
    if (!topRemarksCode || c > topRemarksCode.count) {
      topRemarksCode = { code, count: c }
    }
  }

  return {
    count: count ?? 0,
    totalAmount,
    uniqueAccounts: accounts.size,
    topRemarksCode,
  }
}
