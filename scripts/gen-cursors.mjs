/**
 * Membuat kursor piksel di public/cursors/ dari kisi ASCII (umumnya 16x16, dirender 2x = 32 px, tajam tanpa anti-alias).
 * Jalankan ulang setelah mengubah gambar: `node scripts/gen-cursors.mjs`.
 * Titik klik (hotspot) tiap kursor dicatat di HOTSPOTS dan dipakai di src/styles/globals.css (dikali 2).
 *
 * Simbol: X = isi, o = garis tepi, w = sorotan, . = transparan.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const OUT = path.join(process.cwd(), 'public', 'cursors')
const SCALE = 2

const CURSORS = {
  // 1. Panah piksel: biru HMTI bergaris putih, terbaca di tema terang dan gelap.
  piksel: {
    colors: { X: '#3e4094', o: '#f7f8fc', w: '#b4d6fe' },
    grid: [
      'o...............',
      'oo..............',
      'oXo.............',
      'oXwo............',
      'oXwXo...........',
      'oXwXXo..........',
      'oXwXXXo.........',
      'oXXXXXXo........',
      'oXXXXXXXo.......',
      'oXXXXXXXXo......',
      'oXXXXXoooo......',
      'oXXoXXo.........',
      'oXo.oXXo........',
      'oo..oXXo........',
      'o....oXXo.......',
      '.....oooo.......',
    ],
  },
  'piksel-tunjuk': {
    colors: { X: '#3e4094', o: '#f7f8fc', w: '#b4d6fe' },
    grid: [
      '.....oo.........',
      '....oXXo........',
      '....owXo........',
      '....owXo........',
      '....oXXooo......',
      '....oXXoXXooo...',
      '.oo.oXXoXXoXXo..',
      'oXXooXXXXXXXXXo.',
      'oXXXoXXXXXXXXXo.',
      '.oXXXXXXXXXXXXo.',
      '..oXXXXXXXXXXXo.',
      '..oXXXXXXXXXXo..',
      '...oXXXXXXXXXo..',
      '...oXXXXXXXXo...',
      '....oXXXXXXXo...',
      '....ooooooooo...',
    ],
  },
  // 2. Teemo: panah hitam pekat dengan ekor kucing melengkung; tunjuk = jejak kaki.
  teemo: {
    colors: { X: '#000000', o: '#f4f5fa', w: '#3a3a3a' },
    grid: [
      'o...............',
      'oo..............',
      'oXo.............',
      'oXXo............',
      'oXXXo...........',
      'oXXXXo..........',
      'oXXXXXo.........',
      'oXXXXXXo........',
      'oXXXXXXXo.......',
      'oXXXXoooo.......',
      'oXXoXXo.........',
      'oXo.oXXo....oo..',
      'oo..oXXo...oXXo.',
      'o....oXXo..oXXo.',
      '.....oXXo..oXXo.',
      '......oXXooXXo..',
      '.......oXXXXo...',
      '........oooo....',
    ],
  },
  'teemo-tunjuk': {
    colors: { X: '#000000', o: '#f4f5fa', w: '#3a3a3a' },
    grid: [
      '....oo....oo....',
      '...oXXo..oXXo...',
      '...oXXo..oXXo...',
      '.oo.oo....oo.oo.',
      'oXXo........oXXo',
      'oXXo..oooo..oXXo',
      '.oo..oXXXXo..oo.',
      '....oXXXXXXo....',
      '...oXXXXXXXXo...',
      '...oXXXXXXXXo...',
      '...oXXXXXXXXo...',
      '....oXXooXXo....',
      '.....oo..oo.....',
      '................',
      '................',
      '................',
    ],
  },
  // 3. All Blue: Inti Bintang (core spark) bersinar di tengah; tunjuk = bintang dalam cincin pusaran piksel.
  allblue: {
    colors: { X: '#b4d6fe', o: '#16233a', w: '#ffffff' },
    grid: [
      '.......o........',
      '......oXo.......',
      '......oXo.......',
      '.....oXwXo......',
      '.....oXwXo......',
      '....oXXwXXo.....',
      '..ooXXXwXXXoo...',
      'ooXXXXwwwXXXXoo.',
      '..ooXXXwXXXoo...',
      '....oXXwXXo.....',
      '.....oXwXo......',
      '.....oXwXo......',
      '......oXo.......',
      '......oXo.......',
      '.......o........',
      '................',
    ],
  },
  'allblue-tunjuk': {
    colors: { X: '#b4d6fe', o: '#16233a', w: '#ffffff' },
    grid: [
      '....oX.oXo.Xo...',
      '..oX....o....Xo.',
      '.o......o......o',
      '.X.....oXo.....X',
      'o......oXo......',
      'X.....oXwXo....o',
      '.....oXXwXXo...X',
      'o.ooXXwwwwwXXoo.',
      'X....oXXwXXo....',
      '......oXwXo....X',
      'o......oXo.....o',
      '.X.....oXo....X.',
      '..o.....o....o..',
      '...Xo...o..oX...',
      '.....oX.oXo.....',
      '................',
    ],
  },
}

/** Titik klik dalam satuan kisi (sebelum dikali SCALE). */
export const HOTSPOTS = {
  piksel: [0, 0],
  'piksel-tunjuk': [5, 0],
  teemo: [0, 0],
  'teemo-tunjuk': [8, 7],
  allblue: [7, 7],
  'allblue-tunjuk': [8, 7],
}

fs.mkdirSync(OUT, { recursive: true })
for (const [name, { colors, grid }] of Object.entries(CURSORS)) {
  const rects = grid
    .flatMap((row, y) => [...row].map((ch, x) => (colors[ch] ? `<rect x="${x}" y="${y}" width="1" height="1" fill="${colors[ch]}"/>` : '')))
    .join('')
  const [w, h] = [grid[0].length, grid.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * SCALE}" height="${h * SCALE}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects}</svg>`
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, `${name}.png`))
  console.log(`public/cursors/${name}.png  hotspot ${HOTSPOTS[name].map((n) => n * SCALE).join(' ')}`)
}
