import type { CSSProperties } from 'react'

/**
 * Teemo, maskot kucing hitam HMTI. Gaya: gemoy (kepala besar, badan mungil), siluet hitam pekat tanpa garis
 * tepi, mata kuning. Dua pose:
 *  - CatSit: duduk. `lid` 0..1 menutup kelopak, `yawn` 0..1 membuka mulut, `fluff` meruncingkan bulu
 *    (juga aktif saat di-hover lewat .teemo), `wide` membelalakkan mata (kaget).
 *  - CatLoaf: meringkuk tidur, mata terpejam.
 * Siluet disusun dari bentuk elips bertumpuk berwarna sama, jadi tepinya mulus tanpa sambungan. Di tema gelap
 * tepi diberi cahaya abu netral tipis (--cat-rim) supaya hitam pekat tetap terbaca. Animasi: globals.css (kelas cat-*).
 */

/** Gerigi bulu di sekeliling elips: ujung runcing keluar, pangkal sedikit di dalam siluet. */
function tufts(cx: number, cy: number, rx: number, ry: number, n: number, out: number) {
  const pts: string[] = []
  const step = (Math.PI * 2) / n
  for (let i = 0; i < n; i++) {
    const a = i * step - Math.PI / 2
    const b = a + step / 2
    pts.push(`${(cx + rx * 0.97 * Math.cos(a)).toFixed(1)},${(cy + ry * 0.97 * Math.sin(a)).toFixed(1)}`)
    pts.push(`${(cx + rx * (1 + out) * Math.cos(b)).toFixed(1)},${(cy + ry * (1 + out) * Math.sin(b)).toFixed(1)}`)
  }
  return pts.join(' ')
}

const HEAD_TUFTS = tufts(60, 50, 37, 30, 15, 0.2)
const BODY_TUFTS = tufts(60, 85, 26, 20, 11, 0.18)
const LOAF_TUFTS = tufts(84, 50, 42, 20, 14, 0.15)
const LOAF_HEAD_TUFTS = tufts(34, 44, 26, 22, 10, 0.2)

const EYE = '#ffc928'
const PINK = '#ff9db3'
/** Bagian dalam telinga abu gelap (permintaan pengurus); bagian luar tetap hitam seperti kepala. */
const EAR = '#3d3f46'

type SitProps = {
  className?: string
  lid?: number
  yawn?: number
  fluff?: boolean
  wide?: boolean
  /** Matikan ayunan ekor dan kedipan (dipakai saat kucing hendak tidur). */
  still?: boolean
  /** Senang (dielus): mata menjadi lengkung ^ ^ dan pipi lebih merona. */
  happy?: boolean
}

export function CatSit({ className = '', lid = 0, yawn = 0, fluff = false, wide = false, still = false, happy = false }: SitProps) {
  const style = { '--lid': lid, '--yawn': yawn, ...(fluff ? { '--fluff': 1 } : {}), ...(wide ? { '--wide': 1 } : {}) } as CSSProperties
  return (
    <svg viewBox="0 0 120 112" preserveAspectRatio="xMidYMax meet" className={`cat-svg ${className}`} style={style} aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="105.5" rx="32" ry="3" fill="var(--ink)" opacity="0.1" />

      <g fill="var(--cat)">
        <g className={still ? 'cat-tail-base' : 'cat-tail'}>
          <path d="M80 98 Q106 100 101 72" fill="none" stroke="var(--cat)" strokeWidth="9.5" strokeLinecap="round" />
        </g>
        <ellipse cx="60" cy="85" rx="26" ry="20" />
        <ellipse cx="49" cy="101" rx="9" ry="5" />
        <ellipse cx="71" cy="101" rx="9" ry="5" />
        <polygon className="cat-fluff" points={BODY_TUFTS} />
        <path className="cat-ear" d="M28 44 Q22 17 34 9 Q39 8 43 11 Q55 18 58 30 Z" />
        <path className="cat-ear" d="M92 44 Q98 17 86 9 Q81 8 77 11 Q65 18 62 30 Z" />
        <ellipse cx="60" cy="50" rx="37" ry="30" />
        <polygon className="cat-fluff" points={HEAD_TUFTS} />
      </g>

      {/* Telinga dalam */}
      <path d="M34 36 Q31 21 37 15 Q46 19 49 28 Z" fill={EAR} />
      <path d="M86 36 Q89 21 83 15 Q74 19 71 28 Z" fill={EAR} />

      {/* Kalung biru HMTI dengan lonceng emas */}
      <path d="M41 78.5 Q60 87 79 78.5" fill="none" stroke="#5253ad" strokeWidth="3.6" strokeLinecap="round" />
      <g className="cat-bell">
        <circle cx="60" cy="85.6" r="3.4" fill="#f2b01e" />
        <circle cx="59" cy="84.6" r="1" fill="#fff" opacity="0.8" />
        <path d="M58 87 H62" stroke="#9a6a00" strokeWidth="0.7" strokeLinecap="round" />
      </g>

      {/* Mata kuning; saat senang berubah jadi lengkung ^ ^ */}
      {happy ? (
        [46, 74].map((cx) => <path key={cx} d={`M${cx - 7} 56 Q${cx} 46 ${cx + 7} 56`} fill="none" stroke={EYE} strokeWidth="3" strokeLinecap="round" />)
      ) : (
        <>
          {[46, 74].map((cx) => (
            <g key={cx} className="cat-eye">
              <ellipse cx={cx} cy="53" rx="8.6" ry="9.6" fill={EYE} />
              <g className="cat-pupil">
                <ellipse cx={cx} cy="54" rx="4.7" ry="6.4" fill="#000" />
                <circle cx={cx - 1.9} cy="51" r="1.8" fill="#fff" />
                <circle cx={cx + 2} cy="57" r="0.9" fill="#fff" opacity="0.8" />
              </g>
            </g>
          ))}
          <rect x="36" y="42" width="48" height="22" fill="var(--cat)" className={still ? 'cat-lid' : 'cat-lid cat-blink'} />
        </>
      )}

      {/* Pipi, hidung, mulut, kumis */}
      <ellipse cx="33" cy="66" rx="5.5" ry="3.2" fill="#ff7f9f" opacity={happy ? 0.7 : 0.32} />
      <ellipse cx="87" cy="66" rx="5.5" ry="3.2" fill="#ff7f9f" opacity={happy ? 0.7 : 0.32} />
      <path d="M57.4 63 Q60 61.6 62.6 63 Q61.6 66.2 60 67.2 Q58.4 66.2 57.4 63 Z" fill={PINK} />
      <path d="M60 67.2 Q57.5 71 54.5 69 M60 67.2 Q62.5 71 65.5 69" fill="none" stroke={PINK} strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="60" cy="72.5" rx="4.6" ry="4.2" fill="#e8718f" className="cat-yawn" />
      <g stroke="#9c9c9c" strokeWidth="0.9" strokeLinecap="round" opacity="0.85">
        <path d="M27 63 L10 59 M27 67 L11 69" />
        <path d="M93 63 L110 59 M93 67 L109 69" />
      </g>
    </svg>
  )
}

export function CatLoaf({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 75" preserveAspectRatio="xMidYMax meet" className={`cat-svg ${className}`} aria-hidden="true" focusable="false">
      <ellipse cx="72" cy="70.5" rx="56" ry="3" fill="var(--ink)" opacity="0.1" />
      <g fill="var(--cat)">
        <path d="M122 57 Q139 57 134 67 Q130 72 118 70" fill="none" stroke="var(--cat)" strokeWidth="8" strokeLinecap="round" />
        <g className="cat-breathe">
          <ellipse cx="84" cy="50" rx="42" ry="20" />
          <path d="M12 36 Q8 14 19 7 Q24 6 28 9 Q36 14 38 24 Z" />
          <path d="M56 36 Q60 14 49 7 Q44 6 40 9 Q32 14 30 24 Z" />
          <ellipse cx="34" cy="44" rx="26" ry="22" />
        </g>
      </g>
      <path d="M17 30 Q15 18 20 13 Q27 16 30 23 Z" fill={EAR} />
      <path d="M51 30 Q53 18 48 13 Q41 16 38 23 Z" fill={EAR} />
      <path d="M20 46 Q25 50.5 30 46 M38 46 Q43 50.5 48 46" fill="none" stroke={EYE} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="15" cy="54" rx="4.6" ry="2.8" fill="#ff7f9f" opacity="0.32" />
      <ellipse cx="53" cy="54" rx="4.6" ry="2.8" fill="#ff7f9f" opacity="0.32" />
      <path d="M32.2 51 Q34 50 35.8 51 Q35 53.2 34 54 Q33 53.2 32.2 51 Z" fill={PINK} />
    </svg>
  )
}
