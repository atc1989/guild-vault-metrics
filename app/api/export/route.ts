import { NextResponse } from "next/server"

import { toCsv } from "@/lib/export/csv"
import { toXlsx } from "@/lib/export/excel"
import { toPdf } from "@/lib/export/pdf"
import { generateBir2307, parseQuarterParam } from "@/lib/export/bir2307"
import { exportColumnsFor } from "@/lib/export/columns"
import { CONTENT_TYPES, exportFilename } from "@/lib/export/filename"
import { getTransactions } from "@/lib/queries/transactions"
import type { TransactionVariant } from "@/lib/supabase/types"
import {
  DEFAULT_PAGE_SIZE,
  FORMATS,
  type ExportFormat,
  type TransactionFilters,
} from "@/lib/validations"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function parseVariant(raw: string | null): TransactionVariant {
  return raw === "credit" ? "credit" : "debit"
}

function parseFormat(raw: string | null): ExportFormat {
  if (raw && (FORMATS as readonly string[]).includes(raw)) {
    return raw as ExportFormat
  }
  return "csv"
}

function parseFilters(params: URLSearchParams): TransactionFilters {
  const accountsRaw = params.get("accounts") ?? ""
  const remarksRaw = params.get("remarks_codes") ?? ""
  return {
    q: params.get("q") ?? "",
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
    accounts: accountsRaw ? accountsRaw.split(",").filter(Boolean) : [],
    remarks_codes: remarksRaw ? remarksRaw.split(",").filter(Boolean) : [],
    page: 1,
    per_page: DEFAULT_PAGE_SIZE,
    sort: params.get("sort") ?? "DATE.desc",
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const variant = parseVariant(url.searchParams.get("variant"))
  const format = parseFormat(url.searchParams.get("format"))
  const filters = parseFilters(url.searchParams)

  try {
    if (format === "bir2307") {
      if (variant !== "credit") {
        return NextResponse.json(
          { error: "BIR 2307 export is available only on the credit tab." },
          { status: 400 }
        )
      }
      const atc = url.searchParams.get("atc") || undefined
      const rateRaw = url.searchParams.get("rate")
      const rate = rateRaw ? Number(rateRaw) : undefined
      const description = url.searchParams.get("description") || undefined
      const quarter = parseQuarterParam(url.searchParams.get("quarter"))

      const result = await generateBir2307({
        filters,
        atc,
        description,
        withholdingRate:
          typeof rate === "number" && Number.isFinite(rate) ? rate : undefined,
        quarter: quarter ?? undefined,
      })

      const headers = new Headers({
        "Content-Type": CONTENT_TYPES.bir2307,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Cache-Control": "no-store",
      })
      return new Response(new Uint8Array(result.pdf), { headers })
    }

    const columns = exportColumnsFor(variant)
    const { rows } = await getTransactions(variant, filters, {
      paginate: false,
    })

    const filename = exportFilename(variant, format)
    const headers = new Headers({
      "Content-Type": CONTENT_TYPES[format],
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    })

    if (format === "csv") {
      const csv = "﻿" + toCsv(columns, rows)
      return new Response(csv, { headers })
    }
    if (format === "xlsx") {
      const buf = await toXlsx(columns, rows)
      return new Response(new Uint8Array(buf), { headers })
    }
    const title =
      variant === "debit" ? "Debit Transactions" : "Credit Transactions"
    const buf = toPdf(columns, rows, title)
    return new Response(new Uint8Array(buf), { headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
