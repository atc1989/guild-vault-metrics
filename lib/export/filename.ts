import type { ExportFormat } from "@/lib/validations"
import type { TransactionVariant } from "@/lib/supabase/types"

const EXT: Record<ExportFormat, string> = {
  csv: "csv",
  xlsx: "xlsx",
  pdf: "pdf",
  bir2307: "pdf",
}

export function exportFilename(
  variant: TransactionVariant,
  format: ExportFormat
) {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return `${variant}-transactions-${stamp}.${EXT[format]}`
}

export const CONTENT_TYPES: Record<ExportFormat, string> = {
  csv: "text/csv; charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
  bir2307: "application/pdf",
}
