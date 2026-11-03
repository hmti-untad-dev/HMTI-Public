import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const Services: CollectionConfig = {
  slug: 'services',
  typescript: { interface: 'Service' },
  labels: { singular: 'Layanan', plural: 'Layanan' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'group', 'active'], group: 'Layanan' },
  access: {
    read: anyone,
    create: hasRole(),
    update: hasRole('sekretaris', 'inventaris', 'bisnis'),
    delete: hasRole(),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nama', required: true },
    { name: 'slug', type: 'text', label: 'Slug', required: true, unique: true, index: true },
    {
      name: 'group',
      type: 'select',
      label: 'Kelompok',
      required: true,
      options: [
        { label: 'Organisasi', value: 'organisasi' },
        { label: 'Bisnis', value: 'bisnis' },
      ],
    },
    { name: 'summary', type: 'textarea', label: 'Ringkasan' },
    { name: 'description', type: 'richText', label: 'Deskripsi' },
    { name: 'active', type: 'checkbox', label: 'Aktif menerima permintaan', defaultValue: true },
    { name: 'order', type: 'number', label: 'Urutan', defaultValue: 0 },
    {
      name: 'formFields',
      type: 'array',
      label: 'Field formulir',
      admin: { description: 'Dipakai form dinamis di /layanan/[slug] (diimplementasikan di milestone Layanan).' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          defaultValue: 'text',
          options: ['text', 'textarea', 'email', 'tel', 'date', 'file'],
        },
        { name: 'required', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}
