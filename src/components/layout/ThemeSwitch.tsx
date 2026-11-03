'use client'

import { useEffect, useState } from 'react'

/** Sakelar tema bentuk saklar (matahari - saklar - bulan) untuk footer. Membaca data-theme yang dipasang skrip di <head>. */
export function ThemeSwitch() {
  const [dark, setDark] = useState<boolean | null>(null)

  useEffect(() => {
    const read = () => setDark(document.documentElement.dataset.theme === 'dark')
    read()
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])

  function toggle() {
    const next = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* penyimpanan diblokir: tema tetap berlaku untuk sesi ini */
    }
  }

  const icon = 'size-[18px] text-ink-muted'
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <button
        type="button"
        role="switch"
        aria-checked={dark === null ? undefined : dark}
        aria-label="Tema gelap"
        onClick={toggle}
        className="relative h-7 w-12 rounded-full border border-line bg-surface-raised transition-colors hover:border-brand"
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-ink transition-[left] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            dark ? 'left-[1.625rem]' : 'left-0.5'
          }`}
        />
      </button>
      <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    </div>
  )
}
