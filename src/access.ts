import type { Access, FieldAccess } from 'payload'

export const ROLES = ['superadmin', 'humas', 'sekretaris', 'inventaris', 'bisnis'] as const
export type Role = (typeof ROLES)[number]

type UserWithRoles = { roles?: Role[] } | null | undefined

/** Siapa pun, termasuk pengunjung tanpa login. */
export const anyone: Access = () => true

/** Hanya user yang sudah login ke /admin. */
export const isStaff: Access = ({ req }) => Boolean(req.user)

/** Superadmin selalu lolos; selain itu butuh salah satu role yang disebut. */
export const hasRole =
  (...roles: Role[]): Access =>
  ({ req }) => {
    const user = req.user as UserWithRoles
    return Boolean(user?.roles?.some((role) => role === 'superadmin' || roles.includes(role)))
  }

/** Untuk field sensitif (NIM, kontak): tidak pernah keluar ke API publik. */
export const staffOnlyField: FieldAccess = ({ req }) => Boolean(req.user)

/** Konten ber-draft: pengunjung hanya melihat yang sudah published. */
export const publishedOrStaff: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }
