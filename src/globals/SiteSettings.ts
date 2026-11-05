import type { GlobalConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  typescript: { interface: 'SiteSetting' },
  label: 'Pengaturan Situs',
  admin: { group: 'Sistem' },
  access: { read: anyone, update: hasRole('humas', 'sekretaris') },
  fields: [
    { name: 'orgName', type: 'text', label: 'Nama organisasi', defaultValue: 'HMTI' },
    { name: 'orgFullName', type: 'text', label: 'Nama lengkap', defaultValue: 'Himpunan Mahasiswa Teknik Informatika' },
    { name: 'tagline', type: 'text', label: 'Tagline' },
    { name: 'motto', type: 'text', label: 'Jargon / motto', defaultValue: 'We Make A Better Future', admin: { description: 'Jargon himpunan, tampil di beranda, Tentang, dan footer.' } },
    { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo' },
    {
      name: 'hero',
      type: 'group',
      label: 'Hero beranda',
      fields: [
        { name: 'headline', type: 'text', label: 'Judul' },
        { name: 'subheadline', type: 'textarea', label: 'Sub-judul' },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Gambar' },
        { name: 'ctaLabel', type: 'text', label: 'Teks tombol' },
        { name: 'ctaHref', type: 'text', label: 'Link tombol' },
      ],
    },
    {
      name: 'about',
      type: 'group',
      label: 'Tentang',
      fields: [
        { name: 'history', type: 'richText', label: 'Sejarah' },
        { name: 'anthem', type: 'upload', relationTo: 'media', label: 'Lagu / Mars (audio)' },
        { name: 'anthemTitle', type: 'text', label: 'Judul lagu' },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Kontak',
      fields: [
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        { name: 'address', type: 'textarea', label: 'Alamat sekretariat' },
        { name: 'mapUrl', type: 'text', label: 'Link peta' },
      ],
    },
    {
      name: 'socials',
      type: 'array',
      label: 'Media sosial',
      fields: [
        { name: 'platform', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
