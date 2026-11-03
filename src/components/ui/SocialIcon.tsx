/** Ikon sosial (garis tipis) berdasarkan nama platform. Tidak ada pustaka ikon pihak ketiga. */
const PATHS: Record<string, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: <path d="M14 8h2.5V4.5H14A4 4 0 0 0 10 8.5V11H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V8.8c0-.5.3-.8.8-.8Z" />,
  linkedin: (
    <>
      <rect x="3.5" y="9" width="3.5" height="11" />
      <circle cx="5.25" cy="5.25" r="1.75" />
      <path d="M10 20V9h3.4v1.6C14 9.5 15.2 8.8 16.7 8.8c3 0 3.8 2 3.8 4.7V20H17v-5.8c0-1.2-.1-2.4-1.6-2.4s-1.9 1.1-1.9 2.4V20z" />
    </>
  ),
}

export function SocialIcon({ platform, className = 'size-[18px]' }: { platform: string; className?: string }) {
  const key = platform.toLowerCase()
  const body = PATHS[key]
  if (!body) return <span className="text-xs font-medium">{platform.slice(0, 2)}</span>
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {body}
    </svg>
  )
}
