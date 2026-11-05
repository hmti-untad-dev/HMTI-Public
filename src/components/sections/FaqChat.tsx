'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { sendChatMessage } from '@/app/actions/chat'

type Item = { id: number | string; question: string; answer: string }
type Bubble = { from: 'hmti' | 'user'; text: string }

/** Avatar HMTI (lambang) untuk sisi yang menjawab. */
function HmtiAvatar({ className = 'size-7' }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/hmti-logo.webp" alt="" width={28} height={28} className={`${className} shrink-0 rounded-full`} />
}

/** Avatar pengguna kecil untuk sisi yang bertanya. */
function UserAvatar({ className = 'size-7' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`${className} flex shrink-0 items-center justify-center rounded-full border border-line bg-surface-raised text-ink-muted`}>
      <svg viewBox="0 0 24 24" className="size-[60%]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.6" />
        <path d="M4.5 20c.6-3.6 3.6-5.6 7.5-5.6s6.9 2 7.5 5.6" />
      </svg>
    </span>
  )
}

const GREETING: Bubble = {
  from: 'hmti',
  text: 'Halo! Belum ketemu jawabannya? Tulis pertanyaanmu di sini. Balasan kami kirim lewat email, jadi kamu tidak perlu login.',
}

/** Kolom chat ke HMTI: isi email dulu, baru tulis pesan. Pesan masuk ke admin; balasan lewat email. */
function ChatBox() {
  const id = useId().replace(/:/g, '')
  const [email, setEmail] = useState('')
  const [draftEmail, setDraftEmail] = useState('')
  const [thread, setThread] = useState<Bubble[]>([GREETING])
  const [text, setText] = useState('')
  const [honey, setHoney] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('hmti-chat-email')
      if (saved) setEmail(saved)
    } catch {
      /* penyimpanan diblokir: pengguna cukup mengisi ulang */
    }
  }, [])
  useEffect(() => {
    const box = endRef.current?.parentElement
    if (box) box.scrollTop = box.scrollHeight
  }, [thread])

  function start(e: React.FormEvent) {
    e.preventDefault()
    const v = draftEmail.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return setError('Format email belum benar.')
    setError(null)
    setEmail(v)
    try {
      sessionStorage.setItem('hmti-chat-email', v)
    } catch {
      /* abaikan */
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const message = text.trim()
    if (!message || sending) return
    setSending(true)
    setError(null)
    const res = await sendChatMessage({ email, message, website: honey })
    setSending(false)
    if (!res.ok) return setError(res.error)
    setThread((t) => [
      ...t,
      { from: 'user', text: message },
      { from: 'hmti', text: `Terima kasih, pesanmu sudah kami terima. Balasan akan dikirim ke ${email}.` },
    ])
    setText('')
  }

  function changeEmail() {
    setEmail('')
    setDraftEmail('')
    try {
      sessionStorage.removeItem('hmti-chat-email')
    } catch {
      /* abaikan */
    }
  }

  const field = 'w-full border border-line bg-surface px-3 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none'
  return (
    <section aria-labelledby={`${id}-t`} className="mt-12 overflow-hidden border border-line bg-surface-raised">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <HmtiAvatar className="size-9" />
        <div>
          <h3 id={`${id}-t`} className="font-display text-base font-semibold leading-tight">
            Chat dengan HMTI
          </h3>
          <p className="text-xs text-ink-muted">Dijawab lewat email, tanpa login</p>
        </div>
      </header>

      <div className="max-h-72 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {thread.map((b, i) =>
          b.from === 'hmti' ? (
            <div key={i} className="flex items-start gap-2.5">
              <HmtiAvatar />
              <p className="max-w-[85%] rounded-2xl rounded-tl-md bg-ink px-4 py-2.5 text-[0.95rem] text-surface">{b.text}</p>
            </div>
          ) : (
            <div key={i} className="flex flex-row-reverse items-start gap-2.5">
              <UserAvatar />
              <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-brand px-4 py-2.5 text-[0.95rem] text-on-brand">{b.text}</p>
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-line p-4">
        {!email ? (
          <form onSubmit={start} noValidate className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor={`${id}-email`} className="sr-only">
              Email kamu
            </label>
            <input
              id={`${id}-email`}
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={draftEmail}
              onChange={(e) => setDraftEmail(e.target.value)}
              placeholder="Email kamu, mis. nama@gmail.com"
              className={`${field} flex-1`}
            />
            <button type="submit" className="min-h-11 bg-brand px-5 text-sm font-medium text-on-brand transition-colors hover:bg-brand-strong">
              Mulai chat
            </button>
          </form>
        ) : (
          <form onSubmit={send} className="space-y-2">
            <p className="text-xs text-ink-muted">
              Balasan dikirim ke <span className="text-ink">{email}</span>{' '}
              <button type="button" onClick={changeEmail} className="text-link underline-offset-2 hover:underline">
                ganti
              </button>
            </p>
            {/* Honeypot: disembunyikan dari manusia dan pembaca layar; bot yang mengisinya diabaikan. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honey} onChange={(e) => setHoney(e.target.value)} className="hidden" />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label htmlFor={`${id}-msg`} className="sr-only">
                Pesan untuk HMTI
              </label>
              <textarea
                id={`${id}-msg`}
                required
                rows={2}
                maxLength={1500}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void send(e as unknown as React.FormEvent)
                }}
                placeholder="Tulis pertanyaanmu…"
                className={`${field} flex-1 resize-none`}
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="min-h-11 bg-brand px-5 text-sm font-medium text-on-brand transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? 'Mengirim…' : 'Kirim'}
              </button>
            </div>
          </form>
        )}
        {error && (
          <p role="alert" className="mt-2 text-sm text-ink">
            <span className="mr-1.5 font-mono text-xs uppercase tracking-wider text-link">Gagal</span>
            {error}
          </p>
        )}
      </div>
    </section>
  )
}

/**
 * FAQ bergaya percakapan: pertanyaan sebagai gelembung (ikon pengguna kecil), jawaban sebagai gelembung gelap
 * dengan lambang HMTI. Satu jawaban terbuka pada satu waktu. Di bawahnya ada kolom chat ke HMTI lewat email.
 */
export function FaqChat({ items }: { items: Item[] }) {
  const base = useId().replace(/:/g, '')
  const [open, setOpen] = useState<Item['id'] | null>(items[0]?.id ?? null)

  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">Pertanyaan yang sering diajukan</p>
      <ul className="space-y-3">
        {items.map((item) => {
          const isOpen = open === item.id
          const panel = `${base}-${item.id}`
          return (
            <li key={item.id}>
              <div className="flex items-center gap-2.5">
                <UserAvatar />
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panel}
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  className={`min-h-11 max-w-[84%] rounded-2xl rounded-bl-md px-4 py-3 text-left text-[0.95rem] transition-colors duration-200 ${
                    isOpen ? 'bg-brand text-on-brand' : 'bg-surface-raised text-ink hover:bg-brand-soft/50'
                  } border border-line`}
                >
                  {item.question}
                </button>
                <span aria-hidden="true" className="relative size-4 shrink-0 text-ink-muted">
                  <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                  <span className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-300 ${isOpen ? 'scale-y-0' : 'scale-y-100'}`} />
                </span>
              </div>

              <div id={panel} role="region" data-open={isOpen} className="faq-body" inert={!isOpen}>
                <div>
                  <div className="ml-6 mt-2 flex items-start gap-2.5 sm:ml-10">
                    <HmtiAvatar />
                    <p className="max-w-[88%] rounded-2xl rounded-tl-md bg-ink px-4 py-3 text-[0.95rem] text-surface">{item.answer}</p>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <ChatBox />
    </div>
  )
}
