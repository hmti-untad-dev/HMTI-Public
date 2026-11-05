'use server'

import { getClient, getSiteSettings } from '@/lib/data'

export type ContactInput = {
  name: string
  email: string
  phone?: string
  topic?: string
  message: string
  source: 'kontak' | 'layanan'
  /** Honeypot: kolom tersembunyi yang hanya diisi bot. */
  website?: string
}
export type ContactResult = { ok: true } | { ok: false; error: string; field?: 'name' | 'email' | 'phone' | 'message' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[+\d][\d\s-]{6,19}$/
const MAX_LEN = 2000
const PER_EMAIL_PER_HOUR = 5
const GLOBAL_PER_MINUTE = 40

const clean = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)

/**
 * Menerima pesan dari form Kontak dan form tiap layanan. Validasi di server (jangan percaya klien), dilindungi
 * honeypot dan batas laju, lalu disimpan di koleksi "Pesan Masuk". Bila SMTP dikonfigurasi (payload.config.ts),
 * pesan juga dikirim ke email himpunan dengan Reply-To = email pengirim, jadi admin cukup menekan "Balas".
 */
export async function sendContactMessage(input: ContactInput): Promise<ContactResult> {
  if (input.website) return { ok: true } // bot: pura-pura berhasil

  const name = clean(input.name, 120)
  const email = clean(input.email, 254).toLowerCase()
  const phone = clean(input.phone, 40)
  const topic = clean(input.topic, 120)
  const message = clean(input.message, MAX_LEN + 1)
  const source = input.source === 'layanan' ? 'layanan' : 'kontak'

  if (name.length < 2) return { ok: false, field: 'name', error: 'Tulis nama kamu.' }
  if (!EMAIL_RE.test(email)) return { ok: false, field: 'email', error: 'Format email belum benar, contoh: nama@gmail.com.' }
  if (phone && !PHONE_RE.test(phone)) return { ok: false, field: 'phone', error: 'Nomor hanya boleh angka, spasi, tanda + atau -.' }
  if (message.length < 10) return { ok: false, field: 'message', error: 'Ceritakan sedikit lebih detail (minimal 10 karakter).' }
  if (message.length > MAX_LEN) return { ok: false, field: 'message', error: `Pesan maksimal ${MAX_LEN} karakter.` }

  const payload = await getClient()
  const hourAgo = new Date(Date.now() - 3_600_000).toISOString()
  const minuteAgo = new Date(Date.now() - 60_000).toISOString()
  const [byEmail, overall] = await Promise.all([
    payload.count({ collection: 'chat-messages', where: { and: [{ email: { equals: email } }, { createdAt: { greater_than: hourAgo } }] } }),
    payload.count({ collection: 'chat-messages', where: { createdAt: { greater_than: minuteAgo } } }),
  ])
  if (byEmail.totalDocs >= PER_EMAIL_PER_HOUR || overall.totalDocs >= GLOBAL_PER_MINUTE) {
    return { ok: false, error: 'Terlalu banyak pesan dalam waktu singkat. Coba lagi beberapa menit lagi.' }
  }

  try {
    await payload.create({
      collection: 'chat-messages',
      data: { name, email, phone: phone || undefined, topic: topic || undefined, message, source },
      overrideAccess: false,
    })
  } catch {
    return { ok: false, error: 'Pesan belum terkirim karena gangguan server. Coba lagi, atau email kami langsung.' }
  }

  try {
    const to = (await getSiteSettings()).contact?.email
    if (to) {
      await payload.sendEmail({
        to,
        replyTo: email,
        subject: `[Situs HMTI] ${topic || (source === 'layanan' ? 'Permintaan layanan' : 'Pesan baru')} dari ${name}`,
        text: [`Nama: ${name}`, `Email: ${email}`, phone ? `Telepon/WA: ${phone}` : '', topic ? `Topik: ${topic}` : ''].filter(Boolean).join('\n') + `\n\n${message}`,
      })
    }
  } catch {
    /* pesan sudah tersimpan di admin; kegagalan email tidak membatalkan */
  }
  return { ok: true }
}

export type ContactState = (ContactResult & { values?: Record<string, string>; email?: string; at: number }) | null

/**
 * Versi untuk `useActionState` + `<form action>`: tetap berfungsi walau JavaScript belum termuat (form dikirim
 * sebagai POST ke server action, data tidak pernah masuk URL). Saat gagal, isian dikembalikan supaya tidak hilang.
 */
export async function contactAction(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const get = (k: string) => String(formData.get(k) ?? '')
  const values = { name: get('name'), email: get('email'), phone: get('phone'), topic: get('topic'), message: get('message') }
  const res = await sendContactMessage({ ...values, website: get('website'), source: get('source') === 'layanan' ? 'layanan' : 'kontak' })
  return res.ok ? { ...res, email: values.email.trim(), at: Date.now() } : { ...res, values, at: Date.now() }
}
