"use client"

import * as React from "react"
import {
  Download,
  FileBadge,
  FileSpreadsheet,
  FileText,
  FileType2,
} from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TransactionVariant } from "@/lib/supabase/types"
import type { ExportFormat } from "@/lib/validations"

const TABLE_FORMATS: {
  format: ExportFormat
  label: string
  icon: typeof FileText
}[] = [
  { format: "csv", label: "Export as CSV", icon: FileText },
  { format: "xlsx", label: "Export as Excel", icon: FileSpreadsheet },
  { format: "pdf", label: "Export as PDF", icon: FileType2 },
]

const BUSINESS_START_YEAR = 2025

type QuarterChoice = {
  year: number
  q: 1 | 2 | 3 | 4
  label: string
  param: string
  isCurrent: boolean
}

function quarterOf(month: number): 1 | 2 | 3 | 4 {
  return (month <= 3 ? 1 : month <= 6 ? 2 : month <= 9 ? 3 : 4) as
    | 1
    | 2
    | 3
    | 4
}

function buildQuarterChoices(): QuarterChoice[] {
  const now = new Date()
  const currentYear = now.getUTCFullYear()
  const currentMonth = now.getUTCMonth() + 1
  const currentQ = quarterOf(currentMonth)
  const choices: QuarterChoice[] = []
  for (let year = currentYear; year >= BUSINESS_START_YEAR; year--) {
    const maxQ = year === currentYear ? currentQ : 4
    for (let q = maxQ; q >= 1; q--) {
      choices.push({
        year,
        q: q as 1 | 2 | 3 | 4,
        label: `Q${q} ${year}`,
        param: `${year}-Q${q}`,
        isCurrent: year === currentYear && q === currentQ,
      })
    }
  }
  return choices
}

export function DataTableExportMenu({
  variant,
}: {
  variant: TransactionVariant
}) {
  const params = useSearchParams()
  const pathname = usePathname()

  const isCredit = variant === "credit"
  const quarterChoices = React.useMemo(() => buildQuarterChoices(), [])
  const selectedAccounts = React.useMemo(
    () =>
      params
        .getAll("accounts")
        .flatMap((value) => value.split(","))
        .filter(Boolean),
    [params]
  )
  const exportScopeLabel = selectedAccounts.length
    ? `${selectedAccounts.length} selected account${
        selectedAccounts.length === 1 ? "" : "s"
      }`
    : "all filtered rows"

  function buildUrl(format: ExportFormat, extra: Record<string, string> = {}) {
    const url = new URL("/api/export", window.location.origin)
    params.forEach((value, key) => url.searchParams.append(key, value))
    url.searchParams.delete("page")
    url.searchParams.delete("per_page")
    url.searchParams.set("variant", variant)
    url.searchParams.set("format", format)
    for (const [k, v] of Object.entries(extra)) {
      url.searchParams.set(k, v)
    }
    return url.toString()
  }

  function triggerDownload(
    format: ExportFormat,
    label: string,
    extra: Record<string, string> = {}
  ) {
    const url = buildUrl(format, extra)
    toast.success(`Preparing ${label}…`, {
      description: "Your download should start in a moment.",
    })
    window.location.assign(url)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download data-icon="inline-start" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {pathname?.includes("credit") ? "Credit" : "Debit"} — {exportScopeLabel}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {TABLE_FORMATS.map(({ format, label, icon: Icon }) => (
            <DropdownMenuItem
              key={format}
              onSelect={() => triggerDownload(format, label)}
            >
              <Icon />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {isCredit && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Tax forms
              {selectedAccounts.length > 0 && (
                <span className="block font-normal">
                  BIR 2307 lists selected accounts on separate rows.
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FileBadge />
                <div className="flex flex-col">
                  <span>BIR 2307</span>
                  <span className="text-xs text-muted-foreground">
                    WI515 · 5% · pick a quarter
                  </span>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-[200px]">
                {quarterChoices.map((choice) => (
                  <DropdownMenuItem
                    key={choice.param}
                    onSelect={() =>
                      triggerDownload(
                        "bir2307",
                        `BIR 2307 (${choice.label})`,
                        { quarter: choice.param }
                      )
                    }
                  >
                    <span>{choice.label}</span>
                    {choice.isCurrent && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        current
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
