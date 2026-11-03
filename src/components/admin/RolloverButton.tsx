'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

type PeriodOption = { id: number; label: string; year: number; status: string }

const field: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 4,
  background: 'var(--theme-input-bg)',
  color: 'var(--theme-text)',
}

/** Tombol "Mulai Periode Baru" di atas daftar Periode. Memanggil POST /api/periods/rollover. */
export function RolloverButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [periods, setPeriods] = useState<PeriodOption[]>([])
  const [from, setFrom] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear() + 1))
  const [label, setLabel] = useState('')
  const [cabinetName, setCabinetName] = useState('')
  const [copyMembers, setCopyMembers] = useState(true)
  const [activate, setActivate] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function openDialog() {
    setOpen(true)
    setError('')
    try {
      const res = await fetch('/api/periods?limit=100&sort=-year&depth=0', { credentials: 'include' })
      const json = await res.json()
      const docs = (json.docs ?? []) as PeriodOption[]
      setPeriods(docs)
      if (docs[0]) setFrom(String(docs.find((p) => p.status === 'active')?.id ?? docs[0].id))
    } catch {
      setError('Gagal memuat daftar periode.')
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/periods/rollover', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromPeriodId: Number(from),
          year: Number(year),
          label: label || `Kabinet ${year}`,
          cabinetName: cabinetName || undefined,
          copyMembers,
          activate,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Gagal membuat periode.')
      router.push(`/admin/collections/periods/${json.periodId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat periode.')
      setBusy(false)
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <button type="button" className="btn btn--style-primary btn--size-medium" onClick={openDialog}>
        Mulai Periode Baru
      </button>

      {open && (
        <form
          onSubmit={submit}
          style={{
            marginTop: 12,
            padding: 16,
            maxWidth: 520,
            display: 'grid',
            gap: 12,
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            background: 'var(--theme-elevation-50)',
          }}
        >
          <strong>Mulai Periode Baru</strong>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
            Membuat periode baru berstatus draft. Data periode lama tidak dihapus.
          </p>

          <label>
            Salin dari periode
            <select style={field} value={from} onChange={(e) => setFrom(e.target.value)} required>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.year} — {p.label} ({p.status})
                </option>
              ))}
            </select>
          </label>
          <label>
            Tahun baru
            <input style={field} type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
          </label>
          <label>
            Label
            <input style={field} value={label} onChange={(e) => setLabel(e.target.value)} placeholder={`Kabinet ${year}`} />
          </label>
          <label>
            Nama kabinet (opsional)
            <input style={field} value={cabinetName} onChange={(e) => setCabinetName(e.target.value)} />
          </label>
          <label>
            <input type="checkbox" checked={copyMembers} onChange={(e) => setCopyMembers(e.target.checked)} /> Salin
            keanggotaan sebagai titik awal
          </label>
          <label>
            <input type="checkbox" checked={activate} onChange={(e) => setActivate(e.target.checked)} /> Langsung
            aktifkan (periode aktif sekarang otomatis diarsipkan)
          </label>

          {error && (
            <p role="alert" style={{ margin: 0, color: 'var(--theme-error-500)' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn--style-primary btn--size-medium" disabled={busy}>
              {busy ? 'Memproses…' : 'Buat periode'}
            </button>
            <button type="button" className="btn btn--style-secondary btn--size-medium" onClick={() => setOpen(false)}>
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
