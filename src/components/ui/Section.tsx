import type { ReactNode } from 'react'

import { Button } from './Button'
import { Container } from './Container'

type Props = {
  id?: string
  eyebrow?: string
  title?: string
  action?: { href: string; label: string }
  tone?: 'default' | 'alt'
  children: ReactNode
}

/** Pembungkus section standar: judul, tombol "See more", dan latar selang-seling. */
export function Section({ id, eyebrow, title, action, tone = 'default', children }: Props) {
  return (
    <section id={id} className={tone === 'alt' ? 'bg-surface-alt' : ''} style={{ paddingBlock: 'var(--spacing-section)' }}>
      <Container>
        {(title || action) && (
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-link">{eyebrow}</p>}
              {title && <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>}
            </div>
            {action && (
              <Button href={action.href} variant="outline">
                {action.label}
              </Button>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  )
}
