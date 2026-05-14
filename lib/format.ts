const PHP = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 2,
})

const COMPACT = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const NUMBER = new Intl.NumberFormat("en-US")

export function formatCurrency(value: number | string | null | undefined) {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? 0))
  return PHP.format(Number.isFinite(num) ? num : 0)
}

export function formatCompact(value: number) {
  return COMPACT.format(value)
}

export function formatNumber(value: number) {
  return NUMBER.format(value)
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDate(value: string | null | undefined) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
}
