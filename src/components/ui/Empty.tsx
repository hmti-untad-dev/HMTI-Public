/** State kosong: konten belum diisi admin. Jangan sampai halaman terlihat rusak. */
export function Empty({ children = 'Belum ada data.' }: { children?: string }) {
  return (
    <p className="rounded-card border border-dashed border-line p-8 text-center text-sm text-ink-muted">{children}</p>
  )
}
