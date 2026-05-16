import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"

export const PAGE_SIZES = [10, 25, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 25

export const SORTABLE_COLUMNS = [
  "DATE",
  "NAME",
  "USERNAME",
  "REMARKS_CODE",
  "ACCOUNT",
  "amount",
] as const
export type SortableColumn = (typeof SORTABLE_COLUMNS)[number]

export const transactionsSearchParams = {
  q: parseAsString.withDefault(""),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  accounts: parseAsArrayOf(parseAsString, ",").withDefault([]),
  remarks_codes: parseAsArrayOf(parseAsString, ",").withDefault([]),
  page: parseAsInteger.withDefault(1),
  per_page: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  sort: parseAsString.withDefault("DATE.desc"),
}

export const searchParamsCache = createSearchParamsCache(
  transactionsSearchParams
)

export type TransactionFilters = {
  q: string
  from: string
  to: string
  accounts: string[]
  remarks_codes: string[]
  page: number
  per_page: number
  sort: string
}

export function parseSort(
  raw: string
): { column: SortableColumn; direction: "asc" | "desc" } {
  const [columnPart, directionPart] = raw.split(".") as [
    string,
    string | undefined,
  ]
  const column = (SORTABLE_COLUMNS as readonly string[]).includes(columnPart)
    ? (columnPart as SortableColumn)
    : "DATE"
  const direction = directionPart === "asc" ? "asc" : "desc"
  return { column, direction }
}

export const CURATED_CREDIT_REMARKS_CODES = [
  "5045-2 Fast 2 Furious Promo",
  "5027-Leadership",
  "5015-P2P-IN",
  "5002-Pairing Bonus",
] as const

export const CURATED_DEBIT_REMARKS_CODES = [
  "9003-GCASH",
  "9004-BDO BANK",
  "9005-METROBANK",
  "9006-BPI",
  "9010-EASTWEST",
  "9012-GOTYME",
  "9014-PAYMAYA",
  "9015-OTHERS",
] as const

export function curatedRemarksCodes(
  variant: "debit" | "credit"
): readonly string[] {
  return variant === "debit"
    ? CURATED_DEBIT_REMARKS_CODES
    : CURATED_CREDIT_REMARKS_CODES
}

export const FORMATS = ["csv", "xlsx", "pdf", "bir2307"] as const
export type ExportFormat = (typeof FORMATS)[number]

export const exportSearchParams = {
  ...transactionsSearchParams,
  format: parseAsStringEnum([...FORMATS]).withDefault("csv"),
  variant: parseAsStringEnum(["debit", "credit"]).withDefault("debit"),
}
