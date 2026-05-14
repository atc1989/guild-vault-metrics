"use client"

import * as React from "react"
import { ThemeProvider } from "next-themes"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Tooltip as TooltipPrimitive } from "radix-ui"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipPrimitive.Provider delayDuration={300}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </TooltipPrimitive.Provider>
    </ThemeProvider>
  )
}
