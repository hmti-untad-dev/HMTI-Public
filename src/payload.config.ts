import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Achievements } from './collections/Achievements'
import { Albums } from './collections/Albums'
import { Articles } from './collections/Articles'
import { BestPhotos } from './collections/BestPhotos'
import { ChatMessages } from './collections/ChatMessages'
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
import { Researches } from './collections/Researches'
import { ServiceRequests } from './collections/ServiceRequests'
import { Services } from './collections/Services'
import { SpecialDays } from './collections/SpecialDays'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseURI = process.env.DATABASE_URI || 'file:./hmti.db'

// SQLite untuk dev lokal tanpa instalasi apa pun; Postgres untuk production (isi DATABASE_URI=postgres://...).
const db = databaseURI.startsWith('postgres')
  ? postgresAdapter({ pool: { connectionString: databaseURI } })
  : sqliteAdapter({ client: { url: databaseURI } })

// Email keluar (form Kontak, chat FAQ, permintaan layanan). Aktif bila SMTP_HOST diisi di .env, mis. Gmail:
// SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, SMTP_USER=alamat gmail, SMTP_PASS=App Password (bukan password akun).
// Tanpa itu, pesan tetap tersimpan di admin (Pesan Masuk) dan Payload hanya mencatat email di log server.
const smtpPort = Number(process.env.SMTP_PORT || 465)
const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.SMTP_FROM || process.env.SMTP_USER || '',
      defaultFromName: 'Situs HMTI UNTAD',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
    })
  : undefined

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
    SpecialDays,
    // Konten
    Achievements,
    Testimonials,
    Articles,
    Albums,
    Researches,
    BestPhotos,
    Faqs,
    Documents,
    Partners,
    // Layanan
    Services,
    ServiceRequests,
    ChatMessages,
    Inventory,
    Loans,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db,
  email,
  sharp,
})
