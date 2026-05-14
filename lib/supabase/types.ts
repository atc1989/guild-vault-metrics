export type TransactionVariant = "debit" | "credit"

export const TRANSACTION_TABLES = {
  debit: "debit_transactions",
  credit: "bonus_transactions",
} as const

export const AMOUNT_COLUMNS = {
  debit: "DEBIT",
  credit: "CREDIT",
} as const

export type TransactionTable =
  (typeof TRANSACTION_TABLES)[TransactionVariant]

export type TransactionRow = {
  id: number
  "ID#": number
  DATE: string
  NAME: string | null
  USERNAME: string | null
  REMARKS_CODE: string | null
  ACCOUNT: string | null
  REMARKS: string | null
  SOURCE_FILE: string | null
  created_at: string
  DEBIT?: string | number | null
  CREDIT?: string | number | null
}

export type Database = {
  public: {
    Tables: {
      debit_transactions: {
        Row: TransactionRow & { DEBIT: string | number | null }
      }
      bonus_transactions: {
        Row: TransactionRow & { CREDIT: string | number | null }
      }
    }
  }
}
