import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

/** Proker sebagai seri berulang (I-Fest, IBM, ...). Tiap tahun = satu Edition. */
export const Programs: CollectionConfig = {
  slug: 'programs',
  typescript: { interface: 'Program' },
  labels: { singular: 'Program Kerja', plural: 'Program Kerja' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'department', 'featured'], group: 'Kegiatan' },
  access: {
    read: anyone,
    create: hasRole('humas', 'sekretaris'),
    update: hasRole('humas', 'sekretaris'),
    delete: hasRole(),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nama', required: true, admin: { description: 'Mis. "Informatics Festival"' } },
    { name: 'shortName', type: 'text', label: 'Singkatan', admin: { description: 'Mis. "I-Fest"' } },
    { name: 'slug', type: 'text', label: 'Slug', required: true, unique: true, index: true },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      label: 'Departemen penyelenggara',
      admin: { description: 'Mis. Intelektual atau RINOYA.' },
    },
    { name: 'summary', type: 'textarea', label: 'Ringkasan' },
    {
      name: 'website',
      type: 'text',
      label: 'Situs resmi kegiatan',
      admin: { description: 'Mis. https://www.ifestuntad.my.id/ untuk I-Fest. Tampil sebagai tombol di halaman kegiatan.' },
    },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Gambar sampul' },
    {
      name: 'about',
      type: 'textarea',
      label: 'Deskripsi lengkap',
      admin: { description: 'Pisahkan paragraf dengan satu baris kosong. Tampil di halaman program.' },
    },
    {
      name: 'location',
      type: 'group',
      label: 'Lokasi (opsional)',
      admin: { description: 'Untuk program yang berlokasi di satu tempat, mis. desa binaan PenMas. Peta tampil bila koordinatnya diisi.' },
      fields: [
        { name: 'name', type: 'text', label: 'Nama tempat', admin: { description: 'Mis. Desa Lampo.' } },
        { name: 'area', type: 'text', label: 'Wilayah', admin: { description: 'Mis. Kec. Banawa Tengah, Kab. Donggala, Sulawesi Tengah.' } },
        { name: 'website', type: 'text', label: 'Situs resmi' },
        { name: 'mapUrl', type: 'text', label: 'Tautan Google Maps' },
        { name: 'lat', type: 'number', label: 'Lintang (latitude)' },
        { name: 'lng', type: 'number', label: 'Bujur (longitude)' },
      ],
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Galeri foto program',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Foto' },
        { name: 'caption', type: 'text', label: 'Keterangan' },
      ],
    },
    { name: 'productsTitle', type: 'text', label: 'Judul bagian produk', admin: { description: 'Mis. "Produk unggulan Desa Lampo". Kosongkan bila tidak ada bagian produk.' } },
    {
      name: 'products',
      type: 'array',
      label: 'Produk unggulan',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nama produk' },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Foto produk' },
        { name: 'note', type: 'text', label: 'Keterangan singkat' },
      ],
    },
    { name: 'featured', type: 'checkbox', label: 'Tampil di beranda', defaultValue: false },
    { name: 'order', type: 'number', label: 'Urutan', defaultValue: 0 },
  ],
}
