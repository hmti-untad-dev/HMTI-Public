/**
 * Foto gedung Laboratorium Informatika (sekretariat HMTI UNTAD). File: public/brand/lab-informatika.webp.
 * Foto sedikit diperbesar di dalam bingkai supaya parallax halus (components/layout/Interactions.tsx) tidak memperlihatkan tepi.
 */
export function LabPhoto({ className = '', caption = true }: { className?: string; caption?: boolean }) {
  return (
    <figure className={className}>
      <div className="parallax-frame border border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-parallax
          src="/brand/lab-informatika.webp"
          alt="Gedung Laboratorium Informatika Universitas Tadulako, tempat sekretariat HMTI UNTAD"
          width={611}
          height={348}
          decoding="async"
          className="skeleton aspect-video w-full object-cover"
        />
      </div>
      {caption && <figcaption className="mt-2 text-xs text-ink-muted">Laboratorium Informatika, sekretariat HMTI UNTAD.</figcaption>}
    </figure>
  )
}
