'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useRef } from 'react'

import {
  AiArt,
  BlockchainArt,
  CloudArt,
  DataArt,
  DevOpsArt,
  DroneArt,
  GameArt,
  MetaverseArt,
  NetworkArt,
  RobotArt,
  SecurityArt,
  ServerArt,
  TerminalArt,
  UiArt,
  VrArt,
} from './TechArt'

type Node = { label: string; desc: string; art: ReactNode; depth: number }

/** Cincin dalam (dekat inti): fondasi rekayasa. Cincin luar: bidang terapan. */
const INNER: Node[] = [
  { label: 'Software Engineer', desc: 'Rekayasa perangkat lunak', art: <TerminalArt />, depth: 0.5 },
  { label: 'AI', desc: 'Kecerdasan buatan', art: <AiArt />, depth: 0.45 },
  { label: 'Data Science', desc: 'Sains data dan analitik', art: <DataArt />, depth: 0.55 },
  { label: 'Cloud', desc: 'Komputasi awan', art: <CloudArt />, depth: 0.4 },
  { label: 'DevOps', desc: 'Otomasi pengembangan dan operasi', art: <DevOpsArt />, depth: 0.5 },
  { label: 'Jaringan Komputer', desc: 'Jaringan dan komunikasi data', art: <NetworkArt />, depth: 0.45 },
]
const OUTER: Node[] = [
  { label: 'Server', desc: 'Infrastruktur dan pusat data', art: <ServerArt />, depth: 0.9 },
  { label: 'CyberSecurity', desc: 'Keamanan siber dan ethical hacking', art: <SecurityArt />, depth: 1 },
  { label: 'Blockchain', desc: 'Buku besar terdistribusi', art: <BlockchainArt />, depth: 0.85 },
  { label: 'UI/UX', desc: 'Desain antarmuka dan pengalaman pengguna', art: <UiArt />, depth: 0.95 },
  { label: 'Game Dev', desc: 'Pengembangan game', art: <GameArt />, depth: 0.8 },
  { label: 'Metaverse', desc: 'Dunia virtual bersama', art: <MetaverseArt />, depth: 0.9 },
  { label: 'VR', desc: 'Realitas virtual', art: <VrArt />, depth: 1 },
  { label: 'Robotics', desc: 'Robotika', art: <RobotArt />, depth: 0.85 },
  { label: 'Drone', desc: 'Drone dan IoT', art: <DroneArt />, depth: 0.95 },
]

const ring = (nodes: Node[], r: number, offset: number) =>
  nodes.map((n, i) => {
    const a = -Math.PI / 2 + offset + (i / nodes.length) * Math.PI * 2
    return { ...n, x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r, r, deg: (a * 180) / Math.PI }
  })
const NODES = [...ring(INNER, 27, Math.PI / 6), ...ring(OUTER, 45, 0)]

/**
 * Konstelasi bidang IT di samping jargon hero (dekoratif, tidak menuju halaman lain).
 * Layar lebar: dua cincin ubin di sekitar chip HMTI, bergeser mengikuti kursor (parallax per kedalaman).
 * Ubin yang ditunjuk menyala dan ilustrasinya bergerak; jalur sirkuitnya mengalirkan data.
 * Layar sempit: deretan ubin yang bisa digeser.
 * Ringan: tidak ada animasi yang berjalan terus; gerak hanya saat ditunjuk, dan parallax hanya untuk mouse.
 */
export function TechOrbit() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    // Pulsa kabel berhenti saat hero tidak terlihat.
    const io = new IntersectionObserver(([en]) => (el.dataset.paused = en.isIntersecting ? 'false' : 'true'))
    io.observe(el)
    const ok = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!ok) return () => io.disconnect()
    const host = el.closest('section') ?? el
    let raf = 0
    let mx = 0
    let my = 0
    const apply = () => {
      raf = 0
      el.style.setProperty('--mx', mx.toFixed(3))
      el.style.setProperty('--my', my.toFixed(3))
    }
    const onMove = (e: Event) => {
      const p = e as PointerEvent
      if (p.pointerType !== 'mouse') return
      const r = el.getBoundingClientRect()
      mx = Math.max(-1, Math.min(1, (p.clientX - (r.left + r.width / 2)) / (r.width / 2)))
      my = Math.max(-1, Math.min(1, (p.clientY - (r.top + r.height / 2)) / (r.height / 2)))
      if (!raf) raf = requestAnimationFrame(apply)
    }
    const onLeave = () => {
      mx = my = 0
      if (!raf) raf = requestAnimationFrame(apply)
    }
    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={root} className="orbit">
      <svg className="orbit-traces" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <circle cx="50" cy="50" r="27" className="orbit-ring" vectorEffect="non-scaling-stroke" />
        <circle cx="50" cy="50" r="45" className="orbit-ring" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* Kabel dari inti ke tiap ubin: garis tipis dengan paket data yang berjalan bolak-balik (hanya transform). */}
      {NODES.map((n, i) => (
        <span
          key={n.label}
          aria-hidden="true"
          className="orbit-wire"
          data-for={n.label}
          style={{ '--len': `${n.r}%`, '--ang': `${n.deg.toFixed(2)}deg`, '--pd': `${((i * 0.37) % 2.6).toFixed(2)}s`, '--dir': i % 3 === 1 ? 'reverse' : 'normal' } as CSSProperties}
        >
          <span className="orbit-pulse" />
        </span>
      ))}

      <div className="orbit-core" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/hmti-logo.webp" alt="" width={64} height={64} className="size-12 rounded-full lg:size-14" />
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em]">hmti.core</span>
      </div>

      <ul className="orbit-list" aria-label="Bidang teknologi yang ditekuni mahasiswa Informatika">
        {NODES.map((n, i) => (
          <li
            key={n.label}
            className={`orbit-item ${i < INNER.length ? 'is-inner' : ''}`}
            style={{ '--x': `${n.x}%`, '--y': `${n.y}%`, '--d': n.depth } as CSSProperties}
            onPointerEnter={() => root.current?.querySelector(`[data-for="${CSS.escape(n.label)}"]`)?.classList.add('is-on')}
            onPointerLeave={() => root.current?.querySelector(`[data-for="${CSS.escape(n.label)}"]`)?.classList.remove('is-on')}
          >
            <div className="orbit-tile" title={n.desc}>
              <span className="orbit-art">{n.art}</span>
              <span className="orbit-label">{n.label}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
