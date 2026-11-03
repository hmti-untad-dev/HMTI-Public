type Field = { name: string; label: string; type?: string | null; required?: boolean | null }

/**
 * Cetakan formulir untuk skeleton: tampil tapi belum bisa dikirim.
 * Diganti form sungguhan (server action + Zod + captcha) di milestone Layanan.
 */
export function FormStub({ fields, submitLabel = 'Kirim' }: { fields: Field[]; submitLabel?: string }) {
  return (
    <form className="max-w-xl space-y-4" aria-disabled="true">
      <p className="rounded-control bg-brand-soft/60 px-3 py-2 text-sm text-ink">
        Formulir ini belum aktif (tahap pengembangan).
      </p>
      {fields.map((f) => (
        <label key={f.name} className="block text-sm">
          <span className="mb-1 block font-medium">
            {f.label}
            {f.required && ' *'}
          </span>
          {f.type === 'textarea' ? (
            <textarea disabled rows={4} className="w-full rounded-control border border-line px-3 py-2" />
          ) : (
            <input disabled type={f.type === 'file' ? 'file' : (f.type ?? 'text')} className="w-full rounded-control border border-line px-3 py-2" />
          )}
        </label>
      ))}
      <button type="button" disabled className="rounded-control bg-brand px-4 py-2 text-sm font-medium text-on-brand opacity-50">
        {submitLabel}
      </button>
    </form>
  )
}
