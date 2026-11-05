import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

/** Pesan masuk dari situs: chat FAQ, form Kontak, dan form tiap layanan. Admin membalas lewat email/WhatsApp. */
export const ChatMessages: CollectionConfig = {
  slug: 'chat-messages',
  typescript: { interface: 'ChatMessage' },
  labels: { singular: 'Pesan Masuk', plural: 'Pesan Masuk' },
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'source', 'topic', 'status', 'createdAt'], group: 'Layanan' },
  access: {
    // Pengunjung hanya boleh mengirim; isi pesan dan email tidak pernah bisa dibaca lewat API publik.
    create: anyone,
    read: hasRole('humas', 'sekretaris'),
    update: hasRole('humas', 'sekretaris'),
    delete: hasRole('humas', 'sekretaris'),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nama pengirim', maxLength: 120 },
    { name: 'email', type: 'email', label: 'Email pengirim', required: true, index: true },
    { name: 'phone', type: 'text', label: 'Telepon / WhatsApp', maxLength: 40 },
    { name: 'topic', type: 'text', label: 'Topik / layanan', maxLength: 120 },
    { name: 'message', type: 'textarea', label: 'Pesan', required: true, maxLength: 2000 },
    {
      name: 'source',
      type: 'select',
      label: 'Asal',
      defaultValue: 'faq',
      options: [
        { label: 'Chat FAQ', value: 'faq' },
        { label: 'Form Kontak', value: 'kontak' },
        { label: 'Form Layanan', value: 'layanan' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'baru',
      options: [
        { label: 'Baru', value: 'baru' },
        { label: 'Sudah dibalas', value: 'dibalas' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
