import type { CollectionConfig } from 'payload'
import { hasRole, isStaff } from '../access'

/**
 * Peminjaman barang inventaris. Dibuat otomatis saat pengajuan Peminjaman Inventaris disetujui (hook di
 * ServiceRequests), atau manual oleh pengurus. Status dijadwalkan/dipinjam mengurangi jumlah tersedia di katalog
 * untuk rentang tanggalnya; ubah ke "Dikembalikan" saat barang kembali.
 */
export const Loans: CollectionConfig = {
  slug: 'loans',
  typescript: { interface: 'Loan' },
  labels: { singular: 'Peminjaman', plural: 'Peminjaman' },
  admin: { useAsTitle: 'id', defaultColumns: ['item', 'quantity', 'from', 'to', 'status'], group: 'Layanan' },
  access: {
    read: isStaff,
    create: hasRole('inventaris'),
    update: hasRole('inventaris'),
    delete: hasRole('inventaris'),
  },
  fields: [
    { name: 'item', type: 'relationship', relationTo: 'inventory', required: true },
    { name: 'request', type: 'relationship', relationTo: 'service-requests' },
    { name: 'quantity', type: 'number', label: 'Jumlah', required: true, defaultValue: 1, min: 1 },
    { name: 'from', type: 'date', label: 'Dari', required: true },
    { name: 'to', type: 'date', label: 'Sampai', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'dijadwalkan',
      options: [
        { label: 'Dijadwalkan', value: 'dijadwalkan' },
        { label: 'Dipinjam', value: 'dipinjam' },
        { label: 'Dikembalikan', value: 'dikembalikan' },
        { label: 'Dibatalkan', value: 'dibatalkan' },
      ],
    },
  ],
}
