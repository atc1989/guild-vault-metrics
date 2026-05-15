import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Coins,
  Hash,
  Percent,
  Users,
} from "lucide-react"

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

const WITHHOLDING_RATE = 0.05

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
      ? "Net — sum of debit amounts in the current filter."
      : "Net — sum of credit amounts in the current filter."

  const grossCommission = stats.totalAmount / (1 - WITHHOLDING_RATE)
  const withholdingTax = grossCommission - stats.totalAmount

  const grossHint = `${amountLabel} ÷ (1 − 5%) — grossed up from ${amountLabel}.`

  const gridClass =
    "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"

  return (
    <div className={gridClass}>
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
            <Coins className="size-4" />
            Gross Commission
          </CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatCurrency(grossCommission)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{grossHint}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Percent className="size-4" />
            Withholding Tax
          </CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatCurrency(withholdingTax)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            5% withheld on the gross commission.
          </p>
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
          <CardDescription className="flex items-center gap-2">
            <Award className="size-4" />
            Top Remarks Code
          </CardDescription>
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
