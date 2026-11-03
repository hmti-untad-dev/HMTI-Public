import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@/styles/globals.css'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { getSiteSettings } from '@/lib/data'

// Konten berasal dari CMS dan berubah kapan saja; skeleton merender tiap request.
// Ganti ke ISR + revalidasi dari hook Payload bila trafik menuntut.
export const dynamic = 'force-dynamic'

// Dijalankan sebelum paint: pakai pilihan tersimpan, jika tidak ada ikuti pengaturan sistem.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    metadataBase: new URL(siteUrl),
    icons: { icon: '/brand/hmti-logo.webp', apple: '/brand/hmti-logo.webp' },
    title: { default: settings.orgFullName || 'HMTI', template: `%s | ${settings.orgName || 'HMTI'}` },
    description: settings.tagline || 'Situs resmi himpunan mahasiswa.',
    openGraph: {
      type: 'website',
      siteName: settings.orgName || 'HMTI',
      locale: 'id_ID',
      images: ['/brand/hmti-logo.webp'],
    },
  }
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings()
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <Navbar orgName={settings.orgName || 'HMTI'} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  )
}
