import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const POSITIONS = [
  { label: 'Ketua Umum', value: 'ketua' },
  { label: 'Ketua I', value: 'ketua1' },
  { label: 'Ketua II', value: 'ketua2' },
  { label: 'Sekretaris Umum', value: 'sekum' },
  { label: 'Bendahara Umum', value: 'bendum' },
  { label: 'Koordinator Departemen', value: 'koordinator' },
  { label: 'Anggota', value: 'anggota' },
  { label: 'Pembina', value: 'pembina' },
  { label: 'Badan Pengawas Organisasi', value: 'pengawas' },
]

/** Orang × periode × departemen × jabatan. Departemen kosong = BPH (Koordinator tanpa departemen tampil di grup tersendiri). */
export const Memberships: CollectionConfig = {
  slug: 'memberships',
  typescript: { interface: 'Membership' },
  labels: { singular: 'Keanggotaan', plural: 'Keanggotaan' },
  admin: { useAsTitle: 'id', defaultColumns: ['person', 'period', 'department', 'position'], group: 'Kepengurusan' },
  access: {
    read: anyone,
    create: hasRole('sekretaris'),
    update: hasRole('sekretaris'),
    delete: hasRole('sekretaris'),
  },
  fields: [
    { name: 'person', type: 'relationship', relationTo: 'people', required: true, index: true },
    { name: 'period', type: 'relationship', relationTo: 'periods', required: true, index: true },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      index: true,
      admin: { description: 'Kosongkan untuk BPH (pengurus harian).' },
    },
    { name: 'position', type: 'select', label: 'Jabatan', required: true, options: POSITIONS },
    { name: 'order', type: 'number', label: 'Urutan', defaultValue: 0 },
    { name: 'photoOverride', type: 'upload', relationTo: 'media', label: 'Foto khusus periode ini' },
    {
      name: 'photoIsPoster',
      type: 'checkbox',
      label: 'Foto berupa poster',
      defaultValue: false,
      admin: { description: 'Centang bila fotonya poster yang sudah memuat nama dan jabatan, supaya teks tidak ditumpuk dua kali di halaman Kepengurusan.' },
    },
  ],
}
