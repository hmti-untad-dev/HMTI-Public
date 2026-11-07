'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'

import { TOTAL_AKTIF } from '@/content/keanggotaan'

const COLS = 20
const ROWS = 20
const frac = (n: number) => n - Math.floor(n)

/** Lama tirai dan saat animasi halaman mulai masuk (ms). Harus cocok dengan blok "Layar boot" di globals.css. */
const BOOT_MS = 4000
const INTRO_MS = 3500

// Urutan larut tiap sel tirai (0..1): sedikit condong kiri-ke-kanan, sisanya acak. Sebagian kecil sel berkedip
// biru selama memuat. Dari hash, bukan Math.random, agar server dan klien sama (hydration aman).
const CURTAIN = Array.from({ length: COLS * ROWS }, (_, i) => {
  const col = i % COLS
  const row = Math.floor(i / COLS)
  const h = frac(Math.sin(col * 12.9898 + row * 78.233) * 43758.5453)
  return { t: Number(((col / (COLS - 1)) * 0.45 + h * 0.55).toFixed(3)), twinkle: frac(h * 97.13) < 0.09 }
})
const MARK = Array.from({ length: 64 }, (_, i) => Number(frac(Math.sin(i * 91.17 + 3.3) * 24634.6345).toFixed(3)))

const LINES = ['hmti-os 2026 · Kabinet All Blue', 'memuat 6 departemen', `menyambungkan ${TOTAL_AKTIF} anggota aktif`, 'We Make A Better Future']

/**
 * Tirai pembuka 4 detik: lambang HMTI tersusun dari piksel, log boot terketik baris demi baris, persentase dan bilah
 * muat naik tidak rata seperti proses sungguhan, sebagian piksel berkedip biru, lalu tirai larut per sel. Seluruh
 * linimasa ada di CSS (globals.css, blok "Layar boot"), jadi berjalan sejak paint pertama walau JS belum dimuat.
 * Tampil di setiap muat penuh halaman (skrip <head> di layout memasang html[data-intro='boot']), tidak saat pindah
 * halaman lewat menu. Klik, ketukan, tombol, atau gulir melewatinya seketika.
 * Komponen ini menangani lewati, menandai html[data-boot]='done' (lib/boot.ts), dan saat dilewati memajukan
 * animasi masuk halaman yang masih menunggu jeda intro agar langsung berjalan.
 */
export function BootScreen() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = document.documentElement
    if (root.dataset.boot !== 'running') return
    const done = () => {
      root.dataset.boot = 'done'
    }
    const skip = () => {
      ref.current?.classList.add('is-skip')
      // Animasi masuk ditunda --intro (3,5 dtk); geser awalnya ke sekarang supaya tidak ada jeda kosong.
      const now = document.timeline.currentTime
      if (typeof now === 'number') {
        for (const a of document.getAnimations()) {
          const timing = a.effect?.getComputedTiming()
          const target = a.effect instanceof KeyframeEffect ? a.effect.target : null
          if (!timing || typeof timing.delay !== 'number' || timing.delay < INTRO_MS) continue
          if (target instanceof Element && target.closest('.boot')) continue
          if (typeof a.currentTime === 'number' && a.currentTime >= timing.delay) continue
          a.startTime = now - INTRO_MS
        }
      }
      done()
      cleanup()
    }
    // Sisa waktu tirai dihitung dari awal navigasi, karena CSS sudah berjalan sebelum JS ini dimuat.
    const timer = window.setTimeout(() => {
      done()
      cleanup()
    }, Math.max(0, BOOT_MS - performance.now()))
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
    const cleanup = () => {
      window.clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, skip))
    }
    // Sudah diklik sebelum hidrasi (skrip <head> di layout menandai data-boot-skip): selesaikan sekarang.
    if (root.dataset.bootSkip) {
      skip()
      return cleanup
    }
    events.forEach((e) => window.addEventListener(e, skip, { passive: true }))
    return cleanup
  }, [])

  return (
    <div ref={ref} className="boot" aria-hidden="true">
      <div className="boot-cells">
        {CURTAIN.map((c, i) => (
          <i key={i} className={c.twinkle ? 'tw' : undefined} style={{ '--t': c.t } as CSSProperties} />
        ))}
      </div>
      <div className="boot-core">
        <div className="boot-mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/hmti-logo.webp" alt="" width={88} height={88} />
          <div className="boot-mark-px">
            {MARK.map((t, i) => (
              <i key={i} style={{ '--t': t } as CSSProperties} />
            ))}
          </div>
        </div>
        <div className="boot-log">
          {LINES.map((text, i) => (
            <p key={text} className="boot-line" style={{ '--at': `${0.35 + i * 0.7}s`, '--n': text.length } as CSSProperties}>
              <span className="boot-st">
                <span className="boot-wait">[ .. ]</span>
                <span className="boot-ok">[ OK ]</span>
              </span>{' '}
              <b>{text}</b>
            </p>
          ))}
        </div>
        <div className="boot-meter">
          <div className="boot-bar">
            <i />
          </div>
          <span className="boot-pct" />
        </div>
        <p className="boot-hint">klik di mana saja untuk lewati</p>
      </div>
    </div>
  )
}
