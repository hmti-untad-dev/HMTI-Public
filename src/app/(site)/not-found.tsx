import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="font-display text-6xl font-bold text-link">404</p>
      <h1 className="mt-3 text-xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-ink-muted">Alamat yang kamu buka tidak ada atau sudah dipindahkan.</p>
      <div className="mt-6">
        <Button href="/">Kembali ke beranda</Button>
      </div>
    </Container>
  )
}
