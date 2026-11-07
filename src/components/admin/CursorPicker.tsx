'use client'

import { FieldDescription, FieldLabel, useField } from '@payloadcms/ui'

import { CURSORS } from '@/lib/cursors'

const PREVIEW: Record<string, { img?: string; hover?: string; css: string; hoverCss: string }> = {
  bawaan: { css: 'auto', hoverCss: 'pointer' },
  piksel: { img: '/cursors/piksel.png', hover: '/cursors/piksel-tunjuk.png', css: "url('/cursors/piksel.png') 0 0, auto", hoverCss: "url('/cursors/piksel-tunjuk.png') 10 0, pointer" },
  teemo: { img: '/cursors/teemo.png', hover: '/cursors/teemo-tunjuk.png', css: "url('/cursors/teemo.png') 0 0, auto", hoverCss: "url('/cursors/teemo-tunjuk.png') 16 14, pointer" },
  allblue: { img: '/cursors/allblue.png', hover: '/cursors/allblue-tunjuk.png', css: "url('/cursors/allblue.png') 14 14, auto", hoverCss: "url('/cursors/allblue-tunjuk.png') 16 14, pointer" },
}

/** Pilihan kursor bergambar: tiap kotak menampilkan kursor biasa dan kursor tunjuk, dan bisa dicoba dengan diarahkan. */
export function CursorPicker({ path, field }: { path: string; field: { label?: string; admin?: { description?: string } } }) {
  const { value, setValue } = useField<string>({ path })
  const current = value || 'bawaan'
  return (
    <div className="field-type hm-cursor-field">
      <FieldLabel label={field.label ?? 'Kursor'} path={path} />
      <div className="hm-cursor-grid" role="radiogroup" aria-label={field.label ?? 'Kursor'}>
        {CURSORS.map((c) => {
          const p = PREVIEW[c.value]
          const on = current === c.value
          return (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setValue(c.value)}
              className={`hm-cursor-opt${on ? ' is-on' : ''}`}
              style={{ cursor: p.css }}
            >
              <span className="hm-cursor-imgs" aria-hidden="true">
                {p.img ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.img} alt="" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.hover} alt="" />
                  </>
                ) : (
                  <span className="hm-cursor-sys">Aa</span>
                )}
              </span>
              <span className="hm-cursor-name">{c.label}</span>
              <span className="hm-cursor-note">{c.note}</span>
              <span className="hm-cursor-try" style={{ cursor: p.hoverCss }}>
                coba tunjuk
              </span>
            </button>
          )
        })}
      </div>
      <FieldDescription description={field.admin?.description} path={path} />
    </div>
  )
}
