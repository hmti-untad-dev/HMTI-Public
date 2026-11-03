import type { CollectionConfig } from 'payload'
import { ROLES, hasRole, isStaff } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  typescript: { interface: 'User' },
  labels: { singular: 'Admin', plural: 'Admin' },
  auth: true,
  admin: { useAsTitle: 'email', group: 'Sistem' },
  access: {
    read: isStaff,
    create: hasRole(),
    update: hasRole(),
    delete: hasRole(),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nama' },
    {
      name: 'roles',
      type: 'select',
      label: 'Role',
      hasMany: true,
      required: true,
      defaultValue: ['humas'],
      options: ROLES.map((role) => ({ label: role, value: role })),
      admin: {
        description:
          'superadmin: semua akses. humas: berita/galeri/kegiatan. sekretaris: kepengurusan/penyuratan. inventaris: peminjaman. bisnis: jasa.',
      },
    },
  ],
}
