'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'

export type Doc = { title: string; href: string; meta?: string }

type PdfJs = typeof import('pdfjs-dist')
let pdfjsPromise: Promise<PdfJs> | null = null

/** pdf.js dimuat hanya saat dokumen pertama dibuka; worker-nya dibundel lewat new URL agar versinya selalu cocok. */
function loadPdfJs() {
  pdfjsPromise ??= import('pdfjs-dist').then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), { type: 'module' })
    return pdfjs
  })
  return pdfjsPromise
}

/**
 * Daftar dokumen publik (AD/ART, GBHO, SK, ...) dengan pratinjau di halaman, tanpa tombol unduh. Halaman PDF
 * digambar ke canvas oleh pdf.js, jadi tampil juga di ponsel (Chrome Android tidak bisa menampilkan PDF di iframe
 * dan malah mengunduhnya). Halaman digambar bertahap saat digulir mendekati layar.
 */
export function DocumentList({ docs }: { docs: Doc[] }) {
  const [open, setOpen] = useState<Doc | null>(null)
  return (
    <>
      <ul className="max-w-2xl divide-y divide-line border border-line bg-surface-raised">
        {docs.map((d) => (
          <li key={d.href} className="flex items-center justify-between gap-4 p-4 text-sm">
            <span>
              {d.title}
              {d.meta && <span className="text-ink-muted"> · {d.meta}</span>}
            </span>
            <button
              type="button"
              onClick={() => setOpen(d)}
              onPointerEnter={() => void loadPdfJs()}
              className="shrink-0 border border-line px-3 py-1.5 font-medium text-link transition-colors hover:border-brand"
            >
              Lihat
            </button>
          </li>
        ))}
      </ul>
      {open && <DocumentViewer doc={open} onClose={() => setOpen(null)} />}
    </>
  )
}

function DocumentViewer({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [sizes, setSizes] = useState<number[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    dialog.current?.showModal()
    let cancelled = false
    let task: { destroy: () => Promise<void> } | null = null
    loadPdfJs()
      .then((pdfjs) => {
        const t = pdfjs.getDocument({ url: doc.href })
        task = t
        return t.promise
      })
      .then(async (p) => {
        // Rasio tinggi/lebar tiap halaman, agar tempatnya sudah tersedia sebelum digambar (tidak meloncat).
        const ratios = await Promise.all(
          Array.from({ length: p.numPages }, (_, i) =>
            p.getPage(i + 1).then((page) => {
              const v = page.getViewport({ scale: 1 })
              return v.height / v.width
            }),
          ),
        )
        if (cancelled) return
        setPdf(p)
        setSizes(ratios)
      })
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
      void task?.destroy()
    }
  }, [doc.href])

  const close = useCallback(() => {
    dialog.current?.close()
  }, [])

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && close()}
      aria-label={`Pratinjau ${doc.title}`}
      className="doc-viewer m-auto h-[94dvh] max-h-none w-[min(56rem,96vw)] max-w-none overflow-hidden border border-line bg-surface p-0 text-ink backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-display font-semibold">{doc.title}</p>
            <p className="font-mono text-xs text-ink-muted">{sizes.length > 0 ? `${sizes.length} halaman · pratinjau` : 'memuat…'}</p>
          </div>
          <button type="button" onClick={close} className="shrink-0 border border-line px-3 py-1.5 text-sm hover:border-brand" autoFocus>
            Tutup
          </button>
        </header>
        <div ref={scroller} className="flex-1 overflow-y-auto overscroll-contain bg-surface-alt p-3 sm:p-6" data-lenis-prevent>
          {error ? (
            <p className="p-6 text-center text-sm text-ink-muted">Dokumen gagal dimuat. Coba lagi nanti.</p>
          ) : !pdf ? (
            <div className="mx-auto aspect-[1/1.414] w-full max-w-3xl animate-pulse bg-surface" aria-hidden="true" />
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:gap-5">
              {sizes.map((ratio, i) => (
                <PdfPage key={i} pdf={pdf} index={i + 1} ratio={ratio} root={scroller} />
              ))}
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}

function PdfPage({ pdf, index, ratio, root }: { pdf: PDFDocumentProxy; index: number; ratio: number; root: React.RefObject<HTMLDivElement | null> }) {
  const box = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return
    let task: { cancel: () => void } | null = null
    let started = false
    let cancelled = false
    const draw = async () => {
      if (started) return
      started = true
      io.disconnect()
      const page = await pdf.getPage(index)
      const c = canvas.current
      if (!c || cancelled) return
      const scale = (el.clientWidth / page.getViewport({ scale: 1 }).width) * Math.min(window.devicePixelRatio || 1, 2)
      const viewport = page.getViewport({ scale })
      c.width = Math.floor(viewport.width)
      c.height = Math.floor(viewport.height)
      const render = page.render({ canvas: c, viewport })
      task = render
      render.promise.then(() => setDrawn(true)).catch(() => {})
    }
    // Pengamat berakar di area gulir dialog (bukan viewport) agar andal di dalam <dialog> modal.
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && void draw(), { root: root.current, rootMargin: '800px 0px' })
    io.observe(el)
    // Halaman pertama langsung digambar tanpa menunggu pengamat.
    if (index === 1) void draw()
    return () => {
      cancelled = true
      io.disconnect()
      task?.cancel()
    }
  }, [pdf, index, root])

  return (
    <div ref={box} className={`relative w-full bg-white shadow-sm ${drawn ? '' : 'animate-pulse'}`} style={{ aspectRatio: `1 / ${ratio}` }}>
      <canvas ref={canvas} className="absolute inset-0 size-full" onContextMenu={(e) => e.preventDefault()} aria-label={`Halaman ${index}`} />
    </div>
  )
}
