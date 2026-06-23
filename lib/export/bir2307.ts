import "server-only"

import { readFile } from "node:fs/promises"
import path from "node:path"
import { PDFDocument } from "pdf-lib"

import {
  getMonthlyTotals,
  getMonthlyTotalsByAccount,
} from "@/lib/queries/monthly"
import type { TransactionFilters } from "@/lib/validations"

export const DEFAULT_ATC = "WI515"
export const DEFAULT_DESCRIPTION = "Distributor Commission"
export const DEFAULT_WITHHOLDING_RATE = 0.05

export type Quarter = 1 | 2 | 3 | 4

export type QuarterOverride = { year: number; q: Quarter }

/** Parses a "YYYY-Q[1-4]" string into a {year, q} pair. */
export function parseQuarterParam(raw: string | null): QuarterOverride | null {
  if (!raw) return null
  const match = /^(\d{4})-Q([1-4])$/.exec(raw.trim())
  if (!match) return null
  return {
    year: Number(match[1]),
    q: Number(match[2]) as Quarter,
  }
}

const FIELDS = {
  periodFrom: "Text_1",
  periodTo: "Text_2",
  detailRows: Array.from({ length: 10 }, (_, i) => ({
    description: `Text_${18 + i}`,
    atc: `Text_${28 + i}`,
    m1: `Text_${39 + i}`,
    m2: `Text_${50 + i}`,
    m3: `Text_${61 + i}`,
    total: `Text_${72 + i}`,
    tax: `Text_${83 + i}`,
  })),
  totalRow: {
    m1: "Text_49",
    m2: "Text_60",
    m3: "Text_71",
    total: "Text_82",
    tax: "Text_93",
  },
} as const

function quarterOf(month: number): Quarter {
  if (month <= 3) return 1
  if (month <= 6) return 2
  if (month <= 9) return 3
  return 4
}

function quarterMonths(q: Quarter): [number, number, number] {
  const start = (q - 1) * 3 + 1
  return [start, start + 1, start + 2]
}

function quarterDates(year: number, q: Quarter) {
  const startMonth = (q - 1) * 3
  const start = new Date(Date.UTC(year, startMonth, 1))
  const end = new Date(Date.UTC(year, startMonth + 3, 0, 23, 59, 59))
  return { start, end }
}

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function formatMMDDYYYY(d: Date) {
  return `${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}${d.getUTCFullYear()}`
}

function formatAmount(n: number) {
  // Two leading spaces nudge the value off the left cell border so the
  // text doesn't visually touch the gridline.
  return `  ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function parseAnchor(filters: TransactionFilters): Date {
  const raw = filters.from || filters.to
  if (raw) {
    const d = new Date(`${raw}T00:00:00Z`)
    if (!Number.isNaN(d.getTime())) return d
  }
  return new Date()
}

function descriptionAccounts(description: string): string[] {
  if (!description || description === DEFAULT_DESCRIPTION) return []
  return description
    .split(",")
    .map((account) => account.trim())
    .filter(Boolean)
}

function displayAccountName(account: string): string {
  return account.replace(/\s*\[/, " [").trim() || account
}

type BirDetailRow = {
  description: string
  m1: number
  m2: number
  m3: number
}

function totalsForMonths(
  buckets: { month: number; total: number }[],
  months: [number, number, number]
): [number, number, number] {
  const byMonth = new Map(buckets.map((b) => [b.month, b.total]))
  return [
    byMonth.get(months[0]) ?? 0,
    byMonth.get(months[1]) ?? 0,
    byMonth.get(months[2]) ?? 0,
  ]
}

export type Bir2307Options = {
  filters: TransactionFilters
  atc?: string
  description?: string
  withholdingRate?: number
  /** Explicit quarter override; takes precedence over filter-derived quarter. */
  quarter?: QuarterOverride
}

export type Bir2307Result = {
  pdf: Uint8Array
  filename: string
  quarterLabel: string
  periodFrom: Date
  periodTo: Date
  monthly: { month: number; total: number }[]
  quarterTotal: number
  taxWithheld: number
}

export async function generateBir2307({
  filters,
  atc = DEFAULT_ATC,
  description = DEFAULT_DESCRIPTION,
  withholdingRate = DEFAULT_WITHHOLDING_RATE,
  quarter,
}: Bir2307Options): Promise<Bir2307Result> {
  let year: number
  let q: Quarter
  if (quarter) {
    year = quarter.year
    q = quarter.q
  } else {
    const anchor = parseAnchor(filters)
    year = anchor.getUTCFullYear()
    q = quarterOf(anchor.getUTCMonth() + 1)
  }
  const { start, end } = quarterDates(year, q)
  const [m1, m2, m3] = quarterMonths(q)

  // Always aggregate over the calendar quarter, not whatever range the
  // filter happened to set — keeps the 2307 valid even when the user's
  // date filter is a partial window.
  const range = {
    fromIso: start.toISOString(),
    toIso: end.toISOString(),
  }
  const selectedAccounts =
    filters.accounts.length > 0
      ? filters.accounts
      : descriptionAccounts(description)
  const detailRows: BirDetailRow[] = []
  if (selectedAccounts.length > 0) {
    const accountFilters = { ...filters, accounts: selectedAccounts }
    const accountBuckets = await getMonthlyTotalsByAccount(
      "credit",
      accountFilters,
      range
    )
    for (const account of selectedAccounts) {
      const [a1, a2, a3] = totalsForMonths(
        accountBuckets.filter((b) => b.account === account),
        [m1, m2, m3]
      )
      detailRows.push({
        description: displayAccountName(account),
        m1: a1,
        m2: a2,
        m3: a3,
      })
    }
  } else {
    const buckets = await getMonthlyTotals("credit", filters, range)
    const [a1, a2, a3] = totalsForMonths(buckets, [m1, m2, m3])
    detailRows.push({ description, m1: a1, m2: a2, m3: a3 })
  }

  const t1 = detailRows.reduce((sum, row) => sum + row.m1, 0)
  const t2 = detailRows.reduce((sum, row) => sum + row.m2, 0)
  const t3 = detailRows.reduce((sum, row) => sum + row.m3, 0)
  const quarterTotal = t1 + t2 + t3
  const taxWithheld = quarterTotal * withholdingRate

  if (detailRows.length > FIELDS.detailRows.length) {
    throw new Error(
      `BIR 2307 supports up to ${FIELDS.detailRows.length} account rows per form.`
    )
  }

  const templatePath = path.join(
    process.cwd(),
    "public",
    "templates",
    "bir-2307.pdf"
  )
  const bytes = await readFile(templatePath)
  const pdf = await PDFDocument.load(bytes)
  const form = pdf.getForm()

  const set = (name: string, value: string) => {
    try {
      form.getTextField(name).setText(value)
    } catch {
      // field name drifted — fail loud so we notice
      throw new Error(`BIR 2307 template is missing field: ${name}`)
    }
  }

  set(FIELDS.periodFrom, formatMMDDYYYY(start))
  set(FIELDS.periodTo, formatMMDDYYYY(end))

  detailRows.forEach((row, index) => {
    const rowTotal = row.m1 + row.m2 + row.m3
    const rowTax = rowTotal * withholdingRate
    const fields = FIELDS.detailRows[index]

    set(fields.description, row.description)
    set(fields.atc, atc)
    set(fields.m1, formatAmount(row.m1))
    set(fields.m2, formatAmount(row.m2))
    set(fields.m3, formatAmount(row.m3))
    set(fields.total, formatAmount(rowTotal))
    set(fields.tax, formatAmount(rowTax))
  })

  set(FIELDS.totalRow.m1, formatAmount(t1))
  set(FIELDS.totalRow.m2, formatAmount(t2))
  set(FIELDS.totalRow.m3, formatAmount(t3))
  set(FIELDS.totalRow.total, formatAmount(quarterTotal))
  set(FIELDS.totalRow.tax, formatAmount(taxWithheld))

  // Leave the form interactive — pdf-lib's flatten() trips on widget
  // appearance streams in this template ("Unexpected N type: undefined").
  // The filled values still render correctly in any PDF viewer.

  const out = await pdf.save()
  const quarterLabel = `Q${q}-${year}`

  return {
    pdf: out,
    filename: `BIR2307-${quarterLabel}.pdf`,
    quarterLabel,
    periodFrom: start,
    periodTo: end,
    monthly: [
      { month: m1, total: t1 },
      { month: m2, total: t2 },
      { month: m3, total: t3 },
    ],
    quarterTotal,
    taxWithheld,
  }
}
