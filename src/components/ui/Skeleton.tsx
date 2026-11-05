/** Blok placeholder berkilau untuk keadaan loading. Dekoratif: konteksnya diumumkan oleh pembungkus (role=status). */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />
}
