'use client'

import { useActionState } from 'react'

import { trackAction } from '@/app/actions/letter'
import { formatDate } from '@/lib/format'

const input =
  'mt-1.5 block w-full border border-line bg-surface px-3 py-2.5 text-base text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand focus:outline-none'

/** Cek status pengajuan layanan dengan kode pelacakan + email (server action actions/letter.ts). */
export function TrackForm() {
  const [result, formAction, pending] = useActionState(trackAction, null)
  const values = result && !result.ok ? result.values : undefined

  return (
    <div className="grid max-w-3xl gap-8">
      <form action={formAction} className="grid gap-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block text-sm font-medium">
          Kode pelacakan
          <input name="code" required defaultValue={values?.code} placeholder="HMTI-1A2B3C4D" autoComplete="off" className={`${input} font-mono uppercase`} />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" required defaultValue={values?.email} autoComplete="email" className={input} />
        </label>
        <button type="submit" disabled={pending} className="border border-brand bg-brand px-5 py-2.5 font-medium text-on-brand hover:bg-brand-strong disabled:opacity-60">
          {pending ? 'Mengecek…' : 'Cek status'}
        </button>
      </form>

      <div aria-live="polite">
        {result && !result.ok && <p className="text-sm text-danger">{result.error}</p>}
        {result?.ok && (
          <section className="border border-line bg-surface-raised p-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-link">{result.code}</p>
            <h2 className="mt-1 font-display text-xl font-semibold">
              {result.service}
              {result.subject && <span className="font-normal text-ink-muted"> · {result.subject}</span>}
            </h2>
            <p className="mt-3">
              Status: <span className="border border-brand px-2 py-0.5 font-mono text-sm text-link">{result.status}</span>
            </p>
            {result.history.length > 0 && (
              <ol className="mt-5 space-y-2 border-l border-line pl-4 text-sm">
                {result.history.map((h, i) => (
                  <li key={i}>
                    <span className="font-medium">{h.status}</span>
                    {h.at && <span className="text-ink-muted"> · {formatDate(h.at)}</span>}
                    {h.note && <span className="text-ink-muted"> · {h.note}</span>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
