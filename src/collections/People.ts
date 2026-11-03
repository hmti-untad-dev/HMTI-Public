import type { CollectionConfig } from 'payload'
import { anyone, hasRole, staffOnlyField } from '../access'

/** Orang dipakai ulang lintas periode. NIM & kontak tidak pernah tampil di API publik. */
export const People: CollectionConfig = {
  slug: 'people',
  typescript: { interface: 'Person' },
  labels: { singular: 'Anggota', plural: 'Anggota' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'angkatan'], group: 'Kepengurusan' },
  access: {
    read: anyone,
    create: hasRole('sekretaris'),
    update: hasRole('sekretaris'),
    delete: hasRole(),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nama', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Foto' },
    { name: 'angkatan', type: 'number', label: 'Angkatan' },
    { name: 'nim', type: 'text', label: 'NIM', access: { read: staffOnlyField } },
    { name: 'phone', type: 'text', label: 'Kontak', access: { read: staffOnlyField } },
    { name: 'instagram', type: 'text', label: 'Instagram' },
    { name: 'linkedin', type: 'text', label: 'LinkedIn' },
  ],
}
