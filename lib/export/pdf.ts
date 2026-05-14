import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

import type { TransactionRow } from "@/lib/supabase/types"
import type { ExportColumn } from "./columns"

export function toPdf(
  columns: ExportColumn[],
  rows: TransactionRow[],
  title: string
): Buffer {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })

  doc.setFontSize(14)
  doc.text(title, 40, 40)
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(`Generated ${new Date().toLocaleString()}`, 40, 58)
  doc.setTextColor(0)

  autoTable(doc, {
    startY: 80,
    head: [columns.map((c) => c.label)],
    body: rows.map((row) =>
      columns.map((c) => {
        const v = (row as Record<string, unknown>)[c.key]
        return v === null || v === undefined ? "" : String(v)
      })
    ),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [38, 38, 38] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 40, right: 40 },
  })

  return Buffer.from(doc.output("arraybuffer"))
}
