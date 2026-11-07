'use client'

import { useActionState, useEffect, useId, useRef, useState } from 'react'

import { type LetterField, letterAction } from '@/app/actions/letter'
import Link from '@/components/ui/AppLink'
import { InventoryIcon } from '@/components/ui/InventoryIcon'
import { type ActiveLoan, availableQty, dayOfInput, type PublicItem, quantityLabel } from '@/lib/inventory'

const input =
  'mt-1.5 block w-full border border-line bg-surface px-3 py-2.5 text-base text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand focus:outline-none aria-[invalid=true]:border-danger'

const MAX_MB = 5
const ACCEPT = '.pdf,.docx,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png'

type Props = {
  service: string
  serviceName: string
  /** Petunjuk isi surat khusus layanan ini. */
  hint?: string
  /** Peminjaman inventaris: barang yang bisa dipinjam dan peminjaman aktif (untuk sisa stok per tanggal). */
  loan?: { items: PublicItem[]; loans: ActiveLoan[] }
}

/**
 * Formulir pengajuan layanan organisasi dengan unggah surat (server action actions/letter.ts). Berkas dicek di
 * klien (jenis, ukuran) supaya cepat ketahuan, lalu divalidasi ulang di server. Setelah terkirim, pemohon
 * mendapat kode pelacakan untuk /layanan/lacak. Ada honeypot tersembunyi untuk menyaring bot.
 */
export function LetterRequestForm({ service, serviceName, hint, loan }: Props) {
  const id = useId()
  const form = useRef<HTMLFormElement>(null)
  const [result, formAction, pending] = useActionState(letterAction, null)
  const [dismissed, setDismissed] = useState<number | null>(null)
  const [file, setFile] = useState<{ name: string; size: number } | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const [qty, setQty] = useState<Record<number, number>>({})
  const [range, setRange] = useState({ from: '', to: '' })

  const error = result && !result.ok ? result : null
  const values = error?.values
  const sent = result?.ok && result.at !== dismissed ? result : null

  // React mengosongkan formulir setelah action selesai (berkas ikut hilang): samakan tampilannya, lalu fokus ke galat.
  useEffect(() => {
    if (!result) return
    setFile(null)
    if (!result.ok && result.field) form.current?.querySelector<HTMLElement>(`[name="${result.field}"]`)?.focus()
  }, [result])

  const pick = (f: File | undefined) => {
    setFileError(null)
    if (!f) return setFile(null)
    if (!/\.(pdf|docx|jpe?g|png)$/i.test(f.name)) setFileError('Berkas harus PDF, DOCX, JPG, atau PNG.')
    else if (f.size > MAX_MB * 1024 * 1024) setFileError(`Ukuran berkas maksimal ${MAX_MB} MB.`)
    setFile({ name: f.name, size: f.size })
  }

  if (sent) {
    return (
      <div role="status" className="border border-line bg-surface-raised p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-link">[ OK ] surat diterima</p>
        <p className="mt-2 font-display text-xl font-semibold">Pengajuan {serviceName.toLowerCase()} sudah masuk.</p>
        <p className="mt-3 text-ink-muted">Simpan kode pelacakan ini untuk mengecek status pengajuanmu:</p>
        <p className="mt-2 inline-block select-all border border-brand bg-brand-soft/40 px-4 py-2 font-mono text-lg font-semibold tracking-wider">{sent.trackingCode}</p>
        <p className="mt-3 text-sm text-ink-muted">Pengurus akan menghubungi {sent.email}. Status bisa dicek kapan saja dengan kode ini dan email yang sama.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/layanan/lacak" className="border border-brand bg-brand px-4 py-2.5 text-sm font-medium text-on-brand hover:bg-brand-strong">
            Lacak pengajuan
          </Link>
          <button
            type="button"
            onClick={() => {
              setDismissed(result?.at ?? null)
              setFile(null)
              setQty({})
              setRange({ from: '', to: '' })
            }}
            className="border border-line px-4 py-2.5 text-sm font-medium hover:border-brand"
          >
            Ajukan surat lain
          </button>
        </div>
      </div>
    )
  }

  const errId = (f: LetterField) => (error?.field === f ? `${id}-${f}-err` : undefined)
  const fieldError = (f: LetterField) =>
    error?.field === f ? (
      <p id={`${id}-${f}-err`} className="mt-1.5 text-sm text-danger">
        {error.error}
      </p>
    ) : null
  const text = (name: LetterField, label: string, opts: { required?: boolean; type?: string; autoComplete?: string; max?: number; placeholder?: string; wide?: boolean } = {}) => (
    <label className={`block text-sm font-medium ${opts.wide ? 'sm:col-span-2' : ''}`}>
      {label} <span className="text-ink-muted">({opts.required ? 'wajib' : 'opsional'})</span>
      <input
        name={name}
        type={opts.type ?? 'text'}
        defaultValue={values?.[name]}
        required={opts.required}
        autoComplete={opts.autoComplete}
        maxLength={opts.max}
        placeholder={opts.placeholder}
        className={input}
        aria-invalid={error?.field === name}
        aria-describedby={errId(name)}
      />
      {fieldError(name)}
    </label>
  )

  return (
    <form ref={form} action={formAction} noValidate className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="service" value={service} />
      {text('name', 'Nama pemohon', { required: true, autoComplete: 'name', max: 120 })}
      {text('organization', 'Organisasi / instansi', { required: true, autoComplete: 'organization', max: 160 })}
      {text('email', 'Email', { required: true, type: 'email', autoComplete: 'email', max: 254 })}
      {text('phone', 'WhatsApp', { type: 'tel', autoComplete: 'tel', max: 40, placeholder: '08xx' })}
      {text('subject', 'Perihal surat', { required: true, max: 200, wide: true })}
      {text('letterNumber', 'Nomor surat', { max: 120 })}
      {loan ? (
        <>
          <DateField name="loanFrom" label="Tanggal pinjam" value={range.from} min={todayInput()} onChange={(from) => setRange((r) => ({ ...r, from }))} error={error} errId={errId} fieldError={fieldError} />
          <DateField name="loanTo" label="Tanggal kembali" value={range.to} min={range.from || todayInput()} onChange={(to) => setRange((r) => ({ ...r, to }))} error={error} errId={errId} fieldError={fieldError} />
          <LoanPicker loan={loan} qty={qty} setQty={setQty} range={range} invalid={error?.field === 'items'} errorNode={fieldError('items')} />
        </>
      ) : (
        text('neededDate', 'Tanggal kegiatan / dibutuhkan', { type: 'date' })
      )}

      <div className="sm:col-span-2">
        <p className="text-sm font-medium">
          Surat <span className="text-ink-muted">(wajib · PDF, DOCX, JPG, atau PNG · maks. {MAX_MB} MB)</span>
        </p>
        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            const f = e.dataTransfer.files[0]
            if (f && fileInput.current) {
              const dt = new DataTransfer()
              dt.items.add(f)
              fileInput.current.files = dt.files
              pick(f)
            }
          }}
          className={`mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-1 border border-dashed px-4 py-8 text-center transition-colors ${
            drag ? 'border-brand bg-brand-soft/30' : error?.field === 'letter' || fileError ? 'border-danger' : 'border-line bg-surface hover:border-brand'
          }`}
        >
          <input
            ref={fileInput}
            name="letter"
            type="file"
            accept={ACCEPT}
            required
            className="sr-only"
            onChange={(e) => pick(e.target.files?.[0])}
            aria-invalid={error?.field === 'letter' || Boolean(fileError)}
            aria-describedby={[errId('letter'), fileError ? `${id}-file-err` : undefined].filter(Boolean).join(' ') || undefined}
          />
          {file ? (
            <>
              <span className="font-mono text-sm text-ink">{file.name}</span>
              <span className="text-xs text-ink-muted">{(file.size / 1024 / 1024).toFixed(2)} MB · klik untuk mengganti</span>
            </>
          ) : (
            <>
              <span className="font-medium text-link">Pilih berkas surat</span>
              <span className="text-xs text-ink-muted">atau tarik dan lepas di sini</span>
            </>
          )}
        </label>
        {fileError && (
          <p id={`${id}-file-err`} className="mt-1.5 text-sm text-danger">
            {fileError}
          </p>
        )}
        {fieldError('letter')}
      </div>

      <label className="block text-sm font-medium sm:col-span-2">
        Keterangan <span className="text-ink-muted">(opsional)</span>
        <textarea name="note" defaultValue={values?.note} rows={4} maxLength={1500} className={`${input} resize-y`} aria-invalid={error?.field === 'note'} aria-describedby={[errId('note'), `${id}-hint`].join(' ')} />
        <span id={`${id}-hint`} className="mt-1.5 block text-xs font-normal text-ink-muted">
          {hint ?? 'Tambahkan hal yang perlu pengurus tahu, mis. narahubung atau waktu pengambilan.'}
        </span>
        {fieldError('note')}
      </label>

      {/* Honeypot: tersembunyi dari manusia, sering diisi bot. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Situs web
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error && !error.field && (
        <p role="alert" className="text-sm text-danger sm:col-span-2">
          {error.error}
        </p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending || Boolean(fileError)}
          className="border border-brand bg-brand px-5 py-3 font-medium text-on-brand transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Mengunggah…' : 'Kirim surat'}
        </button>
      </div>
    </form>
  )
}

/** Tanggal hari ini (WITA) untuk atribut min input tanggal. */
function todayInput() {
  return new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10)
}

type FieldErr = { field?: LetterField } | null
function DateField(props: {
  name: 'loanFrom' | 'loanTo'
  label: string
  value: string
  min: string
  onChange: (v: string) => void
  error: FieldErr
  errId: (f: LetterField) => string | undefined
  fieldError: (f: LetterField) => React.ReactNode
}) {
  return (
    <label className="block text-sm font-medium">
      {props.label} <span className="text-ink-muted">(wajib)</span>
      <input
        name={props.name}
        type="date"
        required
        min={props.min}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className={input}
        aria-invalid={props.error?.field === props.name}
        aria-describedby={props.errId(props.name)}
      />
      {props.fieldError(props.name)}
    </label>
  )
}

/**
 * Katalog sekaligus pemilih barang: tiap barang yang bisa dipinjam tampil dengan ikon dan sisa stoknya untuk
 * tanggal yang dipilih (dihitung ulang saat tanggal berubah), plus tombol kurang/tambah. Jumlah dikirim sebagai
 * qty_<id> dan divalidasi ulang di server.
 */
function LoanPicker({
  loan,
  qty,
  setQty,
  range,
  invalid,
  errorNode,
}: {
  loan: NonNullable<Props['loan']>
  qty: Record<number, number>
  setQty: React.Dispatch<React.SetStateAction<Record<number, number>>>
  range: { from: string; to: string }
  invalid: boolean
  errorNode: React.ReactNode
}) {
  const from = range.from ? dayOfInput(range.from) : undefined
  const to = range.to ? dayOfInput(range.to) : from
  const picked = Object.values(qty).filter((n) => n > 0).length
  return (
    <fieldset className="sm:col-span-2" aria-invalid={invalid || undefined}>
      <legend className="text-sm font-medium">
        Barang yang dipinjam <span className="text-ink-muted">(wajib · sisa stok mengikuti tanggal yang dipilih)</span>
      </legend>
      <ul className={`mt-1.5 grid gap-px border bg-line sm:grid-cols-2 ${invalid ? 'border-danger' : 'border-line'}`}>
        {loan.items.map((item) => {
          const free = availableQty(item, loan.loans, from, to)
          const n = Math.min(qty[item.id] ?? 0, free)
          const set = (v: number) => setQty((q) => ({ ...q, [item.id]: Math.max(0, Math.min(free, v)) }))
          return (
            <li key={item.id} className={`flex items-center gap-3 p-3 ${n > 0 ? 'bg-brand-soft/25' : 'bg-surface'}`}>
              <span className="grid size-9 shrink-0 place-items-center border border-line bg-surface-alt text-link">
                <InventoryIcon name={item.icon} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{item.name}</span>
                <span className="block font-mono text-xs text-ink-muted">{free > 0 ? `${free} tersedia dari ${quantityLabel(item)}` : 'tidak tersedia'}</span>
              </span>
              <span className="flex shrink-0 items-center">
                <button type="button" onClick={() => set(n - 1)} disabled={n === 0} aria-label={`Kurangi ${item.name}`} className="grid size-9 place-items-center border border-line text-lg leading-none hover:border-brand disabled:opacity-40">
                  −
                </button>
                <span className="w-9 text-center font-mono text-sm tabular-nums" aria-live="polite" aria-label={`Jumlah ${item.name}`}>
                  {n}
                </span>
                <button type="button" onClick={() => set(n + 1)} disabled={n >= free} aria-label={`Tambah ${item.name}`} className="grid size-9 place-items-center border border-line text-lg leading-none hover:border-brand disabled:opacity-40">
                  +
                </button>
              </span>
              {n > 0 && <input type="hidden" name={`qty_${item.id}`} value={n} />}
            </li>
          )
        })}
      </ul>
      <p className="mt-1.5 flex flex-wrap justify-between gap-2 text-xs text-ink-muted">
        <span>{picked > 0 ? `${picked} jenis barang dipilih` : 'Belum ada barang dipilih'}</span>
        <Link href="/layanan/inventaris" className="text-link hover:underline">
          Lihat semua inventaris →
        </Link>
      </p>
      {errorNode}
    </fieldset>
  )
}

