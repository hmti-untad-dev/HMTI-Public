/**
 * Menunggu layar boot (components/boot/BootScreen.tsx) selesai. Atribut html[data-boot] bernilai
 * "running" selama boot tampil, lalu "done" atau "skip". Animasi masuk dan hitung-naik memakai ini
 * supaya tidak berjalan di balik layar boot.
 */
export function afterBoot(run: () => void): () => void {
  const root = document.documentElement
  if (root.dataset.boot !== 'running') {
    run()
    return () => {}
  }
  const mo = new MutationObserver(() => {
    if (root.dataset.boot !== 'running') {
      mo.disconnect()
      run()
    }
  })
  mo.observe(root, { attributes: true, attributeFilter: ['data-boot'] })
  return () => mo.disconnect()
}
