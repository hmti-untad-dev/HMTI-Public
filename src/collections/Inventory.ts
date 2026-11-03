import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const Inventory: CollectionConfig = {
  slug: 'inventory',
  typescript: { interface: 'InventoryItem' },
  labels: { singular: 'Barang Inventaris', plural: 'Inventaris' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'stock'], group: 'Layanan' },
  access: {
    read: anyone,
    create: hasRole('inventaris'),
    update: hasRole('inventaris'),
    delete: hasRole('inventaris'),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nama barang', required: true },
    { name: 'stock', type: 'number', label: 'Stok', required: true, defaultValue: 1, min: 0 },
    { name: 'description', type: 'textarea', label: 'Deskripsi' },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Foto' },
  ],
}
