import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  typescript: { interface: 'Media' },
  labels: { singular: 'Media', plural: 'Media' },
  admin: { group: 'Sistem' },
  access: {
    read: anyone,
    create: hasRole('humas', 'sekretaris', 'bisnis'),
    update: hasRole('humas', 'sekretaris', 'bisnis'),
    delete: hasRole('humas'),
  },
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
    // Semua gambar yang diunggah otomatis diubah ke WebP (berkas asli dan semua ukuran turunan) dan dibatasi
    // lebarnya 2000px supaya ringan dimuat. PDF tidak tersentuh.
    formatOptions: { format: 'webp', options: { quality: 80 } },
    resizeOptions: { width: 2000, withoutEnlargement: true },
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, formatOptions: { format: 'webp', options: { quality: 75 } } },
      { name: 'card', width: 800, formatOptions: { format: 'webp', options: { quality: 78 } } },
    ],
  },
  fields: [{ name: 'alt', type: 'text', label: 'Teks alternatif' }],
}
