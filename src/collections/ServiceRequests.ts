import { randomBytes } from 'node:crypto'
import type { CollectionConfig } from 'payload'
import { anyone, hasRole, isStaff } from '../access'

/**
 * Permintaan layanan dari publik. Layanan organisasi (peminjaman inventaris, penyuratan, media partner, kerja sama)
 * diajukan lewat formulir unggah surat (actions/letter.ts); pemohon melacak status di /layanan/lacak dengan kode
 * pelacakan + email.
 */
export const ServiceRequests: CollectionConfig = {
  slug: 'service-requests',
  typescript: { interface: 'ServiceRequest' },
  labels: { singular: 'Permintaan Layanan', plural: 'Permintaan Layanan' },
  admin: {
    useAsTitle: 'trackingCode',
    defaultColumns: ['trackingCode', 'service', 'applicantName', 'status', 'createdAt'],
    group: 'Layanan',
  },
  access: {
    create: anyone,
    read: isStaff,
    update: hasRole('sekretaris', 'inventaris', 'bisnis'),
    delete: hasRole(),
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' && data && !data.trackingCode) {
          data.trackingCode = `HMTI-${randomBytes(4).toString('hex').toUpperCase()}`
        }
        return data
      },
    ],
    // Setiap perubahan status oleh pengurus dicatat di riwayat, yang tampil ke pemohon di /layanan/lacak.
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        if (operation === 'update' && data?.status && originalDoc && data.status !== originalDoc.status) {
          data.history = [...(originalDoc.history ?? []), { status: data.status, at: new Date().toISOString() }]
        }
        return data
      },
    ],
    // Peminjaman inventaris: disetujui -> buat catatan Peminjaman per barang (jumlah tersedia berkurang);
    // ditolak -> batalkan; selesai -> tandai dikembalikan.
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update' || doc.status === previousDoc?.status) return doc
        const items = (doc.items ?? []) as { item: number | { id: number }; quantity: number }[]
        if (items.length === 0 || !doc.loanFrom || !doc.loanTo) return doc
        const existing = await req.payload.find({ collection: 'loans', where: { request: { equals: doc.id } }, limit: 200, depth: 0, req })
        if (doc.status === 'disetujui' && existing.totalDocs === 0) {
          for (const it of items) {
            await req.payload.create({
              collection: 'loans',
              data: { item: typeof it.item === 'object' ? it.item.id : it.item, request: doc.id, quantity: it.quantity, from: doc.loanFrom, to: doc.loanTo, status: 'dijadwalkan' },
              req,
            })
          }
        }
        const next = doc.status === 'ditolak' ? 'dibatalkan' : doc.status === 'selesai' ? 'dikembalikan' : null
        if (next) {
          for (const loan of existing.docs) {
            if (loan.status === 'dijadwalkan' || loan.status === 'dipinjam') {
              await req.payload.update({ collection: 'loans', id: loan.id, data: { status: next }, req })
            }
          }
        }
        return doc
      },
    ],
  },
  fields: [
    { name: 'trackingCode', type: 'text', label: 'Kode pelacakan', unique: true, index: true, admin: { readOnly: true } },
    { name: 'service', type: 'relationship', relationTo: 'services', required: true },
    { name: 'applicantName', type: 'text', label: 'Nama pemohon', required: true },
    { name: 'applicantEmail', type: 'email', label: 'Email', required: true },
    { name: 'applicantPhone', type: 'text', label: 'Telepon / WA' },
    { name: 'organization', type: 'text', label: 'Instansi / organisasi' },
    { name: 'subject', type: 'text', label: 'Perihal' },
    { name: 'letterNumber', type: 'text', label: 'Nomor surat' },
    { name: 'neededDate', type: 'date', label: 'Tanggal kegiatan / dibutuhkan' },
    { name: 'note', type: 'textarea', label: 'Keterangan pemohon' },
    { name: 'letter', type: 'upload', relationTo: 'letters', label: 'Surat dari pemohon' },
    {
      type: 'collapsible',
      label: 'Peminjaman inventaris',
      admin: { condition: (data) => Boolean(data?.items?.length) },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'loanFrom', type: 'date', label: 'Tanggal pinjam' },
            { name: 'loanTo', type: 'date', label: 'Tanggal kembali' },
          ],
        },
        {
          name: 'items',
          type: 'array',
          label: 'Barang yang dipinjam',
          admin: { description: 'Saat status diubah ke "Disetujui", catatan Peminjaman dibuat otomatis untuk tiap barang.' },
          fields: [
            { name: 'item', type: 'relationship', relationTo: 'inventory', required: true },
            { name: 'quantity', type: 'number', label: 'Jumlah', required: true, min: 1 },
          ],
        },
      ],
    },
    { name: 'data', type: 'json', label: 'Isi formulir' },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'baru',
      options: [
        { label: 'Baru', value: 'baru' },
        { label: 'Diproses', value: 'diproses' },
        { label: 'Disetujui', value: 'disetujui' },
        { label: 'Ditolak', value: 'ditolak' },
        { label: 'Selesai', value: 'selesai' },
      ],
    },
    { name: 'staffNote', type: 'textarea', label: 'Catatan admin' },
    { name: 'resultFile', type: 'upload', relationTo: 'media', label: 'Berkas hasil (mis. surat jadi)' },
    {
      name: 'history',
      type: 'array',
      label: 'Riwayat status',
      admin: { readOnly: true },
      fields: [
        { name: 'status', type: 'text' },
        { name: 'at', type: 'date' },
        { name: 'note', type: 'text' },
      ],
    },
  ],
}
