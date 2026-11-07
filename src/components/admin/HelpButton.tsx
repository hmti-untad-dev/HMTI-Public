'use client'

import { useRef } from 'react'

import { ADMIN_HELP } from '@/content/admin-help'

/**
 * Keterangan di bawah judul koleksi/global (daftar dan halaman edit) dengan tautan "?" yang membuka dialog berisi
 * fungsi, tempat isinya tampil di situs, alur kerja, dan catatan. Isi panduan ada di src/content/admin-help.ts.
 */
export function HelpButton({ topic }: { topic: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  const help = ADMIN_HELP[topic]
  if (!help) return null
  const hasDetail = Boolean(help.steps?.length || help.notes?.length || help.shownAt?.length)
  if (!hasDetail) return <p className="hm-desc">{help.summary}</p>

  const open = () => ref.current?.showModal()
  const close = () => ref.current?.close()

  return (
    <>
      <p className="hm-desc">
        {help.summary}{' '}
        <button type="button" className="hm-help-inline" onClick={open} aria-haspopup="dialog">
          <span className="hm-help-q hm-help-q--sm" aria-hidden="true">
            ?
          </span>
          {help.steps?.length ? 'Alur dan cara kerja' : 'Penjelasan'}
        </button>
      </p>

      <dialog
        ref={ref}
        className="hm-help-dialog"
        aria-labelledby={`hm-help-${topic}`}
        onClick={(e) => {
          // Klik di luar kotak (pada latar dialog) menutup panduan.
          if (e.target === e.currentTarget) close()
        }}
      >
        <div className="hm-help-body">
          <p className="hm-eyebrow">Panduan</p>
          <h2 id={`hm-help-${topic}`} className="hm-help-title">
            {help.summary}
          </h2>

          {help.steps?.length ? (
            <section>
              <h3 className="hm-eyebrow">Alur</h3>
              <ol className="hm-steps">
                {help.steps.map((s, i) => (
                  <li key={s}>
                    <span className="hm-step-n" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {help.notes?.length ? (
            <section>
              <h3 className="hm-eyebrow">Perlu diingat</h3>
              <ul className="hm-notes">
                {help.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {help.shownAt?.length ? (
            <section>
              <h3 className="hm-eyebrow">Tampil di situs</h3>
              <ul className="hm-links">
                {help.shownAt.map((s) => (
                  <li key={s.href + s.label}>
                    <a href={s.href} target="_blank" rel="noreferrer">
                      {s.label} <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="hm-help-actions">
            <button type="button" className="hm-btn" onClick={close} autoFocus>
              Mengerti
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
