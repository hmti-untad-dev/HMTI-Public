import { notFound } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { RichText } from '@/components/ui/RichText'
import { formatDate } from '@/lib/format'
import { getEditions, getProgram, mediaOf } from '@/lib/data'

type Props = { params: Promise<{ program: string; tahun: string }> }

export default async function EditionPage({ params }: Props) {
  const { program: slug, tahun } = await params
  const program = await getProgram(slug)
  if (!program) notFound()

  const editions = await getEditions(program.id)
  const edition = editions.find((e) => {
    const year = e.startDate ? new Date(e.startDate).getFullYear() : typeof e.period === 'object' ? e.period.year : null
    return String(year ?? e.id) === tahun
  })
  if (!edition) notFound()

  const album = typeof edition.album === 'object' ? edition.album : null

  return (
    <>
      <PageHeader eyebrow={program.name} title={edition.title}>
        {[formatDate(edition.startDate), edition.location].filter(Boolean).join(' · ')}
      </PageHeader>
      <Container className="space-y-8 py-12">
        <Img media={mediaOf(edition.cover)} label={edition.title} className="aspect-video w-full rounded-card" />
        {edition.description && <RichText data={edition.description} />}
        <div className="flex flex-wrap gap-3">
          {edition.registrationUrl && <Button href={edition.registrationUrl}>Daftar</Button>}
          {album && (
            <Link href={`/galeri/${album.slug}`} className="text-sm font-medium text-link hover:underline">
              Lihat album foto →
            </Link>
          )}
        </div>
      </Container>
    </>
  )
}
