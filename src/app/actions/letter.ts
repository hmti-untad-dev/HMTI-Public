'use server'

import { getActiveLoans, getClient, getPublicInventory, getSiteSettings } from '@/lib/data'
import { availableQty, dayOfInput, today } from '@/lib/inventory'

export type LetterField = 'name' | 'email' | 'phone' | 'organization' | 'subject' | 'letterNumber' | 'neededDate' | 'note' | 'letter' | 'loanFrom' | 'loanTo' | 'items'
export type LetterState =
  | { ok: true; trackingCode: string; email: string; at: number }
  | { ok: false; error: string; field?: LetterField; values?: Record<string, string>; at: number }
  | null

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[+\d][\d\s-]{6,19}$/
const MAX_BYTES = 5 * 1024 * 1024
const PER_EMAIL_PER_HOUR = 3
const GLOBAL_PER_MINUTE = 15

/** Jenis berkas yang diterima, dikenali dari tanda tangan bita awalnya (bukan dari nama/MIME kiriman klien). */
const KINDS = [
  { ext: 'pdf', mime: 'application/pdf', magic: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', magic: [0x50, 0x4b, 0x03, 0x04] },
  { ext: 'jpg', mime: 'image/jpeg', magic: [0xff, 0xd8, 0xff] },
  { ext: 'png', mime: 'image/png', magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
]

const clean = (v: FormDataEntryValue | null, max: number) => String(v ?? '').trim().slice(0, max)

/**
 * Formulir layanan organisasi dengan unggah surat. Semua validasi di server: honeypot, batas laju per email dan
 * global, layanan harus aktif dan bergrup "organisasi", berkas PDF/DOCX/JPG/PNG maks. 5 MB yang dicek dari isi
 * bitanya. Surat disimpan di koleksi privat "letters", permintaan di "service-requests" dengan kode pelacakan.
 * Bila SMTP aktif, email himpunan menerima pemberitahuan berlampirkan surat (Reply-To = pemohon).
 * Tidak ada email otomatis ke alamat pemohon, supaya formulir tidak bisa dipakai mengirim spam ke orang lain.
 */
export async function letterAction(_prev: LetterState, formData: FormData): Promise<LetterState> {
  const at = Date.now()
  const values = {
    name: clean(formData.get('name'), 120),
    email: clean(formData.get('email'), 254).toLowerCase(),
    phone: clean(formData.get('phone'), 40),
    organization: clean(formData.get('organization'), 160),
    subject: clean(formData.get('subject'), 200),
    letterNumber: clean(formData.get('letterNumber'), 120),
    neededDate: clean(formData.get('neededDate'), 10),
    note: clean(formData.get('note'), 1501),
    loanFrom: clean(formData.get('loanFrom'), 10),
    loanTo: clean(formData.get('loanTo'), 10),
  }
  const fail = (error: string, field?: LetterField): LetterState => ({ ok: false, error, field, values, at })

  if (formData.get('website')) return { ok: true, trackingCode: 'HMTI-00000000', email: values.email, at } // bot
  const serviceSlug = clean(formData.get('service'), 80)

  if (values.name.length < 2) return fail('Tulis nama pemohon.', 'name')
  if (!EMAIL_RE.test(values.email)) return fail('Format email belum benar, contoh: nama@gmail.com.', 'email')
  if (values.phone && !PHONE_RE.test(values.phone)) return fail('Nomor hanya boleh angka, spasi, tanda + atau -.', 'phone')
  if (values.organization.length < 2) return fail('Tulis nama organisasi atau instansi.', 'organization')
  if (values.subject.length < 4) return fail('Tulis perihal surat.', 'subject')
  if (values.neededDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.neededDate)) return fail('Tanggal belum benar.', 'neededDate')
  if (values.note.length > 1500) return fail('Keterangan maksimal 1.500 karakter.', 'note')

  const file = formData.get('letter')
  if (!(file instanceof File) || file.size === 0) return fail('Lampirkan surat (PDF, DOCX, JPG, atau PNG).', 'letter')
  if (file.size > MAX_BYTES) return fail('Ukuran surat maksimal 5 MB.', 'letter')
  const data = Buffer.from(await file.arrayBuffer())
  const kind = KINDS.find((k) => k.magic.every((b, i) => data[i] === b))
  if (!kind) return fail('Berkas harus PDF, DOCX, JPG, atau PNG.', 'letter')

  const payload = await getClient()
  const service = (await payload.find({ collection: 'services', where: { slug: { equals: serviceSlug } }, limit: 1, depth: 0 })).docs[0]
  if (!service || !service.active || service.group !== 'organisasi') return fail('Layanan ini sedang tidak menerima surat.')

  // Peminjaman inventaris: tanggal pinjam/kembali dan barang wajib; jumlah dicek terhadap sisa stok di rentang itu.
  const isLoan = service.slug === 'peminjaman-inventaris'
  let items: { item: number; quantity: number }[] = []
  if (isLoan) {
    const DATE = /^\d{4}-\d{2}-\d{2}$/
    if (!DATE.test(values.loanFrom)) return fail('Isi tanggal pinjam.', 'loanFrom')
    if (!DATE.test(values.loanTo)) return fail('Isi tanggal kembali.', 'loanTo')
    const from = dayOfInput(values.loanFrom)
    const to = dayOfInput(values.loanTo)
    if (from < today()) return fail('Tanggal pinjam tidak boleh sebelum hari ini.', 'loanFrom')
    if (to < from) return fail('Tanggal kembali harus sama atau setelah tanggal pinjam.', 'loanTo')
    if (to - from > 30) return fail('Lama peminjaman maksimal 30 hari.', 'loanTo')
    const [catalog, loans] = await Promise.all([getPublicInventory(), getActiveLoans()])
    for (const [key, raw] of formData.entries()) {
      const m = key.match(/^qty_(\d+)$/)
      const quantity = Math.floor(Number(raw))
      if (!m || !Number.isFinite(quantity) || quantity <= 0) continue
      const item = catalog.find((c) => c.id === Number(m[1]) && c.loanable)
      if (!item) return fail('Ada barang yang tidak bisa dipinjam. Muat ulang halaman lalu pilih lagi.', 'items')
      const free = availableQty(item, loans, from, to)
      if (quantity > free) return fail(`${item.name} hanya tersedia ${free} pada tanggal itu.`, 'items')
      items.push({ item: item.id, quantity })
    }
    items = items.slice(0, 50)
    if (items.length === 0) return fail('Pilih minimal satu barang yang ingin dipinjam.', 'items')
  }

  const hourAgo = new Date(at - 3_600_000).toISOString()
  const minuteAgo = new Date(at - 60_000).toISOString()
  const [byEmail, overall] = await Promise.all([
    payload.count({ collection: 'service-requests', where: { and: [{ applicantEmail: { equals: values.email } }, { createdAt: { greater_than: hourAgo } }] } }),
    payload.count({ collection: 'service-requests', where: { createdAt: { greater_than: minuteAgo } } }),
  ])
  if (byEmail.totalDocs >= PER_EMAIL_PER_HOUR || overall.totalDocs >= GLOBAL_PER_MINUTE) {
    return fail('Terlalu banyak pengajuan dalam waktu singkat. Coba lagi beberapa saat lagi.')
  }

  const stamp = new Date(at).toISOString().slice(0, 10)
  const fileName = `${service.slug}-${stamp}-${Math.random().toString(36).slice(2, 8)}.${kind.ext}`
  let trackingCode: string
  try {
    const letter = await payload.create({
      collection: 'letters',
      data: {},
      file: { data, mimetype: kind.mime, name: fileName, size: data.length },
    })
    const request = await payload.create({
      collection: 'service-requests',
      data: {
        service: service.id,
        applicantName: values.name,
        applicantEmail: values.email,
        applicantPhone: values.phone || undefined,
        organization: values.organization,
        subject: values.subject,
        letterNumber: values.letterNumber || undefined,
        neededDate: isLoan ? `${values.loanFrom}T00:00:00.000+08:00` : values.neededDate ? `${values.neededDate}T00:00:00.000+08:00` : undefined,
        ...(isLoan ? { items, loanFrom: `${values.loanFrom}T00:00:00.000+08:00`, loanTo: `${values.loanTo}T00:00:00.000+08:00` } : {}),
        note: values.note || undefined,
        letter: letter.id,
        status: 'baru',
        history: [{ status: 'baru', at: new Date(at).toISOString(), note: 'Diajukan lewat situs' }],
      },
    })
    trackingCode = request.trackingCode as string
  } catch {
    return fail('Pengajuan belum terkirim karena gangguan server. Coba lagi sebentar lagi.')
  }

  try {
    const to = (await getSiteSettings()).contact?.email
    if (to) {
      await payload.sendEmail({
        to,
        replyTo: values.email,
        subject: `[Situs HMTI] ${service.name}: ${values.subject} (${trackingCode})`,
        text: [
          `Kode: ${trackingCode}`,
          `Layanan: ${service.name}`,
          `Pemohon: ${values.name} (${values.organization})`,
          `Email: ${values.email}`,
          values.phone && `WhatsApp: ${values.phone}`,
          `Perihal: ${values.subject}`,
          values.letterNumber && `Nomor surat: ${values.letterNumber}`,
          values.neededDate && `Tanggal kegiatan: ${values.neededDate}`,
          isLoan && `Pinjam: ${values.loanFrom} s.d. ${values.loanTo}`,
          isLoan && `Barang: ${items.length} jenis (lihat admin)`,
          values.note && `\n${values.note}`,
        ]
          .filter(Boolean)
          .join('\n'),
        attachments: [{ filename: fileName, content: data, contentType: kind.mime }],
      })
    }
  } catch {
    /* permintaan sudah tersimpan di admin; kegagalan email tidak membatalkan */
  }

  return { ok: true, trackingCode, email: values.email, at }
}

export type TrackState =
  | { ok: true; code: string; service: string; subject?: string; status: string; history: { status: string; at?: string; note?: string }[]; at: number }
  | { ok: false; error: string; values?: { code: string; email: string }; at: number }
  | null

const STATUS: Record<string, string> = { baru: 'Diterima', diproses: 'Diproses', disetujui: 'Disetujui', ditolak: 'Ditolak', selesai: 'Selesai' }

/** Cek status permintaan dengan kode pelacakan + email pemohon (keduanya harus cocok). */
export async function trackAction(_prev: TrackState, formData: FormData): Promise<TrackState> {
  const at = Date.now()
  const code = clean(formData.get('code'), 20).toUpperCase()
  const email = clean(formData.get('email'), 254).toLowerCase()
  if (!/^HMTI-[0-9A-F]{8}$/.test(code) || !EMAIL_RE.test(email)) {
    return { ok: false, error: 'Periksa lagi kode (contoh: HMTI-1A2B3C4D) dan email.', values: { code, email }, at }
  }
  const payload = await getClient()
  const doc = (
    await payload.find({
      collection: 'service-requests',
      where: { and: [{ trackingCode: { equals: code } }, { applicantEmail: { equals: email } }] },
      limit: 1,
      depth: 1,
    })
  ).docs[0]
  if (!doc) return { ok: false, error: 'Permintaan tidak ditemukan. Pastikan kode dan email sama dengan saat mengajukan.', values: { code, email }, at }
  return {
    ok: true,
    code,
    service: typeof doc.service === 'object' ? doc.service.name : 'Layanan',
    subject: doc.subject ?? undefined,
    status: STATUS[doc.status] ?? doc.status,
    history: (doc.history ?? []).map((h) => ({ status: STATUS[h.status ?? ''] ?? h.status ?? '', at: h.at ?? undefined, note: h.note ?? undefined })),
    at,
  }
}
