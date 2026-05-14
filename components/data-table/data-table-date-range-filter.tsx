"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import type { DateRange } from "react-day-picker"
import { CalendarIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

type Props = {
  from: string
  to: string
  onChange: (next: { from: string; to: string }) => void
}

function safeParse(value: string): Date | undefined {
  if (!value) return undefined
  try {
    const d = parseISO(value)
    return Number.isNaN(d.getTime()) ? undefined : d
  } catch {
    return undefined
  }
}

export function DataTableDateRangeFilter({ from, to, onChange }: Props) {
  const [open, setOpen] = React.useState(false)
  const fromDate = safeParse(from)
  const toDate = safeParse(to)
  const hasRange = Boolean(fromDate || toDate)

  function handleSelect(range: DateRange | undefined) {
    onChange({
      from: range?.from ? format(range.from, "yyyy-MM-dd") : "",
      to: range?.to ? format(range.to, "yyyy-MM-dd") : "",
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed">
          <CalendarIcon data-icon="inline-start" />
          {hasRange ? (
            <>
              <span className="hidden sm:inline">
                {fromDate ? format(fromDate, "MMM d, y") : "—"}
                {" → "}
                {toDate ? format(toDate, "MMM d, y") : "—"}
              </span>
              <span className="sm:hidden">Date</span>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear date range"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange({ from: "", to: "" })
                }}
                className="inline-flex items-center"
              >
                <X className="size-3.5 opacity-60 hover:opacity-100" />
              </span>
            </>
          ) : (
            "Date range"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          defaultMonth={fromDate ?? new Date()}
          selected={{ from: fromDate, to: toDate }}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
