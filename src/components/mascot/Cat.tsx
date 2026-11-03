import type { CSSProperties } from 'react'

/**
 * Teemo, maskot kucing hitam HMTI. Dua pose gambar datar (siluet + mata putih):
 *  - CatSit: duduk menghadap depan. `lid` 0..1 menutup kelopak, `yawn` 0..1 membuka mulut.
 *  - CatLoaf: meringkuk tidur, mata terpejam.
 * Warna badan dari token --cat / --cat-line (tema gelap memakai badan sedikit lebih terang + garis tepi
 * tipis supaya siluet tetap terbaca). Animasi ada di globals.css (kelas cat-*) dan mati saat gerak dikurangi.
 */

const BODY =
  'M44 38 Q43 20 47 13 Q54 17 58 24 Q62 22.5 66 24 Q70 17 77 13 Q81 20 80 38 Q81 48 76 54 Q86 66 86 86 Q86 100 76 102 L48 102 Q38 100 38 86 Q38 66 48 54 Q43 48 44 38 Z'

type SitProps = {
  className?: string
  lid?: number
  yawn?: number
  /** Matikan ayunan ekor dan kedipan (dipakai saat kucing hendak tidur). */
  still?: boolean
}

export function CatSit({ className, lid = 0, yawn = 0, still = false }: SitProps) {
  const style = { '--lid': lid, '--yawn': yawn } as CSSProperties
  return (
    <svg viewBox="0 0 120 110" preserveAspectRatio="xMidYMax meet" className={className} style={style} aria-hidden="true" focusable="false">
      <ellipse cx="62" cy="105" rx="30" ry="3" fill="var(--ink)" opacity="0.1" />
      <g className={still ? 'cat-tail-base' : 'cat-tail'}>
        <path d="M40 98 Q16 98 18 72" fill="none" stroke="var(--cat-line)" strokeWidth="11" strokeLinecap="round" />
        <path d="M40 98 Q16 98 18 72" fill="none" stroke="var(--cat)" strokeWidth="9" strokeLinecap="round" />
      </g>
      <path d={BODY} fill="var(--cat)" stroke="var(--cat-line)" strokeWidth="1.4" strokeLinejoin="round" />
      {[53, 71].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="34" r="5" fill="#fff" />
          <circle cx={cx} cy="34" r="2.7" fill="var(--cat)" className="cat-pupil" />
        </g>
      ))}
      <rect x="46" y="24" width="32" height="12" fill="var(--cat)" className={still ? 'cat-lid' : 'cat-lid cat-blink'} />
      <ellipse cx="62" cy="45.5" rx="3.2" ry="3.6" fill="#e8a1b3" className="cat-yawn" />
    </svg>
  )
}

export function CatLoaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 75" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="68" cy="70.5" rx="52" ry="3" fill="var(--ink)" opacity="0.1" />
      <path d="M118 64 Q138 64 132 75 Q127 81 114 77" fill="none" stroke="var(--cat-line)" strokeWidth="9" strokeLinecap="round" transform="translate(0 -6)" />
      <path d="M118 64 Q138 64 132 75 Q127 81 114 77" fill="none" stroke="var(--cat)" strokeWidth="7" strokeLinecap="round" transform="translate(0 -6)" />
      <g className="cat-breathe">
        <path
          d="M10 66 Q8 48 14 40 Q14 30 17 24 Q24 28 27 34 Q30 33 33 34 Q36 28 41 24 Q44 32 43 40 Q60 28 92 34 Q124 40 122 64 Q122 70 114 70 L18 70 Q10 70 10 66 Z"
          fill="var(--cat)"
          stroke="var(--cat-line)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M16 53 Q20 57 24 53 M29 53 Q33 57 37 53" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
      </g>
    </svg>
  )
}
