import type { Metadata } from 'next'

import { InventoryTable } from '@/components/sections/InventoryTable'
import Link from '@/components/ui/AppLink'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { getActiveLoans, getPublicInventory } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Daftar Inventaris',
  description: 'Barang inventaris HMTI UNTAD di Sekretariat Dalam dan Sekretariat Luar, beserta yang bisa dipinjam.',
}

export default async function InventoryPage() {
  const [items, loans] = await Promise.all([getPublicInventory(), getActiveLoans()])
  const loanable = items.filter((i) => i.loanable).length

  return (
    <>
      <PageHeader eyebrow="Layanan" title="Daftar Inventaris">
        {items.length} barang milik HMTI UNTAD di Sekretariat Dalam dan Sekretariat Luar. {loanable} di antaranya bisa dipinjam organisasi atau instansi lewat{' '}
        <Link href="/layanan/peminjaman-inventaris" className="text-link hover:underline">
          layanan peminjaman
        </Link>
        .
      </PageHeader>
      <Container className="py-10">
        <InventoryTable items={items} loans={loans} />
      </Container>
    </>
  )
}
