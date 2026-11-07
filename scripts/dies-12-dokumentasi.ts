/** Sekali jalan untuk database yang sudah berisi: `npx payload run scripts/dies-12-dokumentasi.ts` (hentikan server dulu). */
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { documentDies12 } from './data/dies-12'

const payload = await getPayload({ config })
console.log(await documentDies12(payload) ? 'Dokumentasi Dies ke-12 terpasang.' : 'Berita atau program Dies belum ada.')
process.exit(0)
