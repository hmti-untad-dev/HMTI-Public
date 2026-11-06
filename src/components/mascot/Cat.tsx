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

/** Gerigi bulu hanya di busur atas (dari sudut a0 ke a1, radian), ditutup lewat pusat agar menyatu dengan badan. */
function arcTufts(cx: number, cy: number, rx: number, ry: number, n: number, out: number, a0: number, a1: number) {
  const pts: string[] = [`${cx},${cy}`]
  const step = (a1 - a0) / n
  for (let i = 0; i <= n; i++) {
    const a = a0 + i * step
    pts.push(`${(cx + rx * 0.96 * Math.cos(a)).toFixed(1)},${(cy + ry * 0.96 * Math.sin(a)).toFixed(1)}`)
    if (i < n) {
      const b = a + step / 2
      pts.push(`${(cx + rx * (1 + out) * Math.cos(b)).toFixed(1)},${(cy + ry * (1 + out) * Math.sin(b)).toFixed(1)}`)
    }
  }
  return pts.join(' ')
}

const LOAF_BODY_FLUFF = arcTufts(70, 70, 52, 26, 18, 0.12, Math.PI * 1.02, Math.PI * 1.98)
const LOAF_HEAD_FLUFF = tufts(70, 46, 31, 25, 16, 0.16)
const LOAF_CHEEK_FLUFF = arcTufts(70, 50, 33, 22, 8, 0.2, Math.PI * 0.12, Math.PI * 0.88)

/**
 * Pose roti (cat loaf) menghadap depan: badan bulat-lonjong seperti roti tawar, kaki terlipat di bawah (tidak
 * terlihat), ekor melingkar di depan, kepala tenggelam di atas badan, mata terpejam. Bulu tebal di punggung dan
 * pipi supaya terlihat empuk. Seluruh tubuh bernapas pelan (cat-breathe), kepala ikut naik turun.
 */
export function CatLoaf({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 100" preserveAspectRatio="xMidYMax meet" className={`cat-svg ${className}`} aria-hidden="true" focusable="false">
      <ellipse cx="70" cy="95.5" rx="56" ry="3.4" fill="var(--ink)" opacity="0.12" />
      <g className="cat-breathe">
        <g fill="var(--cat)">
          {/* Badan roti: setengah elips di atas, dasar datar membulat. */}
          <ellipse cx="70" cy="70" rx="52" ry="26" />
          <rect x="18" y="70" width="104" height="24" rx="16" />
          <polygon points={LOAF_BODY_FLUFF} />
          {/* Telinga luar */}
          <path d="M44 36 Q38 13 49 7 Q53 6 56 9 Q65 15 67 26 Z" />
          <path d="M96 36 Q102 13 91 7 Q87 6 84 9 Q75 15 73 26 Z" />
          {/* Kepala dan bulu pipi */}
          <ellipse cx="70" cy="46" rx="31" ry="25" />
          <polygon points={LOAF_HEAD_FLUFF} />
          <polygon points={LOAF_CHEEK_FLUFF} />
          {/* Ekor melingkar di depan badan, ujungnya mengembang. */}
          <path d="M120 84 Q130 96 106 95 Q88 94.5 78 92" fill="none" stroke="var(--cat)" strokeWidth="9" strokeLinecap="round" />
          <circle cx="78" cy="91.5" r="5.6" />
        </g>
        {/* Kilau bulu tipis di punggung, kesan empuk. */}
        <g fill="none" stroke="var(--cat-rim)" strokeWidth="1.1" strokeLinecap="round" opacity="0.55">
          <path d="M30 66 q3 -3 6 0 M106 66 q3 -3 6 0 M24 78 q3 -3 6 0 M112 78 q3 -3 6 0" />
        </g>
        {/* Telinga dalam */}
        <path d="M48 30 Q45 17 50 12 Q57 15 60 23 Z" fill={EAR} />
        <path d="M92 30 Q95 17 90 12 Q83 15 80 23 Z" fill={EAR} />
        {/* Mata terpejam, pipi, hidung, mulut w, kumis */}
        <path d="M53 47 Q58.5 52.5 64 47 M76 47 Q81.5 52.5 87 47" fill="none" stroke={EYE} strokeWidth="2.4" strokeLinecap="round" />
        <ellipse cx="49" cy="56" rx="5" ry="3" fill="#ff7f9f" opacity="0.4" />
        <ellipse cx="91" cy="56" rx="5" ry="3" fill="#ff7f9f" opacity="0.4" />
        <path d="M67.6 54 Q70 52.8 72.4 54 Q71.5 56.8 70 57.6 Q68.5 56.8 67.6 54 Z" fill={PINK} />
        <path d="M70 57.6 Q68 60.6 65.6 59 M70 57.6 Q72 60.6 74.4 59" fill="none" stroke={PINK} strokeWidth="1.1" strokeLinecap="round" />
        <g stroke="#9c9c9c" strokeWidth="0.8" strokeLinecap="round" opacity="0.8">
          <path d="M43 55 L28 52 M43 58.5 L29 60" />
          <path d="M97 55 L112 52 M97 58.5 L111 60" />
        </g>
        {/* Kalung dan lonceng */}
        <path d="M47 67 Q70 76 93 67" fill="none" stroke="#5253ad" strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="70" cy="73.4" r="3.2" fill="#f2b01e" />
        <circle cx="69" cy="72.4" r="0.9" fill="#fff" opacity="0.8" />
      </g>
    </svg>
  )
}

/**
 * Teemo berjalan, tampak samping menghadap kanan (gaya kepala besar yang sama). Kaki diayun lewat kelas
 * cat-leg-a / cat-leg-b, badan memantul lewat cat-bob, kepala mengendus lewat cat-head (animasi di globals.css,
 * aktif bila pembungkus memberi kelas cat-walking atau cat-sniffing).
 */
export function CatWalk({ className = '' }: { className?: string }) {
  const leg = (x: number, cls: string) => (
    <g className={cls} style={{ transformOrigin: `${x}px 70px` }}>
      <path d={`M${x} 70 V88`} stroke="var(--cat)" strokeWidth="7.5" strokeLinecap="round" />
    </g>
  )
  return (
    <svg viewBox="0 0 140 100" preserveAspectRatio="xMidYMax meet" className={`cat-svg ${className}`} aria-hidden="true" focusable="false">
      <ellipse cx="74" cy="95" rx="40" ry="3" fill="var(--ink)" opacity="0.12" />
      <g transform="translate(0 4)">
        {/* Kaki belakang dan depan sisi jauh sedikit lebih gelap */}
        <g opacity="0.75">
          {leg(54, 'cat-leg-b')}
          {leg(88, 'cat-leg-a')}
        </g>
        <g className="cat-bob">
          <g fill="var(--cat)">
            <g className="cat-tail-walk" style={{ transformOrigin: '46px 62px' }}>
              <path d="M48 62 Q26 60 30 34 Q31 28 36 30" fill="none" stroke="var(--cat)" strokeWidth="8" strokeLinecap="round" />
            </g>
            <ellipse cx="70" cy="64" rx="27" ry="16" />
            <polygon points={tufts(70, 64, 27, 16, 12, 0.15)} />
          </g>
          <g className="cat-head" style={{ transformOrigin: '98px 64px' }}>
            <g fill="var(--cat)">
              <path d="M86 30 Q80 9 91 4 Q95 4 98 7 Q105 15 105 25 Z" />
              <path d="M110 25 Q113 8 123 6 Q127 7 127 12 Q127 23 121 31 Z" />
              <ellipse cx="104" cy="42" rx="27" ry="23" />
              <polygon points={tufts(104, 42, 27, 23, 14, 0.15)} />
            </g>
            <path d="M89 25 Q86 14 92 10 Q99 15 100 22 Z" fill={EAR} />
            <path d="M113 23 Q116 13 122 11 Q123 19 119 27 Z" fill={EAR} />
            {[98, 116].map((cx) => (
              <g key={cx}>
                <ellipse cx={cx} cy="43" rx="6.2" ry="7.2" fill={EYE} />
                <ellipse cx={cx + 1.2} cy="44" rx="3.4" ry="4.8" fill="#000" />
                <circle cx={cx - 0.4} cy="41.4" r="1.4" fill="#fff" />
              </g>
            ))}
            <ellipse cx="91" cy="53" rx="4" ry="2.4" fill="#ff7f9f" opacity="0.35" />
            <ellipse cx="124" cy="53" rx="3.6" ry="2.4" fill="#ff7f9f" opacity="0.35" />
            <path d="M108 51 Q110 50 112 51 Q111.3 53.4 110 54 Q108.7 53.4 108 51 Z" fill={PINK} />
            <path d="M110 54 Q108.4 56.6 106.4 55.4 M110 54 Q111.6 56.6 113.6 55.4" fill="none" stroke={PINK} strokeWidth="1" strokeLinecap="round" />
            <g stroke="#9c9c9c" strokeWidth="0.8" strokeLinecap="round" opacity="0.8">
              <path d="M118 52 L134 49 M118 55 L133 57" />
            </g>
            <path d="M84 60 Q96 66 110 61" fill="none" stroke="#5253ad" strokeWidth="3.2" strokeLinecap="round" />
            <circle cx="97" cy="65" r="2.8" fill="#f2b01e" />
          </g>
        </g>
        {/* Kaki sisi dekat */}
        {leg(60, 'cat-leg-a')}
        {leg(94, 'cat-leg-b')}
      </g>
    </svg>
  )
}
