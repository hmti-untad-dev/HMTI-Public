import { type CSSProperties, useId } from 'react'

/**
 * Teemo, maskot kucing hitam HMTI. Gaya: gemoy (kepala besar, badan mungil), siluet hitam pekat tanpa garis
 * tepi, mata kuning. Dua pose:
 *  - CatSit: duduk. `lid` 0..1 menutup kelopak, `yawn` 0..1 membuka mulut, `fluff` meruncingkan bulu
 *    (juga aktif saat di-hover lewat .teemo), `wide` membelalakkan mata (kaget).
 *  - CatSleep: tidur berbaring menyamping di atas bantal (Cushion), mata terpejam.
 *  - CatWalk: berjalan tampak samping.
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

/** Tepi bulu bergelombang lembut (bukan gerigi runcing) di sepanjang busur elips dari a0 ke a1 (radian). */
function scallop(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n: number, bulge: number) {
  const pt = (a: number, k = 1) => `${(cx + rx * k * Math.cos(a)).toFixed(1)} ${(cy + ry * k * Math.sin(a)).toFixed(1)}`
  const step = (a1 - a0) / n
  let d = pt(a0)
  for (let i = 0; i < n; i++) d += ` Q${pt(a0 + (i + 0.5) * step, 1 + bulge)} ${pt(a0 + (i + 1) * step)}`
  return d
}

// Kucing tidur berbaring menyamping (menghadap kanan): badan lonjong berbulu, paha belakang, kepala bertumpu
// di atas kedua kaki depan, ekor melingkar di depan badan.
const SLEEP_BODY = `M26 76 ${scallop(72, 76, 46, 20, Math.PI, Math.PI * 2, 10, 0.1).replace(/^[\d.]+ [\d.]+/, '')} A46 20 0 0 1 26 76 Z`
const SLEEP_TAIL = 'M30 82 Q12 96 38 98.5 Q70 101 98 96'
/** Garis lipatan bulu: memisahkan kepala, kaki, dan ekor dari badan yang sama-sama hitam. */
const SEP = '#353742'

/**
 * Pose tidur untuk layar AFK: Teemo berbaring menyamping di atas bantal, kepala (gaya kepala besar yang sama
 * dengan CatWalk) bertumpu di kedua kaki depan, mata terpejam, ekor melingkar di depan badan, telinga sedikit
 * terkulai. Kepala, kaki, paha, dan ekor dipisah dari badan oleh garis lipatan tipis (SEP; di dalam siluet badan
 * lewat clipPath) agar bentuknya terbaca walau semuanya hitam. Badan bernapas pelan (cat-breathe).
 */
export function CatSleep({ className = '' }: { className?: string }) {
  const clip = `sleep-${useId().replace(/:/g, '')}`
  // Kepala memakai koordinat lokal CatWalk (pusat 104,42), digeser ke depan badan dan sedikit menunduk.
  const head = 'translate(12 25) rotate(7 104 42)'
  return (
    <svg viewBox="0 0 160 104" preserveAspectRatio="xMidYMax meet" className={`cat-svg ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clip}>
          <path d={SLEEP_BODY} />
          <ellipse cx="48" cy="80" rx="22" ry="16" />
        </clipPath>
      </defs>
      <g className="cat-breathe">
        <g fill="var(--cat)">
          <path d={SLEEP_BODY} />
          <ellipse cx="48" cy="80" rx="22" ry="16" />
        </g>
        {/* Lipatan di dalam badan: paha belakang, kepala, ekor. */}
        <g clipPath={`url(#${clip})`} fill="none" stroke={SEP} strokeLinecap="round">
          <path d="M33 70 Q48 59 66 70" strokeWidth="1.6" />
          <ellipse transform={head} cx="104" cy="42" rx="27" ry="23" strokeWidth="3" />
          <path d={SLEEP_TAIL} strokeWidth="11.5" />
        </g>
        {/* Kilau bulu di punggung, kesan lembut. */}
        <path d="M60 62 q4 -3.5 8 0 M80 60 q4 -3.5 8 0" fill="none" stroke={SEP} strokeWidth="1.2" strokeLinecap="round" />
        {/* Ekor melingkar di depan, kaki depan terjulur di bawah dagu. */}
        <path d={SLEEP_TAIL} fill="none" stroke="var(--cat)" strokeWidth="8.5" strokeLinecap="round" />
        <g fill="var(--cat)" stroke={SEP} strokeWidth="1.2">
          <ellipse cx="114" cy="95.5" rx="11" ry="4.6" />
          <ellipse cx="127" cy="93" rx="13" ry="5.2" />
        </g>
        <path d="M133 95.6 v-2.4 M138 94.6 v-2.4" stroke={SEP} strokeWidth="1.1" strokeLinecap="round" />

        <g transform={head}>
          <g fill="var(--cat)">
            <path transform="rotate(-10 96 26)" d="M86 30 Q80 9 91 4 Q95 4 98 7 Q105 15 105 25 Z" />
            <path transform="rotate(12 116 27)" d="M110 25 Q113 8 123 6 Q127 7 127 12 Q127 23 121 31 Z" />
            <ellipse cx="104" cy="42" rx="27" ry="23" />
            <polygon points={tufts(104, 42, 27, 23, 16, 0.06)} />
          </g>
          <path transform="rotate(-10 96 26)" d="M89 25 Q86 14 92 10 Q99 15 100 22 Z" fill={EAR} />
          <path transform="rotate(12 116 27)" d="M113 23 Q116 13 122 11 Q123 19 119 27 Z" fill={EAR} />
          {/* Mata terpejam berbulu mata */}
          <g fill="none" stroke="#a3a6b3" strokeWidth="2" strokeLinecap="round">
            <path d="M92 44 Q98 49 104 44 M110 44 Q116 49 122 44" />
            <path d="M93.4 46.2 l-2 1.4 M120.6 46.2 l2 1.4" strokeWidth="1.3" />
          </g>
          <ellipse cx="90" cy="53" rx="4.4" ry="2.6" fill="#ff7f9f" opacity="0.45" />
          <ellipse cx="124" cy="53" rx="4" ry="2.6" fill="#ff7f9f" opacity="0.45" />
          <path d="M108 51 Q110 50 112 51 Q111.3 53.4 110 54 Q108.7 53.4 108 51 Z" fill={PINK} />
          <path d="M110 54 Q108.4 56.6 106.4 55.4 M110 54 Q111.6 56.6 113.6 55.4" fill="none" stroke={PINK} strokeWidth="1" strokeLinecap="round" />
          <g stroke="#9c9c9c" strokeWidth="0.8" strokeLinecap="round" opacity="0.8">
            <path d="M119 53 L134 52 M119 56 L133 59" />
            <path d="M92 56 L78 55 M92 59 L79 62" />
          </g>
          <path d="M86 61 Q98 67 112 62" fill="none" stroke="#5253ad" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="99" cy="66" r="2.8" fill="#f2b01e" />
        </g>
      </g>
    </svg>
  )
}

/** Bantal biru HMTI tempat Teemo tidur; muncul saat ia menemukan "tempat empuk". */
export function Cushion({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 34" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="30.5" rx="92" ry="3.2" fill="var(--ink)" opacity="0.12" />
      <path d="M14 9 Q100 -1 186 9 Q197 17 186 25 Q100 33 14 25 Q3 17 14 9 Z" fill="#5253ad" />
      <path d="M24 11 Q100 3 176 11" fill="none" stroke="#8183d6" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M23 14 Q100 6 177 14 Q184 17.5 177 21 Q100 28 23 21 Q16 17.5 23 14 Z" fill="none" stroke="#b4d6fe" strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />
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
