import type { ReactNode } from 'react'

import { Container } from './Container'
import { DecodeText } from './DecodeText'

/**
 * Judul halaman dalam (non-beranda). Isinya masuk berurutan saat halaman dibuka ([data-enter] di globals.css),
 * label kecilnya "terdekripsi" seperti di beranda. Teks utuh selalu ada di HTML.
 */
export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="border-b border-line bg-surface-alt py-12">
      <Container>
        <div data-enter>
          {eyebrow && (
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-link">
              <DecodeText text={eyebrow} />
            </p>
          )}
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
          {children && <div className="mt-3 max-w-2xl text-ink-muted">{children}</div>}
        </div>
      </Container>
    </header>
  )
}
