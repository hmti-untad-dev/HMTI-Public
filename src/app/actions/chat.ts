'use server'

import { getClient, getSiteSettings } from '@/lib/data'

export type ChatResult = { ok: true } | { ok: false; error: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_LEN = 1500
const PER_EMAIL_PER_HOUR = 5
const GLOBAL_PER_MINUTE = 40

/**
 * Menerima pesan dari kolom chat di FAQ. Pengirim tidak perlu login: cukup email + pesan.
 * Pesan disimpan di koleksi "Pesan Masuk" (admin) dan, bila adapter email Payload sudah dikonfigurasi,
 * diteruskan ke email himpunan dengan Reply-To = email pengirim. Dilindungi honeypot dan batas laju.
 */
export async function sendChatMessage(input: { email: string; message: string; website?: string }): Promise<ChatResult> {
  if (input.website) return { ok: true } // honeypot terisi: bot. Pura-pura berhasil.

  const email = String(input.email ?? '').trim().toLowerCase().slice(0, 254)
  const message = String(input.message ?? '').trim()
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Format email belum benar.' }
  if (message.length < 3) return { ok: false, error: 'Pesan terlalu pendek.' }
  if (message.length > MAX_LEN) return { ok: false, error: `Pesan maksimal ${MAX_LEN} karakter.` }

  const payload = await getClient()
  const hourAgo = new Date(Date.now() - 3_600_000).toISOString()
  const minuteAgo = new Date(Date.now() - 60_000).toISOString()
  const [byEmail, overall] = await Promise.all([
    payload.count({ collection: 'chat-messages', where: { and: [{ email: { equals: email } }, { createdAt: { greater_than: hourAgo } }] } }),
    payload.count({ collection: 'chat-messages', where: { createdAt: { greater_than: minuteAgo } } }),
  ])
  if (byEmail.totalDocs >= PER_EMAIL_PER_HOUR || overall.totalDocs >= GLOBAL_PER_MINUTE) {
    return { ok: false, error: 'Terlalu banyak pesan. Coba lagi sebentar lagi.' }
  }

  try {
    await payload.create({ collection: 'chat-messages', data: { email, message }, overrideAccess: false })
  } catch {
    return { ok: false, error: 'Pesan belum terkirim. Coba lagi.' }
  }

  try {
    const to = (await getSiteSettings()).contact?.email
    if (to) await payload.sendEmail({ to, replyTo: email, subject: 'Pesan baru dari situs HMTI UNTAD', text: `Dari: ${email}\n\n${message}` })
  } catch {
    /* pesan sudah tersimpan di admin; kegagalan email tidak membatalkan */
  }
  return { ok: true }
}
