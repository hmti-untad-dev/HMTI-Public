import type { Metadata } from 'next'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'

import '@/styles/globals.css'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { BootScreen } from '@/components/boot/BootScreen'
import { TransitionPage } from '@/components/page-transition/page-transition'
import { StripeTransition } from '@/components/stripe-transition/stripe-transition'
import { HeatTrail } from '@/components/layout/HeatTrail'
import { Interactions } from '@/components/layout/Interactions'
import { SelectionChip } from '@/components/layout/SelectionChip'
import { SmoothScroll } from '@/components/layout/SmoothScroll'
import { SleepyOverlay } from '@/components/mascot/SleepyOverlay'
import { BackToTop } from '@/components/ui/BackToTop'
import { getNavData, getSiteSettings } from '@/lib/data'

// Konten berasal dari CMS dan berubah kapan saja; skeleton merender tiap request.
// Ganti ke ISR + revalidasi dari hook Payload bila trafik menuntut.
export const dynamic = 'force-dynamic'

// Dijalankan sebelum paint: pakai pilihan tersimpan, jika tidak ada ikuti pengaturan sistem.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`

// Tirai pembuka (<= 1 detik) tampil di setiap muat penuh halaman (buka tab, refresh), tidak saat pindah halaman
// lewat menu (layout tidak dimuat ulang). Tidak tampil bila pengguna memilih gerak dikurangi.
// data-intro dipakai CSS untuk menunda animasi masuk dan tidak pernah berubah; data-boot berubah ke "done" oleh BootScreen.
const bootScript = `(function(){var d=document.documentElement;try{if(matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.boot='skip';return}d.dataset.boot='running';d.dataset.intro='boot'}catch(e){d.dataset.boot='skip'}})()`

const envUrl = process.env.NEXT_PUBLIC_SITE_URL

/**
 * Alamat dasar untuk URL absolut di meta (og:image wajib absolut agar WhatsApp dkk. bisa mengambil gambarnya).
 * Pakai NEXT_PUBLIC_SITE_URL bila sudah diisi domain sungguhan; selain itu ikuti host permintaan, sehingga
 * pratinjau tetap benar lewat tunnel Cloudflare atau domain sementara.
 */
async function siteBase(): Promise<URL> {
  if (envUrl && !/localhost|127\.0\.0\.1/.test(envUrl)) return new URL(envUrl)
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (!host) return new URL(envUrl || 'http://localhost:3000')
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host)
  const proto = h.get('x-forwarded-proto')?.split(',')[0] ?? (local ? 'http' : 'https')
  return new URL(`${proto}://${host}`)
}

export async function generateMetadata(): Promise<Metadata> {
  const [settings, base] = await Promise.all([getSiteSettings(), siteBase()])
  const title = settings.orgFullName || 'HMTI'
  const description = settings.tagline || 'Situs resmi himpunan mahasiswa.'
  return {
    metadataBase: base,
    icons: { icon: '/brand/hmti-logo.webp', apple: '/brand/hmti-logo.webp' },
    title: { default: title, template: `%s | ${settings.orgName || 'HMTI'}` },
    description,
    // Gambar pratinjau dari opengraph-image.tsx / twitter-image.tsx di folder ini. Judul og sengaja tidak diisi
    // agar aplikasi memakai <title> tiap halaman.
    openGraph: { type: 'website', siteName: settings.orgName || 'HMTI', locale: 'id_ID' },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, nav] = await Promise.all([getSiteSettings(), getNavData()])
  return (
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <BootScreen />
        {/* Transisi pindah halaman (Atelier Stripe Transition): tirai garis menutup lalu membuka halaman baru.
            Semua tautan internal memakai AppLink -> TransitionLink. */}
        <StripeTransition color="#151515" stripes={8} segments={6} duration={0.5} stagger={0.025}>
          <div className="scroll-progress" aria-hidden="true" />
          <SmoothScroll />
          <Interactions />
          <HeatTrail />
          <SelectionChip />
          <Navbar orgName={settings.orgName || 'HMTI'} departments={nav.departments} archivedYears={nav.archivedYears} />
          <main className="flex-1">
            <TransitionPage>{children}</TransitionPage>
          </main>
          <Footer settings={settings} />
          <BackToTop />
          <SleepyOverlay />
        </StripeTransition>
      </body>
    </html>
  )
}
