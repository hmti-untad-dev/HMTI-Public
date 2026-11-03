import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@/styles/globals.css'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { getSiteSettings } from '@/lib/data'

// Konten berasal dari CMS dan berubah kapan saja; skeleton merender tiap request.
// Ganti ke ISR + revalidasi dari hook Payload bila trafik menuntut.
export const dynamic = 'force-dynamic'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    metadataBase: new URL(siteUrl),
    title: { default: settings.orgFullName || 'HMTI', template: `%s | ${settings.orgName || 'HMTI'}` },
    description: settings.tagline || 'Situs resmi himpunan mahasiswa.',
    openGraph: { type: 'website', siteName: settings.orgName || 'HMTI', locale: 'id_ID' },
  }
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings()
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col">
        <Navbar orgName={settings.orgName || 'HMTI'} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  )
}
