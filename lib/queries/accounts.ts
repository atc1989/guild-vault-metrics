import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  TRANSACTION_TABLES,
  type TransactionVariant,
} from "@/lib/supabase/types"

export async function searchAccounts(
  variant: TransactionVariant,
  q: string
): Promise<string[]> {
  const supabase = createSupabaseServerClient()
  const table = TRANSACTION_TABLES[variant]

  let query = supabase.from(table).select("ACCOUNT").not("ACCOUNT", "is", null)
  if (q.trim()) {
    query = query.ilike("ACCOUNT", `%${q.trim()}%`)
  }
  const { data, error } = (await query.limit(200)) as {
    data: { ACCOUNT: string | null }[] | null
    error: { message: string } | null
  }
  if (error) throw new Error(`searchAccounts failed: ${error.message}`)

  const seen = new Set<string>()
  for (const row of data ?? []) {
    if (row.ACCOUNT) seen.add(row.ACCOUNT)
  }
  return Array.from(seen).sort().slice(0, 50)
}

export async function listRemarksCodes(
  variant: TransactionVariant
): Promise<string[]> {
  const supabase = createSupabaseServerClient()
  const table = TRANSACTION_TABLES[variant]

  const { data, error } = (await supabase
    .from(table)
    .select("REMARKS_CODE")
    .not("REMARKS_CODE", "is", null)
    .limit(2000)) as {
    data: { REMARKS_CODE: string | null }[] | null
    error: { message: string } | null
  }
  if (error) throw new Error(`listRemarksCodes failed: ${error.message}`)

  const seen = new Set<string>()
  for (const row of data ?? []) {
    if (row.REMARKS_CODE) seen.add(row.REMARKS_CODE)
  }
  return Array.from(seen).sort()
}
