import type { TransactionRow } from "@/lib/supabase/types"
import type { ExportColumn } from "./columns"

function escapeCell(value: unknown) {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (/[",\r\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export function toCsv(columns: ExportColumn[], rows: TransactionRow[]): string {
  const header = columns.map((c) => escapeCell(c.label)).join(",")
  const lines = rows.map((row) =>
    columns
      .map((c) => escapeCell((row as Record<string, unknown>)[c.key]))
      .join(",")
  )
  return [header, ...lines].join("\r\n")
}
