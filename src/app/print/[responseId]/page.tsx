import PrintPageClient from '@/components/print/PrintPageClient'

export default async function PrintPage({
  params,
}: {
  params: Promise<{ responseId: string }>
}) {
  const { responseId } = await params
  return <PrintPageClient responseId={responseId} />
}
