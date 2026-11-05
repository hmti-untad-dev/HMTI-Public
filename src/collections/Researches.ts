import type { CollectionConfig } from 'payload'
import { hasRole, publishedOrStaff } from '../access'

/** Publikasi hasil riset, temuan, dan artikel keilmuan dari Rinoya, Humas, dan Intelektual. */
export const Researches: CollectionConfig = {
  slug: 'researches',
  typescript: { interface: 'Research' },
  labels: { singular: 'Hasil Riset', plural: 'Hasil Riset' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'kind', 'department', 'publishedAt', '_status'], group: 'Konten' },
  versions: { drafts: true },
  access: {
    read: publishedOrStaff,
    create: hasRole('humas', 'sekretaris'),
    update: hasRole('humas', 'sekretaris'),
    delete: hasRole('humas', 'sekretaris'),
  },
  fields: [
    { name: 'title', type: 'text', label: 'Judul', required: true },
    { name: 'slug', type: 'text', label: 'Slug', required: true, unique: true, index: true },
    {
      name: 'kind',
      type: 'select',
      label: 'Jenis',
      required: true,
      defaultValue: 'riset',
      options: [
        { label: 'Hasil riset', value: 'riset' },
        { label: 'Temuan', value: 'temuan' },
        { label: 'Artikel', value: 'artikel' },
      ],
    },
    { name: 'department', type: 'relationship', relationTo: 'departments', label: 'Departemen penyusun', index: true },
    { name: 'authors', type: 'text', label: 'Penulis / tim', admin: { description: 'Pisahkan dengan koma.' } },
    { name: 'summary', type: 'textarea', label: 'Ringkasan', required: true, maxLength: 400 },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Gambar sampul' },
    { name: 'content', type: 'richText', label: 'Isi' },
    { name: 'file', type: 'upload', relationTo: 'media', label: 'Berkas lengkap (PDF, opsional)' },
    { name: 'externalUrl', type: 'text', label: 'Tautan luar (jurnal, repositori; opsional)' },
    { name: 'tags', type: 'text', label: 'Kata kunci', admin: { description: 'Pisahkan dengan koma.' } },
    { name: 'publishedAt', type: 'date', label: 'Tanggal terbit' },
  ],
}
