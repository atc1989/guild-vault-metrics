"use client"

import type { Column } from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  EyeOff,
  Pin,
  PinOff,
} from "lucide-react"
import { useQueryState } from "nuqs"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { type SortableColumn } from "@/lib/validations"

type Direction = "asc" | "desc"

function parse(raw: string): { column: string; direction: Direction } {
  const [c, d] = raw.split(".") as [string, string | undefined]
  return { column: c ?? "", direction: d === "asc" ? "asc" : "desc" }
}

type Props<TData> = {
  column: Column<TData, unknown>
  sortKey?: SortableColumn
  label: string
  align?: "left" | "right"
}

export function DataTableColumnHeader<TData>({
  column,
  sortKey,
  label,
  align = "left",
}: Props<TData>) {
  const [sort, setSort] = useQueryState("sort", {
    defaultValue: "DATE.desc",
    shallow: false,
  })
  const parsed = parse(sort)
  const active = sortKey != null && parsed.column === sortKey
  const direction = active ? parsed.direction : null
  const pinned = column.getIsPinned()

  const ActiveIcon =
    direction === "asc"
      ? ArrowUp
      : direction === "desc"
        ? ArrowDown
        : ChevronsUpDown

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "-ml-2 h-8 data-[icon=inline-end]:pr-1.5",
            align === "right" && "ml-auto -mr-2"
          )}
        >
          {label}
          <ActiveIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align === "right" ? "end" : "start"} className="w-44">
        {sortKey && (
          <>
            <DropdownMenuItem onSelect={() => setSort(`${sortKey}.asc`)}>
              <ArrowUp />
              Sort asc
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSort(`${sortKey}.desc`)}>
              <ArrowDown />
              Sort desc
            </DropdownMenuItem>
          </>
        )}
        {column.getCanPin() && (
          <>
            {sortKey && <DropdownMenuSeparator />}
            {pinned !== "left" ? (
              <DropdownMenuItem onSelect={() => column.pin("left")}>
                <Pin />
                Pin to left
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => column.pin(false)}>
                <PinOff />
                Unpin
              </DropdownMenuItem>
            )}
            {pinned !== "right" ? (
              <DropdownMenuItem onSelect={() => column.pin("right")}>
                <Pin />
                Pin to right
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => column.pin(false)}>
                <PinOff />
                Unpin
              </DropdownMenuItem>
            )}
          </>
        )}
        {column.getCanHide() && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => column.toggleVisibility(false)}>
              <EyeOff />
              Hide column
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
