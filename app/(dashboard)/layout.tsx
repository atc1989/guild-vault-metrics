import * as React from "react"

import { NavTabs } from "@/components/dashboard/nav-tabs"
import { SiteHeader } from "@/components/dashboard/site-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-6 lg:px-6">
        <React.Suspense fallback={<div className="h-10 border-b" />}>
          <NavTabs />
        </React.Suspense>
        <div className="pt-6">{children}</div>
      </div>
    </div>
  )
}
