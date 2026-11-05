/**
 * Ilustrasi kecil bidang IT untuk konstelasi hero (TechOrbit). SVG 64x64, garis memakai currentColor dan aksen
 * memakai --link, jadi ikut tema terang/gelap. Bagian yang bergerak diberi kelas t-* (animasi di globals.css,
 * hanya transform/opacity, mati bila gerak dikurangi).
 */
const A = 'var(--link)'

export function TerminalArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="6" y="10" width="52" height="40" />
      <path d="M6 18h52" />
      <circle cx="11" cy="14" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="1.2" fill="currentColor" stroke="none" />
      <path d="M12 27l6 5-6 5" stroke={A} />
      <path d="M22 37h14" className="t-type" stroke={A} />
      <rect x="38" y="33" width="4" height="6" fill={A} stroke="none" className="t-blink" />
    </svg>
  )
}

export function ServerArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {[10, 26, 42].map((y, i) => (
        <g key={y}>
          <rect x="12" y={y} width="40" height="12" />
          <path d={`M18 ${y + 6}h14`} />
          <circle cx="44" cy={y + 6} r="2" fill={A} stroke="none" className="t-led" style={{ animationDelay: `${i * 0.35}s` }} />
        </g>
      ))}
      <path d="M32 54v4M24 58h16" />
    </svg>
  )
}

export function AiArt() {
  const n = [
    [12, 20],
    [12, 44],
    [32, 12],
    [32, 32],
    [32, 52],
    [52, 24],
    [52, 40],
  ]
  const e = [
    [0, 2],
    [0, 3],
    [1, 3],
    [1, 4],
    [2, 5],
    [3, 5],
    [3, 6],
    [4, 6],
  ]
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      {e.map(([a, b]) => (
        <path key={`${a}-${b}`} d={`M${n[a][0]} ${n[a][1]}L${n[b][0]} ${n[b][1]}`} opacity="0.7" />
      ))}
      {n.map(([x, y], i) => (
        <rect key={i} x={x - 3.5} y={y - 3.5} width="7" height="7" fill={i === 3 ? A : 'var(--raised)'} stroke={i === 3 ? A : 'currentColor'} className={i === 3 ? 't-pulse' : undefined} />
      ))}
    </svg>
  )
}

export function DroneArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 18l28 28M46 18L18 46" />
      <rect x="25" y="25" width="14" height="14" fill="var(--raised)" />
      <circle cx="32" cy="32" r="2" fill={A} stroke="none" className="t-blink" />
      {[
        [14, 14],
        [50, 14],
        [14, 50],
        [50, 50],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} className="t-spin" style={{ transformOrigin: `${x}px ${y}px` }}>
          <path d={`M${x - 9} ${y}h18`} stroke={A} strokeWidth="2.4" />
        </g>
      ))}
    </svg>
  )
}

export function VrArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M8 24h48v18H40l-4-6h-8l-4 6H8z" fill="var(--raised)" />
      <path d="M14 24c4-8 32-8 36 0" />
      <rect x="14" y="29" width="10" height="7" fill={A} stroke="none" className="t-pulse" />
      <rect x="40" y="29" width="10" height="7" fill={A} stroke="none" className="t-pulse" />
      <path d="M8 30H3M56 30h5" />
    </svg>
  )
}

export function RobotArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="14" y="50" width="26" height="6" />
      <rect x="22" y="44" width="10" height="6" />
      <g className="t-arm" style={{ transformOrigin: '27px 44px' }}>
        <path d="M27 44V26" strokeWidth="4" />
        <circle cx="27" cy="26" r="3" fill="var(--raised)" />
        <g className="t-arm2" style={{ transformOrigin: '27px 26px' }}>
          <path d="M27 26l18-8" strokeWidth="4" />
          <path d="M45 18l6-4M45 18l6 2" stroke={A} strokeWidth="2.4" />
        </g>
      </g>
    </svg>
  )
}

export function GameArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14 22h36l6 22-8 4-7-8H23l-7 8-8-4z" fill="var(--raised)" />
      <path d="M20 30v8M16 34h8" />
      <rect x="40" y="28" width="4" height="4" fill={A} stroke="none" className="t-led" />
      <rect x="46" y="34" width="4" height="4" fill={A} stroke="none" className="t-led" style={{ animationDelay: '0.4s' }} />
    </svg>
  )
}

export function UiArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="8" y="10" width="48" height="40" />
      <path d="M8 18h48" />
      <rect x="14" y="24" width="16" height="12" stroke={A} />
      <path d="M36 25h14M36 31h10M14 42h36" opacity="0.7" />
      <g className="t-cursor">
        <path d="M40 38l9 4-4 1.5L43.5 48z" fill="currentColor" stroke="none" />
      </g>
    </svg>
  )
}

export function SecurityArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M22 28v-6a10 10 0 0120 0v6" />
      <rect x="16" y="28" width="32" height="24" fill="var(--raised)" />
      <rect x="29" y="35" width="6" height="9" fill={A} stroke="none" className="t-pulse" />
      <text x="4" y="12" fontSize="7" fontFamily="ui-monospace, monospace" fill="currentColor" stroke="none" className="t-bits">
        01101
      </text>
      <text x="40" y="62" fontSize="7" fontFamily="ui-monospace, monospace" fill="currentColor" stroke="none" className="t-bits" style={{ animationDelay: '0.6s' }}>
        10010
      </text>
    </svg>
  )
}

export function NetworkArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="20" y="26" width="24" height="12" fill="var(--raised)" />
      {[25, 30, 35, 40].map((x, i) => (
        <rect key={x} x={x - 1.5} y="30.5" width="3" height="3" fill={A} stroke="none" className="t-led" style={{ animationDelay: `${i * 0.25}s` }} />
      ))}
      <path d="M32 26V14M24 38l-10 12M40 38l10 12" />
      <rect x="27" y="6" width="10" height="8" />
      <rect x="6" y="50" width="10" height="8" />
      <rect x="48" y="50" width="10" height="8" />
    </svg>
  )
}

export function DataArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M8 8v48h48" />
      <rect x="15" y="38" width="7" height="18" fill="var(--raised)" />
      <rect x="27" y="28" width="7" height="28" fill="var(--raised)" />
      <rect x="39" y="34" width="7" height="22" fill="var(--raised)" />
      <path d="M14 30l13-12 12 8 15-14" stroke={A} className="t-type" />
      <rect x="51" y="9" width="5" height="5" fill={A} stroke="none" className="t-pulse" />
    </svg>
  )
}

export function CloudArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 42h30a9 9 0 001-18 13 13 0 00-25-3 10 10 0 00-6 21z" fill="var(--raised)" />
      <g className="t-up">
        <path d="M27 50v8M24 53l3-3 3 3" stroke={A} />
      </g>
      <g className="t-down">
        <path d="M37 50v8M34 55l3 3 3-3" stroke={A} />
      </g>
    </svg>
  )
}

export function DevOpsArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M32 32c-6-8-10-12-16-12a12 12 0 000 24c6 0 10-4 16-12s10-12 16-12a12 12 0 010 24c-6 0-10-4-16-12z" />
      <path d="M32 32c-6-8-10-12-16-12a12 12 0 000 24c6 0 10-4 16-12s10-12 16-12a12 12 0 010 24c-6 0-10-4-16-12z" stroke={A} strokeDasharray="10 120" className="t-loop" />
    </svg>
  )
}

export function MetaverseArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="32" cy="32" r="22" fill="var(--raised)" />
      <ellipse cx="32" cy="32" rx="22" ry="8" />
      <g className="t-spin-slow" style={{ transformOrigin: '32px 32px' }}>
        <ellipse cx="32" cy="32" rx="9" ry="22" stroke={A} />
      </g>
      <path d="M10 32h44" opacity="0.6" />
    </svg>
  )
}

export function BlockchainArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {[6, 26, 46].map((x, i) => (
        <g key={x}>
          <rect x={x} y="24" width="13" height="13" fill="var(--raised)" />
          <rect x={x + 4} y="28" width="5" height="5" fill={A} stroke="none" className="t-led" style={{ animationDelay: `${i * 0.3}s` }} />
        </g>
      ))}
      <path d="M19 30.5h7M39 30.5h7" stroke={A} />
      <path d="M12 44v6h40v-6" opacity="0.6" />
    </svg>
  )
}
