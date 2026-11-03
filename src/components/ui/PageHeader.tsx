import type { ReactNode } from 'react'

import { Container } from './Container'

/** Judul halaman dalam (non-beranda). */
export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="border-b border-line bg-surface-alt py-12">
      <Container>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-brand">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        {children && <div className="mt-3 max-w-2xl text-ink-muted">{children}</div>}
      </Container>
    </header>
  )
}
