import { NextResponse } from "next/server"

import { searchAccounts } from "@/lib/queries/accounts"
import type { TransactionVariant } from "@/lib/supabase/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const variantParam = url.searchParams.get("variant")
  const variant: TransactionVariant =
    variantParam === "credit" ? "credit" : "debit"
  const q = url.searchParams.get("q") ?? ""

  try {
    const accounts = await searchAccounts(variant, q)
    return NextResponse.json({ accounts })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
