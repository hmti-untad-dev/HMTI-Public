import type { Payload } from 'payload'

export type RolloverInput = {
  fromPeriodId: number
  year: number
  label: string
  cabinetName?: string
  /** Salin keanggotaan periode lama sebagai titik awal (bisa diedit setelahnya). */
  copyMembers?: boolean
  /** Langsung aktifkan; periode aktif lama otomatis diarsipkan oleh hook di Periods. */
  activate?: boolean
}

export class RolloverError extends Error {}

/**
 * Membuat periode baru dari periode lama. Tidak menghapus apa pun.
 * Departemen bersifat global sehingga tidak perlu disalin.
 */
export async function rolloverPeriod(payload: Payload, input: RolloverInput) {
  const { fromPeriodId, year, label, cabinetName, copyMembers = false, activate = false } = input

  if (!Number.isInteger(year) || year < 1990 || year > 2200) throw new RolloverError('Tahun tidak valid.')
  if (!label.trim()) throw new RolloverError('Label wajib diisi.')

  const clash = await payload.find({ collection: 'periods', where: { year: { equals: year } }, limit: 1, depth: 0 })
  if (clash.totalDocs > 0) throw new RolloverError(`Periode ${year} sudah ada.`)

  const source = await payload.findByID({ collection: 'periods', id: fromPeriodId, depth: 0 }).catch(() => null)
  if (!source) throw new RolloverError('Periode sumber tidak ditemukan.')

  const created = await payload.create({
    collection: 'periods',
    // Visi/misi/tema sengaja dikosongkan: tiap kabinet punya sendiri.
    data: { label: label.trim(), year, cabinetName: cabinetName?.trim() || undefined, status: 'draft' },
  })

  let copied = 0
  if (copyMembers) {
    const { docs } = await payload.find({
      collection: 'memberships',
      where: { period: { equals: source.id } },
      limit: 1000,
      depth: 0,
    })
    for (const m of docs) {
      await payload.create({
        collection: 'memberships',
        data: {
          person: typeof m.person === 'object' ? m.person.id : m.person,
          period: created.id,
          department: m.department ? (typeof m.department === 'object' ? m.department.id : m.department) : undefined,
          position: m.position,
          order: m.order,
        },
      })
      copied++
    }
  }

  if (activate) {
    await payload.update({ collection: 'periods', id: created.id, data: { status: 'active' } })
  }

  return { periodId: created.id, year, copiedMemberships: copied, activated: activate }
}
