/* eslint-disable @next/next/no-img-element */

/** Logo di halaman masuk admin: lambang HMTI dan nama ruang pengurus. */
export function AdminLogo() {
  return (
    <div className="hm-logo">
      <img src="/brand/hmti-logo.webp" alt="" width={56} height={56} />
      <div>
        <p className="hm-logo__name">HMTI UNTAD</p>
        <p className="hm-eyebrow">Ruang pengurus</p>
      </div>
    </div>
  )
}

/** Ikon kecil di navigasi admin. */
export function AdminIcon() {
  return <img src="/brand/hmti-logo.webp" alt="HMTI UNTAD" width={26} height={26} className="hm-icon" />
}
