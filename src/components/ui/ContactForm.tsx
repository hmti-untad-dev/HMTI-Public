'use client'

import { useActionState, useEffect, useId, useRef, useState } from 'react'

import { contactAction } from '@/app/actions/contact'

type Props = {
  source: 'kontak' | 'layanan'
  /** Pilihan topik (form Kontak). Kosongkan bila topik sudah pasti, lalu isi `topic`. */
  topics?: string[]
  /** Topik tetap, mis. nama layanan di halaman layanan. */
  topic?: string
  /** Petunjuk isi pesan di bawah kolom pesan. */
  hint?: string
  submitLabel?: string
}

type Field = 'name' | 'email' | 'phone' | 'message'
const MAX = 2000

const input =
  'mt-1.5 block w-full border border-line bg-surface px-3 py-2.5 text-base text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand focus:outline-none aria-[invalid=true]:border-danger'

/**
 * Form kirim pesan ke email himpunan (server action actions/contact.ts). Label selalu terlihat, galat muncul
 * tepat di bawah kolomnya dan kolom pertama yang salah difokus, tombol terkunci selama mengirim, dan hasilnya
 * diumumkan ke pembaca layar. Ada kolom honeypot tersembunyi untuk menyaring bot.
 */
export function ContactForm({ source, topics, topic, hint, submitLabel = 'Kirim pesan' }: Props) {
  const id = useId()
  const form = useRef<HTMLFormElement>(null)
  const [result, formAction, pending] = useActionState(contactAction, null)
  const [dismissed, setDismissed] = useState<number | null>(null)
  const [length, setLength] = useState(0)

  const error = result && !result.ok ? { field: result.field as Field | undefined, text: result.error } : null
  const values = result && !result.ok ? result.values : undefined
  const state = result?.ok && result.at !== dismissed ? 'sent' : 'idle'
  const sentTo = result?.ok ? (result.email ?? '') : ''

  // Galat dari server: fokuskan kolom yang salah supaya langsung bisa diperbaiki.
  useEffect(() => {
    if (result && !result.ok && result.field) form.current?.querySelector<HTMLElement>(`[name="${result.field}"]`)?.focus()
  }, [result])

  if (state === 'sent') {
    return (
      <div role="status" className="border border-line bg-surface-raised p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-link">[ OK ] terkirim</p>
        <p className="mt-2 font-display text-xl font-semibold">Terima kasih, pesanmu sudah kami terima.</p>
        <p className="mt-2 text-ink-muted">Pengurus HMTI UNTAD akan membalas ke {sentTo}. Cek juga folder spam bila belum ada balasan.</p>
        <button
          type="button"
          onClick={() => {
            setDismissed(result?.at ?? null)
            setLength(0)
          }}
          className="mt-5 border border-brand px-4 py-2.5 text-sm font-medium text-link transition-colors hover:bg-brand-soft/50"
        >
          Kirim pesan lain
        </button>
      </div>
    )
  }

  const err = (f: Field) => (error?.field === f ? `${id}-${f}-err` : undefined)
  const fieldError = (f: Field) =>
    error?.field === f ? (
      <p id={`${id}-${f}-err`} className="mt-1.5 text-sm text-danger">
        {error.text}
      </p>
    ) : null

  return (
    <form ref={form} action={formAction} noValidate className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="source" value={source} />
      {topic && <input type="hidden" name="topic" value={topic} />}
      <label className="block text-sm font-medium">
        Nama <span className="text-ink-muted">(wajib)</span>
        <input name="name" defaultValue={values?.name} required autoComplete="name" maxLength={120} className={input} aria-invalid={error?.field === 'name'} aria-describedby={err('name')} />
        {fieldError('name')}
      </label>
      <label className="block text-sm font-medium">
        Email <span className="text-ink-muted">(wajib)</span>
        <input name="email" defaultValue={values?.email} type="email" required autoComplete="email" inputMode="email" maxLength={254} className={input} aria-invalid={error?.field === 'email'} aria-describedby={err('email')} />
        {fieldError('email')}
      </label>
      <label className="block text-sm font-medium">
        WhatsApp <span className="text-ink-muted">(opsional)</span>
        <input name="phone" defaultValue={values?.phone} type="tel" autoComplete="tel" inputMode="tel" maxLength={40} placeholder="08xx" className={input} aria-invalid={error?.field === 'phone'} aria-describedby={err('phone')} />
        {fieldError('phone')}
      </label>
      {topics && topics.length > 0 ? (
        <label className="block text-sm font-medium">
          Topik
          <select name="topic" defaultValue={values?.topic || topics[0]} className={input}>
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      ) : (
        <div aria-hidden="true" className="hidden sm:block" />
      )}
      <label className="block text-sm font-medium sm:col-span-2">
        Pesan <span className="text-ink-muted">(wajib)</span>
        <textarea
          name="message"
          defaultValue={values?.message}
          required
          rows={6}
          maxLength={MAX}
          onChange={(e) => setLength(e.target.value.length)}
          className={`${input} resize-y`}
          aria-invalid={error?.field === 'message'}
          aria-describedby={[err('message'), `${id}-hint`].filter(Boolean).join(' ')}
        />
        <span id={`${id}-hint`} className="mt-1.5 flex justify-between gap-4 text-xs font-normal text-ink-muted">
          <span>{hint ?? 'Ceritakan kebutuhanmu, waktu, dan hal yang perlu kami tahu.'}</span>
          <span className="tabular-nums">
            {length}/{MAX}
          </span>
        </span>
        {fieldError('message')}
      </label>

      {/* Honeypot: tidak terlihat dan tidak bisa difokus manusia. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Situs web
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center bg-brand px-5 py-2.5 font-medium text-on-brand transition-[background-color,transform] hover:bg-brand-strong active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? 'Mengirim…' : submitLabel}
        </button>
        <p aria-live="polite" className="text-sm text-danger">
          {error && !error.field ? error.text : ''}
        </p>
      </div>
    </form>
  )
}
