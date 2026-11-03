import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

/** Pesan dari kolom chat di FAQ. Pengirim cukup mengisi email; admin membalas lewat email. */
export const ChatMessages: CollectionConfig = {
  slug: 'chat-messages',
  typescript: { interface: 'ChatMessage' },
  labels: { singular: 'Pesan Masuk', plural: 'Pesan Masuk' },
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'message', 'status', 'createdAt'], group: 'Layanan' },
  access: {
    // Pengunjung hanya boleh mengirim; isi pesan dan email tidak pernah bisa dibaca lewat API publik.
    create: anyone,
    read: hasRole('humas', 'sekretaris'),
    update: hasRole('humas', 'sekretaris'),
    delete: hasRole('humas', 'sekretaris'),
  },
  fields: [
    { name: 'email', type: 'email', label: 'Email pengirim', required: true, index: true },
    { name: 'message', type: 'textarea', label: 'Pesan', required: true, maxLength: 1500 },
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
