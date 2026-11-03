import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const Documents: CollectionConfig = {
  slug: 'documents',
  typescript: { interface: 'Document' },
  labels: { singular: 'Dokumen', plural: 'Dokumen' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'type'], group: 'Konten' },
  access: {
    read: anyone,
    create: hasRole('sekretaris', 'humas'),
    update: hasRole('sekretaris', 'humas'),
    delete: hasRole('sekretaris'),
  },
  fields: [
    { name: 'title', type: 'text', label: 'Judul', required: true },
    {
      name: 'type',
      type: 'select',
      label: 'Jenis',
      options: [
        { label: 'AD/ART', value: 'adart' },
        { label: 'GBHO', value: 'gbho' },
        { label: 'Proposal sponsor', value: 'proposal' },
        { label: 'Lainnya', value: 'lainnya' },
      ],
    },
    { name: 'file', type: 'upload', relationTo: 'media', label: 'Berkas (PDF)', required: true },
  ],
}
