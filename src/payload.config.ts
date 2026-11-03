import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Achievements } from './collections/Achievements'
import { Albums } from './collections/Albums'
import { Articles } from './collections/Articles'
import { Departments } from './collections/Departments'
import { Documents } from './collections/Documents'
import { Editions } from './collections/Editions'
import { Faqs } from './collections/Faqs'
import { Inventory } from './collections/Inventory'
import { Loans } from './collections/Loans'
import { Media } from './collections/Media'
import { Memberships } from './collections/Memberships'
import { Partners } from './collections/Partners'
import { People } from './collections/People'
import { Periods } from './collections/Periods'
import { Programs } from './collections/Programs'
import { ServiceRequests } from './collections/ServiceRequests'
import { Services } from './collections/Services'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseURI = process.env.DATABASE_URI || 'file:./hmti.db'

// SQLite untuk dev lokal tanpa instalasi apa pun; Postgres untuk production (isi DATABASE_URI=postgres://...).
const db = databaseURI.startsWith('postgres')
  ? postgresAdapter({ pool: { connectionString: databaseURI } })
  : sqliteAdapter({ client: { url: databaseURI } })

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' — HMTI Admin' },
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [
    Users,
    Media,
    // Kepengurusan
    Periods,
    People,
    Departments,
    Memberships,
    // Kegiatan
    Programs,
    Editions,
    // Konten
    Achievements,
    Testimonials,
    Articles,
    Albums,
    Faqs,
    Documents,
    Partners,
    // Layanan
    Services,
    ServiceRequests,
    Inventory,
    Loans,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db,
  sharp,
})
