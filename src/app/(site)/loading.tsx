import { Container } from '@/components/ui/Container'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Tampil selama halaman dimuat (navigasi antar-halaman). Bentuknya meniru susunan halaman: judul, baris teks,
 * lalu deretan kartu, supaya tidak ada loncatan tata letak saat konten asli datang.
 */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Memuat halaman…</span>
      <div className="border-b border-line bg-surface-alt py-14">
        <Container>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-9 w-2/3 max-w-md" />
          <Skeleton className="mt-4 h-4 w-full max-w-xl" />
        </Container>
      </div>
      <Container className="py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i}>
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="mt-4 h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
