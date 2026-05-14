import { ArrowDownRight, ArrowUpRight, Hash, Users } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { TransactionVariant } from "@/lib/supabase/types"

type Stats = {
  count: number
  totalAmount: number
  uniqueAccounts: number
  topRemarksCode: { code: string; count: number } | null
}

export function SummaryCards({
  stats,
  variant,
}: {
  stats: Stats
  variant: TransactionVariant
}) {
  const AmountIcon = variant === "debit" ? ArrowUpRight : ArrowDownRight
  const amountLabel = variant === "debit" ? "Total Debit" : "Total Credit"
  const amountHint =
    variant === "debit"
      ? "Sum of all debit amounts in the current filter."
      : "Sum of all credit amounts in the current filter."

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Hash className="size-4" />
            Transactions
          </CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatNumber(stats.count)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Total rows matching the current filter.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <AmountIcon className="size-4" />
            {amountLabel}
          </CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatCurrency(stats.totalAmount)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{amountHint}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Users className="size-4" />
            Unique Accounts
          </CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatNumber(stats.uniqueAccounts)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Distinct ACCOUNT values in the filter.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Top Remarks Code</CardDescription>
          <CardTitle className="text-base truncate">
            {stats.topRemarksCode?.code ?? "—"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topRemarksCode ? (
            <Badge variant="secondary" className="font-normal">
              {formatNumber(stats.topRemarksCode.count)} occurrences
            </Badge>
          ) : (
            <p className="text-xs text-muted-foreground">No data.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
