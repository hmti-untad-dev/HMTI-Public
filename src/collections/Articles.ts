import type { CollectionConfig } from 'payload'
import { hasRole, publishedOrStaff } from '../access'

export const Articles: CollectionConfig = {
  slug: 'articles',
  typescript: { interface: 'Article' },
  labels: { singular: 'Berita', plural: 'Berita' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'category', 'publishedAt', '_status'], group: 'Konten' },
  versions: { drafts: true },
  access: {
    read: publishedOrStaff,
    create: hasRole('humas'),
    update: hasRole('humas'),
    delete: hasRole('humas'),
  },
  fields: [
    { name: 'title', type: 'text', label: 'Judul', required: true },
    { name: 'slug', type: 'text', label: 'Slug', required: true, unique: true, index: true },
    {
      name: 'category',
      type: 'select',
      label: 'Kategori',
      defaultValue: 'berita',
      options: [
        { label: 'Berita', value: 'berita' },
        { label: 'Pengumuman', value: 'pengumuman' },
        { label: 'Artikel', value: 'artikel' },
      ],
    },
    { name: 'excerpt', type: 'textarea', label: 'Ringkasan' },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Gambar sampul' },
    { name: 'content', type: 'richText', label: 'Isi' },
    { name: 'author', type: 'text', label: 'Penulis' },
    { name: 'publishedAt', type: 'date', label: 'Tanggal terbit' },
    { name: 'featured', type: 'checkbox', label: 'Sorotan', defaultValue: false },
  ],
}
