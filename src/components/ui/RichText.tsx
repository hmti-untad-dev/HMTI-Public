import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export function RichText({ data, className = '' }: { data?: SerializedEditorState | null; className?: string }) {
  if (!data) return null
  return <LexicalRichText data={data} className={`space-y-4 text-ink-muted [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink ${className}`} />
}
