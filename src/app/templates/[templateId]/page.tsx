import BuilderPageClient from '@/components/templates/BuilderPageClient'

export default async function BuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ templateId: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { templateId } = await params
  const { tab } = await searchParams
  return <BuilderPageClient templateId={templateId} tab={tab} />
}
