"use client"

import * as React from "react"
import { Check, PlusCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export type FacetedOption = {
  label: string
  value: string
}

type FacetedFilterProps = {
  title: string
  selected: string[]
  onChange: (next: string[]) => void
  options?: FacetedOption[]
  /** When provided, options are fetched async based on the search query. */
  loadOptions?: (q: string) => Promise<FacetedOption[]>
  emptyText?: string
}

export function DataTableFacetedFilter({
  title,
  selected,
  onChange,
  options,
  loadOptions,
  emptyText = "No results.",
}: FacetedFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [asyncOptions, setAsyncOptions] = React.useState<FacetedOption[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!loadOptions || !open) return
    let cancelled = false
    setLoading(true)
    const t = setTimeout(() => {
      loadOptions(search)
        .then((opts) => {
          if (!cancelled) setAsyncOptions(opts)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [search, open, loadOptions])

  const available = React.useMemo(() => {
    const base = loadOptions ? asyncOptions : (options ?? [])
    const map = new Map(base.map((o) => [o.value, o]))
    for (const v of selected) {
      if (!map.has(v)) map.set(v, { label: v, value: v })
    }
    return Array.from(map.values())
  }, [loadOptions, asyncOptions, options, selected])

  const selectedSet = React.useMemo(() => new Set(selected), [selected])

  function toggle(value: string) {
    if (selectedSet.has(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed">
          <PlusCircle data-icon="inline-start" />
          {title}
          {selected.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selected.length}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selected.length > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selected.length} selected
                  </Badge>
                ) : (
                  selected.map((value) => (
                    <Badge
                      key={value}
                      variant="secondary"
                      className="rounded-sm px-1 font-normal max-w-[180px] truncate"
                    >
                      {value}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command shouldFilter={!loadOptions}>
          <CommandInput
            placeholder={title}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>{loading ? "Loading…" : emptyText}</CommandEmpty>
            <CommandGroup>
              {available.map((option) => {
                const isSelected = selectedSet.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggle(option.value)}
                    data-checked={isSelected}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="size-3.5" />
                    </div>
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selected.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
