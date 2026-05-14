"use client"

import { Download, FileSpreadsheet, FileText, FileType2 } from "lucide-react"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TransactionVariant } from "@/lib/supabase/types"
import type { ExportFormat } from "@/lib/validations"

const FORMATS: { format: ExportFormat; label: string; icon: typeof FileText }[] =
  [
    { format: "csv", label: "Export as CSV", icon: FileText },
    { format: "xlsx", label: "Export as Excel", icon: FileSpreadsheet },
    { format: "pdf", label: "Export as PDF", icon: FileType2 },
  ]

export function DataTableExportMenu({
  variant,
}: {
  variant: TransactionVariant
}) {
  const params = useSearchParams()
  const pathname = usePathname()

  function buildUrl(format: ExportFormat) {
    const url = new URL("/api/export", window.location.origin)
    params.forEach((value, key) => url.searchParams.set(key, value))
    url.searchParams.delete("page")
    url.searchParams.delete("per_page")
    url.searchParams.set("variant", variant)
    url.searchParams.set("format", format)
    return url.toString()
  }

  function triggerDownload(format: ExportFormat) {
    const url = buildUrl(format)
    toast.success(`Preparing ${format.toUpperCase()} export…`, {
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
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {pathname?.includes("credit") ? "Credit" : "Debit"} — all filtered rows
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {FORMATS.map(({ format, label, icon: Icon }) => (
            <DropdownMenuItem key={format} onSelect={() => triggerDownload(format)}>
              <Icon />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
