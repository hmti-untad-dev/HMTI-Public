import { randomBytes } from 'node:crypto'
import type { CollectionConfig } from 'payload'
import { anyone, hasRole, isStaff } from '../access'

/** Permintaan layanan dari publik. Skeleton: model data saja, alur penuh di milestone Layanan. */
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
  },
  fields: [
    { name: 'trackingCode', type: 'text', label: 'Kode pelacakan', unique: true, index: true, admin: { readOnly: true } },
    { name: 'service', type: 'relationship', relationTo: 'services', required: true },
    { name: 'applicantName', type: 'text', label: 'Nama pemohon', required: true },
    { name: 'applicantEmail', type: 'email', label: 'Email', required: true },
    { name: 'applicantPhone', type: 'text', label: 'Telepon / WA' },
    { name: 'organization', type: 'text', label: 'Instansi / organisasi' },
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
