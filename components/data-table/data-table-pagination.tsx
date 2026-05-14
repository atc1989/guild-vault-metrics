"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useQueryStates } from "nuqs"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { transactionsSearchParams, PAGE_SIZES } from "@/lib/validations"

type Props = {
  total: number
}

export function DataTablePagination({ total }: Props) {
  const [{ page, per_page }, setParams] = useQueryStates(
    {
      page: transactionsSearchParams.page,
      per_page: transactionsSearchParams.per_page,
    },
    { shallow: false }
  )
  const totalPages = Math.max(1, Math.ceil(total / per_page))
  const current = Math.min(page, totalPages)

  const start = total === 0 ? 0 : (current - 1) * per_page + 1
  const end = Math.min(current * per_page, total)

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-4 px-2 py-3 sm:flex-row">
      <div className="text-sm text-muted-foreground">
        {total === 0
          ? "0 results"
          : `Showing ${start.toLocaleString()}–${end.toLocaleString()} of ${total.toLocaleString()}`}
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page</span>
          <Select
            value={String(per_page)}
            onValueChange={(v) => setParams({ per_page: Number(v), page: 1 })}
          >
            <SelectTrigger size="sm" className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm">
          Page {current} of {totalPages}
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setParams({ page: 1 })}
            disabled={current <= 1}
            aria-label="First page"
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setParams({ page: current - 1 })}
            disabled={current <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setParams({ page: current + 1 })}
            disabled={current >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setParams({ page: totalPages })}
            disabled={current >= totalPages}
            aria-label="Last page"
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
