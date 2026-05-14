import type { TransactionVariant } from "@/lib/supabase/types"

export type ExportColumn = {
  key: string
  label: string
  width?: number
}

export function exportColumnsFor(variant: TransactionVariant): ExportColumn[] {
  const amount = variant === "debit" ? "DEBIT" : "CREDIT"
  return [
    { key: "ID#", label: "ID#", width: 12 },
    { key: "DATE", label: "Date", width: 20 },
    { key: "NAME", label: "Name", width: 28 },
    { key: "USERNAME", label: "Username", width: 18 },
    { key: amount, label: variant === "debit" ? "Debit" : "Credit", width: 14 },
    { key: "REMARKS_CODE", label: "Remarks Code", width: 22 },
    { key: "ACCOUNT", label: "Account", width: 32 },
    { key: "REMARKS", label: "Remarks", width: 60 },
    { key: "SOURCE_FILE", label: "Source File", width: 30 },
  ]
}
