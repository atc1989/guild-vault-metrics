"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"

const TABS = [
  { href: "/debit", label: "Debit History" },
  { href: "/credit", label: "Credit History" },
] as const

export function NavTabs() {
  const pathname = usePathname()
  const params = useSearchParams()
  const qs = params.toString()
  const search = qs ? `?${qs}` : ""

  return (
    <nav className="flex gap-1 border-b">
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={`${tab.href}${search}`}
            className={cn(
              "relative inline-flex h-10 items-center px-4 text-sm font-medium transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
