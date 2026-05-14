import ExcelJS from "exceljs"

import type { TransactionRow } from "@/lib/supabase/types"
import type { ExportColumn } from "./columns"

export async function toXlsx(
  columns: ExportColumn[],
  rows: TransactionRow[],
  sheetName = "Transactions"
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(sheetName)

  sheet.columns = columns.map((c) => ({
    header: c.label,
    key: c.key,
    width: c.width ?? 16,
  }))

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.alignment = { vertical: "middle" }

  for (const row of rows) {
    const out: Record<string, unknown> = {}
    for (const c of columns) {
      out[c.key] = (row as Record<string, unknown>)[c.key] ?? ""
    }
    sheet.addRow(out)
  }

  const buf = await workbook.xlsx.writeBuffer()
  return Buffer.from(buf as ArrayBuffer)
}
