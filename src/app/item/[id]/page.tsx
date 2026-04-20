// /item/[id] -- Borrower-facing item page (public, no auth)
// Server Component: fetch item by id from DB
// AVAILABLE -> render BorrowForm
// BORROWED  -> render ReturnButton + current borrower info
// Not found -> notFound()
export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <div>Item page for: {id} -- TODO</div>
}