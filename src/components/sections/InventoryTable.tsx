'use client'

import { useMemo, useState } from 'react'

import { InventoryIcon } from '@/components/ui/InventoryIcon'
import { type ActiveLoan, availableQty, INVENTORY_LOCATIONS, locationLabel, type PublicItem, quantityLabel } from '@/lib/inventory'

const chip = 'border px-3 py-1.5 text-sm transition-colors'

/**
 * Tabel inventaris publik dengan ikon piksel per barang: cari nama, saring kategori/lokasi, dan opsi "hanya yang
 * bisa dipinjam" (dengan jumlah tersedia hari ini). Di layar sempit kolom kategori dan lokasi pindah ke bawah nama.
 */
export function InventoryTable({ items, loans }: { items: PublicItem[]; loans: ActiveLoan[] }) {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [location, setLocation] = useState('')
  const [loanOnly, setLoanOnly] = useState(false)

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const i of items) if (i.category) counts.set(i.category, (counts.get(i.category) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [items])

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return items.filter(
      (i) =>
        (!needle || i.name.toLowerCase().includes(needle)) &&
        (!category || i.category === category) &&
        (!location || i.location === location) &&
        (!loanOnly || i.loanable),
    )
  }, [items, q, category, location, loanOnly])

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="block min-w-0 flex-1 basis-60 text-sm font-medium">
          Cari barang
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="mis. infokus, kamera, banner"
            className="mt-1.5 block w-full border border-line bg-surface px-3 py-2.5 text-base focus:border-brand focus:outline-none"
          />
        </label>
        <label className="block text-sm font-medium">
          Lokasi
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1.5 block border border-line bg-surface px-3 py-2.5 text-base focus:border-brand focus:outline-none"
          >
            <option value="">Semua lokasi</option>
            {INVENTORY_LOCATIONS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 py-2.5 text-sm">
          <input type="checkbox" checked={loanOnly} onChange={(e) => setLoanOnly(e.target.checked)} className="size-4 accent-[var(--brand)]" />
          Hanya yang bisa dipinjam
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Kategori">
        <button type="button" onClick={() => setCategory(null)} aria-pressed={!category} className={`${chip} ${!category ? 'border-brand bg-brand text-on-brand' : 'border-line hover:border-brand'}`}>
          Semua <span className="opacity-70">{items.length}</span>
        </button>
        {categories.map(([c, n]) => (
          <button key={c} type="button" onClick={() => setCategory(c === category ? null : c)} aria-pressed={c === category} className={`${chip} ${c === category ? 'border-brand bg-brand text-on-brand' : 'border-line hover:border-brand'}`}>
            {c} <span className="opacity-70">{n}</span>
          </button>
        ))}
      </div>

      <p className="mt-5 font-mono text-xs text-ink-muted" aria-live="polite">
        {shown.length} dari {items.length} barang
      </p>

      <div className="mt-2 overflow-hidden border border-line">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-surface-alt text-left font-mono text-xs uppercase tracking-[0.12em] text-ink-muted">
            <tr>
              <th scope="col" className="px-3 py-3 font-medium sm:px-4">
                Barang
              </th>
              <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">
                Kategori
              </th>
              <th scope="col" className="px-3 py-3 text-right font-medium sm:px-4">
                Jumlah
              </th>
              <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">
                Lokasi
              </th>
              <th scope="col" className="px-3 py-3 font-medium sm:px-4">
                Peminjaman
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((i) => {
              const free = i.loanable ? availableQty(i, loans) : 0
              return (
                <tr key={i.id} className="bg-surface transition-colors hover:bg-surface-raised">
                  <td className="px-3 py-3 sm:px-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center border border-line bg-surface-alt text-link">
                        <InventoryIcon name={i.icon} className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium text-ink">
                          {i.name}
                          {i.procurement2025 && (
                            <span title="Pengadaan Kepengurusan 2025" className="ml-2 border border-line px-1.5 py-0.5 align-middle font-mono text-[0.65rem] text-ink-muted">
                              2025
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-ink-muted md:hidden">
                          {[i.category, locationLabel(i.location)].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-ink-muted md:table-cell">{i.category}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums sm:px-4">{quantityLabel(i)}</td>
                  <td className="hidden px-4 py-3 text-ink-muted lg:table-cell">{locationLabel(i.location)}</td>
                  <td className="px-3 py-3 sm:px-4">
                    {i.loanable ? (
                      <span className={`inline-block whitespace-nowrap border px-2 py-0.5 font-mono text-xs ${free > 0 ? 'border-brand text-link' : 'border-line text-ink-muted'}`}>
                        {free > 0 ? `${free} tersedia` : 'sedang dipinjam'}
                      </span>
                    ) : (
                      <span className="text-ink-muted" aria-label="Tidak dipinjamkan">
                        –
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                  Tidak ada barang yang cocok. Coba kata lain atau hapus saringan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
