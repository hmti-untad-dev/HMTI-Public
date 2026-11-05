import Link from 'next/link'

import { CREDIT, MOTTO } from '@/content/tentang'
import type { SiteSetting } from '@/payload-types'
import { JTI_URL, NAV_ITEMS } from '@/lib/nav'
import { Teemo } from '../mascot/Teemo'
import { Container } from '../ui/Container'
import { SocialIcon } from '../ui/SocialIcon'
import { AsciiWordmark } from './AsciiWordmark'
import { ThemeSwitch } from './ThemeSwitch'

const colTitle = 'mb-4 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink-muted'
const link = 'link-slide inline-block py-1.5 text-sm text-ink transition-colors hover:text-link'

export function Footer({ settings }: { settings: SiteSetting }) {
  const { contact, socials } = settings
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <Container className="pt-10">
        <AsciiWordmark text={settings.orgName || 'HMTI UNTAD'} />
      </Container>

      {/* Ajakan singkat sebelum kolom tautan: dua tujuan yang paling sering dicari pengunjung luar. */}
      <Container className="pt-10">
        <div className="flex flex-col gap-4 border-y border-line py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl font-display text-xl font-bold sm:text-2xl">Punya ide kolaborasi atau butuh bantuan teknologi?</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/layanan" className="inline-flex items-center bg-brand px-4 py-2.5 text-sm font-medium text-on-brand transition-colors hover:bg-brand-strong">
              Lihat layanan
            </Link>
            <Link href="/kontak#pesan" className="inline-flex items-center border border-brand px-4 py-2.5 text-sm font-medium text-link transition-colors hover:bg-brand-soft/50">
              Kirim pesan
            </Link>
          </div>
        </div>
      </Container>

      <Container className="grid gap-10 pb-20 pt-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.2fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/untad-logo.webp" alt="Universitas Tadulako" width={48} height={48} className="size-12 object-contain" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/hmti-logo.webp" alt="HMTI UNTAD" width={48} height={48} className="size-12 rounded-full" />
          </div>
          <p className="mt-4 max-w-xs text-sm text-ink-muted">{settings.orgFullName}</p>
          <p className="mt-2 font-display text-sm font-bold">{settings.motto || MOTTO}</p>
        </div>

        <nav aria-label="Tautan footer">
          <p className={colTitle}>Jelajahi</p>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className={colTitle}>Kontak</p>
          <address className="space-y-1.5 text-sm not-italic text-ink">
            {contact?.address && <p>{contact.address}</p>}
            {contact?.email && (
              <p>
                <a href={`mailto:${contact.email}`} className="transition-colors hover:text-link">
                  {contact.email}
                </a>
              </p>
            )}
            {contact?.phone && <p>{contact.phone}</p>}
          </address>
          <p className={`${colTitle} mt-8`}>Terkait</p>
          <ul>
            <li>
              <a href={JTI_URL} target="_blank" rel="noopener noreferrer" className={link}>
                Jurusan Teknologi Informasi ↗
              </a>
            </li>
            <li>
              <a href="https://untad.ac.id/" target="_blank" rel="noopener noreferrer" className={link}>
                Universitas Tadulako ↗
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className={colTitle}>Ikuti kami</p>
          {socials && socials.length > 0 ? (
            <ul className="flex flex-wrap gap-2.5">
              {socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    className="flex size-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-brand hover:text-link"
                  >
                    <SocialIcon platform={s.platform} />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">Akun sosial belum diisi.</p>
          )}
          <div className="mt-6">
            <ThemeSwitch />
          </div>
        </div>
      </Container>

      <div className="relative border-t border-line">
        <Container className="relative flex flex-col gap-3 py-5 text-xs text-ink-muted sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Teemo className="absolute bottom-full left-4 sm:left-6" />
          <p>
            © {new Date().getFullYear()} {settings.orgName}. Seluruh hak cipta dilindungi.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            <li>
              <Link href="/tentang#dokumen" className="hover:text-ink">
                AD/ART dan GBHO
              </Link>
            </li>
            <li>
              <Link href="/aspirasi" className="hover:text-ink">
                Aspirasi
              </Link>
            </li>
            <li>
              <Link href="/layanan/lacak" className="hover:text-ink">
                Lacak permintaan
              </Link>
            </li>
          </ul>
          <p className="w-full border-t border-line pt-3 font-mono text-[0.68rem] tracking-[0.06em]">{CREDIT}</p>
        </Container>
      </div>
    </footer>
  )
}
