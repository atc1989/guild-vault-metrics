"use client"

import { AlertTriangle, RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isFetchFailed = /fetch failed|Missing Supabase env vars/i.test(
    error.message
  )

  return (
    <Empty className="mt-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangle />
        </EmptyMedia>
        <EmptyTitle>Couldn&apos;t load transactions</EmptyTitle>
        <EmptyDescription>
          {isFetchFailed ? (
            <>
              Supabase didn&apos;t respond. Check that{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                NEXT_PUBLIC_SUPABASE_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>{" "}
              are set correctly in{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                .env.local
              </code>
              , then restart the dev server.
            </>
          ) : (
            error.message
          )}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={reset} variant="outline">
          <RefreshCcw data-icon="inline-start" />
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  )
}
