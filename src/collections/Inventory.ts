import type { Access, CollectionConfig } from 'payload'
import { hasRole } from '../access'
import { INVENTORY_CATEGORIES, INVENTORY_ICONS, INVENTORY_LOCATIONS } from '../lib/inventory'

/** Pengunjung hanya bisa membaca barang berstatus publik; pengurus yang login membaca semuanya. */
const publicOrStaff: Access = ({ req }) => (req.user ? true : { visibility: { equals: 'publik' } })

/**
 * Inventaris HMTI UNTAD (data asli dari daftar barang Sekretariat Dalam, Sekretariat Luar, dan lokasi lain).
 * Barang "internal" (cap, arsip/LPJ, ATK habis pakai, peralatan dapur, alamat kontrakan, penyimpanan daring)
 * tidak pernah sampai ke pengunjung: disaring di aturan akses, bukan hanya di tampilan.
 * "Bisa dipinjam" menampilkan barang di katalog peminjaman dan formulir Peminjaman Inventaris.
 */
export const Inventory: CollectionConfig = {
  slug: 'inventory',
  typescript: { interface: 'InventoryItem' },
  labels: { singular: 'Barang Inventaris', plural: 'Inventaris' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'category', 'stock', 'unit', 'location', 'visibility', 'loanable'], group: 'Layanan', listSearchableFields: ['name', 'storage'] },
  access: {
    read: publicOrStaff,
    create: hasRole('inventaris'),
    update: hasRole('inventaris'),
    delete: hasRole('inventaris'),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nama barang', required: true },
    { name: 'category', type: 'select', label: 'Kategori', options: INVENTORY_CATEGORIES.map((c) => ({ label: c, value: c })), index: true },
    {
      type: 'row',
      fields: [
        { name: 'stock', type: 'number', label: 'Jumlah', required: true, defaultValue: 1, min: 0 },
        { name: 'unit', type: 'text', label: 'Satuan', defaultValue: 'Buah', admin: { description: 'Buah, Lembar, Meter, Set, Box, ...' } },
        { name: 'quantityText', type: 'text', label: 'Jumlah (teks khusus)', admin: { description: 'Opsional, mis. "1/5 Karung". Menggantikan angka + satuan di tampilan.' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'location', type: 'select', label: 'Lokasi', options: INVENTORY_LOCATIONS.map((l) => ({ ...l })), index: true },
        { name: 'storage', type: 'text', label: 'Tempat penyimpanan', admin: { description: 'Hanya terlihat oleh pengurus.' }, access: { read: ({ req }) => Boolean(req.user) } },
      ],
    },
    { name: 'icon', type: 'select', label: 'Ikon', options: INVENTORY_ICONS.map((i) => ({ label: i, value: i })), admin: { position: 'sidebar' } },
    {
      name: 'visibility',
      type: 'select',
      label: 'Tampil di situs',
      required: true,
      defaultValue: 'publik',
      options: [
        { label: 'Publik', value: 'publik' },
        { label: 'Internal (hanya pengurus)', value: 'internal' },
      ],
      admin: { position: 'sidebar' },
      index: true,
    },
    { name: 'loanable', type: 'checkbox', label: 'Bisa dipinjam', defaultValue: false, admin: { position: 'sidebar' }, index: true },
    { name: 'procurement2025', type: 'checkbox', label: 'Pengadaan Kepengurusan 2025', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'description', type: 'textarea', label: 'Deskripsi' },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Foto' },
  ],
}
