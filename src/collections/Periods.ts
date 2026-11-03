import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'
import { type RolloverInput, RolloverError, rolloverPeriod } from '../lib/rollover'

/** Satu kabinet = satu periode. Data lama tidak dihapus, hanya di-arsip. */
export const Periods: CollectionConfig = {
  slug: 'periods',
  typescript: { interface: 'Period' },
  labels: { singular: 'Periode', plural: 'Periode' },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'status', 'year'],
    group: 'Kepengurusan',
    components: { beforeList: ['/components/admin/RolloverButton#RolloverButton'] },
  },
  access: {
    read: anyone,
    create: hasRole('sekretaris'),
    update: hasRole('sekretaris'),
    delete: hasRole(),
  },
  fields: [
    { name: 'label', type: 'text', label: 'Label', required: true, admin: { description: 'Mis. "Kabinet X 2026"' } },
    { name: 'year', type: 'number', label: 'Tahun', required: true, unique: true },
    { name: 'cabinetName', type: 'text', label: 'Nama kabinet' },
    { name: 'theme', type: 'text', label: 'Tema / tagline' },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Aktif', value: 'active' },
        { label: 'Arsip', value: 'archived' },
      ],
      admin: { description: 'Hanya satu periode yang boleh Aktif.' },
    },
    { name: 'vision', type: 'textarea', label: 'Visi' },
    {
      name: 'missions',
      type: 'array',
      label: 'Misi',
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo kabinet' },
  ],
  endpoints: [
    {
      // POST /api/periods/rollover — dipakai tombol "Mulai Periode Baru" (UI admin menyusul).
      path: '/rollover',
      method: 'post',
      handler: async (req) => {
        const user = req.user as { roles?: string[] } | null
        if (!user?.roles?.some((r) => r === 'superadmin' || r === 'sekretaris')) {
          return Response.json({ error: 'Tidak diizinkan.' }, { status: 403 })
        }
        const body = (await req.json?.().catch(() => null)) as Partial<RolloverInput> | null
        if (!body) return Response.json({ error: 'Body JSON wajib.' }, { status: 400 })
        try {
          const result = await rolloverPeriod(req.payload, {
            fromPeriodId: Number(body.fromPeriodId),
            year: Number(body.year),
            label: String(body.label ?? ''),
            cabinetName: body.cabinetName,
            copyMembers: Boolean(body.copyMembers),
            activate: Boolean(body.activate),
          })
          return Response.json(result, { status: 201 })
        } catch (err) {
          if (err instanceof RolloverError) return Response.json({ error: err.message }, { status: 400 })
          throw err
        }
      },
    },
  ],
  hooks: {
    // Menjaga invariant "hanya satu periode aktif": mengaktifkan periode baru mengarsipkan yang lama.
    afterChange: [
      async ({ doc, req, context }) => {
        if (context.skipActiveSync || doc.status !== 'active') return
        const others = await req.payload.find({
          collection: 'periods',
          where: { and: [{ status: { equals: 'active' } }, { id: { not_equals: doc.id } }] },
          depth: 0,
          limit: 100,
          req,
        })
        for (const other of others.docs) {
          await req.payload.update({
            collection: 'periods',
            id: other.id,
            data: { status: 'archived' },
            context: { skipActiveSync: true },
            req,
          })
        }
      },
    ],
  },
}
