import FillPageClient from '@/components/fill/FillPageClient'

export default async function FillPage({
  params,
}: {
  params: Promise<{ templateId: string; responseId: string }>
}) {
  const { templateId, responseId } = await params
  return <FillPageClient templateId={templateId} responseId={responseId} />
}
