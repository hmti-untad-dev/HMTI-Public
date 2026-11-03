import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const Departments: CollectionConfig = {
  slug: 'departments',
  typescript: { interface: 'Department' },
  labels: { singular: 'Departemen', plural: 'Departemen' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'group', 'order'], group: 'Kepengurusan' },
  access: {
    read: anyone,
    create: hasRole('sekretaris'),
    update: hasRole('sekretaris'),
    delete: hasRole(),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nama', required: true },
    { name: 'slug', type: 'text', label: 'Slug', required: true, unique: true, index: true },
    {
      name: 'group',
      type: 'select',
      label: 'Grup',
      required: true,
      options: [
        { label: 'Internal', value: 'internal' },
        { label: 'Eksternal', value: 'eksternal' },
      ],
    },
    { name: 'description', type: 'textarea', label: 'Deskripsi' },
    { name: 'icon', type: 'upload', relationTo: 'media', label: 'Ikon' },
    { name: 'order', type: 'number', label: 'Urutan', defaultValue: 0 },
  ],
}
