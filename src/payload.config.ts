import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { id } from '@payloadcms/translations/languages/id'
import { buildConfig, type CollectionConfig, type GlobalConfig } from 'payload'
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
import { Letters } from './collections/Letters'
import { Services } from './collections/Services'
import { SpecialDays } from './collections/SpecialDays'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'
import { ADMIN_HELP } from './content/admin-help'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Memasang panduan dari content/admin-help.ts sebagai keterangan di bawah judul (daftar maupun saat mengedit):
 * satu kalimat fungsi, ditambah tautan "?" yang membuka alur dan cara kerja bila panduannya punya rincian.
 */
const help = (topic: string) => ({ path: '/components/admin/HelpButton#HelpButton', clientProps: { topic } })
function withHelp(c: CollectionConfig): CollectionConfig {
  const h = ADMIN_HELP[c.slug]
  if (!h) return c
  const components = c.admin?.components ?? {}
  return {
    ...c,
    admin: {
      ...c.admin,
      description: c.admin?.description ?? h.summary,
      components: {
        ...components,
        Description: components.Description ?? help(c.slug),
      },
    },
  }
}
function withGlobalHelp(g: GlobalConfig): GlobalConfig {
  const h = ADMIN_HELP[g.slug]
  if (!h) return g
  const components = g.admin?.components ?? {}
  return {
    ...g,
    admin: {
      ...g.admin,
      description: g.admin?.description ?? h.summary,
      components: { ...components, elements: { ...components.elements, Description: components.elements?.Description ?? help(g.slug) } },
    },
  }
}
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
    // Tanggal gaya Indonesia, mis. "7 November 2026, 14.54" (bawaan Payload menghasilkan "November ke-7 2026").
    dateFormat: 'd MMMM yyyy, HH.mm',
    meta: { titleSuffix: ' — HMTI Admin', icons: [{ rel: 'icon', type: 'image/webp', url: '/brand/hmti-logo.webp' }] },
    components: {
      graphics: { Logo: '/components/admin/AdminGraphics#AdminLogo', Icon: '/components/admin/AdminGraphics#AdminIcon' },
      beforeDashboard: ['/components/admin/AdminWelcome#AdminWelcome'],
    },
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [
    // Urutan grup di navigasi admin mengikuti urutan pertama kemunculannya di sini.
    // Konten
    Articles,
    Albums,
    BestPhotos,
    Achievements,
    Testimonials,
    Researches,
    Faqs,
    Documents,
    Partners,
    // Kegiatan
    Programs,
    Editions,
    SpecialDays,
    // Layanan
    Services,
    ServiceRequests,
    Letters,
    ChatMessages,
    Inventory,
    Loans,
    // Kepengurusan
    Periods,
    People,
    Departments,
    Memberships,
    // Sistem
    Users,
    Media,
  ].map(withHelp),
  globals: [SiteSettings].map(withGlobalHelp),
  // Antarmuka admin berbahasa Indonesia (pengguna tetap bisa mengganti bahasa di halaman Akun).
  i18n: { supportedLanguages: { id }, fallbackLanguage: 'id' },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db,
  email,
  sharp,
})
