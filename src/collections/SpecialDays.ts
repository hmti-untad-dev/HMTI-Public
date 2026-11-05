import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

/** Hari besar / bersejarah himpunan. Tampil sebagai bendera tonggak pada heatmap "Denyut Himpunan". */
export const SpecialDays: CollectionConfig = {
  slug: 'special-days',
  typescript: { interface: 'SpecialDay' },
  labels: { singular: 'Hari Penting', plural: 'Hari Penting' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'date', 'recurring'], group: 'Kegiatan' },
  access: {
    read: anyone,
    create: hasRole('humas', 'sekretaris'),
    update: hasRole('humas', 'sekretaris'),
    delete: hasRole('humas', 'sekretaris'),
  },
  fields: [
    { name: 'title', type: 'text', label: 'Nama hari', required: true, admin: { description: 'Contoh: Hari H I-Fest, Dies Natalis HMTI.' } },
    {
      name: 'date',
      type: 'date',
      label: 'Tanggal',
      required: true,
      index: true,
      admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
    },
    {
      name: 'recurring',
      type: 'checkbox',
      label: 'Berulang tiap tahun',
      defaultValue: false,
      admin: { description: 'Centang untuk hari jadi atau peringatan tahunan: bendera muncul di tanggal yang sama setiap tahun.' },
    },
    { name: 'description', type: 'textarea', label: 'Keterangan singkat' },
    { name: 'link', type: 'text', label: 'Tautan (opsional)', admin: { description: 'Halaman kegiatan terkait, mis. /kegiatan/i-fest/2026.' } },
  ],
}
