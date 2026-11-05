/**
 * Bebek karet, teman Teemo. Lelucon programmer: "rubber duck debugging" (jelaskan kodemu ke bebek karet,
 * biasanya bug-nya ketemu sendiri). Warna dan bentuk sederhana supaya serasi dengan gaya Teemo.
 */
export function Duck({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 56" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="33" cy="52.5" rx="20" ry="2.4" fill="var(--ink)" opacity="0.1" />
      <path d="M10 34 Q8 50 30 51 Q52 52 56 38 Q58 30 50 30 Q44 31 40 33 Q30 28 10 34 Z" fill="#ffd23f" />
      <path d="M20 38 Q30 33 40 40 Q32 46 22 43 Z" fill="#f5b800" opacity="0.7" />
      <circle cx="21" cy="21" r="13" fill="#ffd23f" />
      <path d="M5 23 Q1 25 4 28 Q9 30 13 26 Q12 22 8 22 Z" fill="#ff8a2a" />
      <circle cx="17" cy="18" r="2.4" fill="#121212" />
      <circle cx="16.3" cy="17.2" r="0.8" fill="#fff" />
      <ellipse cx="25" cy="26" rx="3" ry="1.8" fill="#ff7f9f" opacity="0.45" />
    </svg>
  )
}
