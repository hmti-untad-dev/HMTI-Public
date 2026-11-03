import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  typescript: { interface: 'Faq' },
  labels: { singular: 'FAQ', plural: 'FAQ' },
  admin: { useAsTitle: 'question', defaultColumns: ['question', 'order'], group: 'Konten' },
  access: {
    read: anyone,
    create: hasRole('humas', 'sekretaris'),
    update: hasRole('humas', 'sekretaris'),
    delete: hasRole('humas', 'sekretaris'),
  },
  fields: [
    { name: 'question', type: 'text', label: 'Pertanyaan', required: true },
    { name: 'answer', type: 'textarea', label: 'Jawaban', required: true },
    { name: 'order', type: 'number', label: 'Urutan', defaultValue: 0 },
  ],
}
