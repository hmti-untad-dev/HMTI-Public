import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Pengaman saat situs lokal dibagikan ke publik (mis. lewat Cloudflare Tunnel) dengan SHARE_PREVIEW=1:
 * permintaan dari luar (bukan localhost, atau datang lewat Cloudflare) tidak boleh membuka panel admin
 * maupun REST/GraphQL API Payload. Pengecualian: GET berkas media (/api/media/file/...) agar gambar tetap tampil.
 * Tanpa SHARE_PREVIEW=1 (pengembangan biasa / deploy nanti), proxy ini tidak melakukan apa-apa.
 */
export function proxy(request: NextRequest) {
  if (process.env.SHARE_PREVIEW !== '1') return NextResponse.next()
  const host = (request.headers.get('host') ?? '').split(':')[0]
  const local = host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
  const viaCloudflare = request.headers.has('cf-ray') || request.headers.has('cf-connecting-ip')
  if (local && !viaCloudflare) return NextResponse.next()

  const { pathname } = request.nextUrl
  if (request.method === 'GET' && pathname.startsWith('/api/media/file/')) return NextResponse.next()
  return new NextResponse('Tidak tersedia di tautan pratinjau.', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } })
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
