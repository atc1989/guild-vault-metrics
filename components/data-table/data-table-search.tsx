"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { useQueryState } from "nuqs"

import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

export function DataTableSearch() {
  const [serverQ, setServerQ] = useQueryState("q", {
    defaultValue: "",
    shallow: false,
  })
  const [local, setLocal] = React.useState(serverQ)

  React.useEffect(() => {
    setLocal(serverQ)
  }, [serverQ])

  React.useEffect(() => {
    if (local === serverQ) return
    const t = setTimeout(() => {
      setServerQ(local || null)
    }, 350)
    return () => clearTimeout(t)
  }, [local, serverQ, setServerQ])

  return (
    <InputGroup className="h-8 max-w-[280px]">
      <InputGroupAddon>
        <Search className="size-4 opacity-50" />
      </InputGroupAddon>
      <InputGroupInput
        placeholder="Search name, account, remarks…"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
      {local && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            onClick={() => setLocal("")}
            aria-label="Clear search"
          >
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
