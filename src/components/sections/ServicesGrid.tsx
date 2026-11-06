import Link from '@/components/ui/AppLink'

import type { Service } from '@/payload-types'
import { Empty } from '../ui/Empty'

const GROUPS = [
  { value: 'organisasi', label: 'Organisasi' },
  { value: 'bisnis', label: 'Bisnis' },
] as const

/** Daftar layanan per kelompok. Urutan kelompok sama di Beranda dan halaman Layanan (konsisten). */
export function ServicesGrid({ services }: { services: Service[] }) {
  if (services.length === 0) return <Empty>Layanan belum diisi.</Empty>
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {GROUPS.map((g) => (
        <div key={g.value}>
          <h3 className="mb-3 font-display text-lg font-semibold">{g.label}</h3>
          <ul className="space-y-2">
            {services
              .filter((s) => s.group === g.value)
              .map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/layanan/${s.slug}`}
                    className="block rounded-control border border-line px-4 py-3 text-sm hover:border-brand hover:bg-brand-soft/40"
                  >
                    <span className="font-medium">{s.name}</span>
                    {s.summary && <span className="mt-0.5 block text-xs text-ink-muted">{s.summary}</span>}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
