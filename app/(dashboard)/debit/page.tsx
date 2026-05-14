import { searchParamsCache } from "@/lib/validations"
import { TransactionPage } from "../_components/page-shell"

type SearchParams = Record<string, string | string[] | undefined>

export default async function DebitPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const filters = searchParamsCache.parse(await searchParams)
  return <TransactionPage variant="debit" filters={filters} />
}
