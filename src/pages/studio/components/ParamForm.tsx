import { cn } from '@/shared/lib/cn'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import type { StudioCatalog, StudioModel, StudioModelParam } from '@/shared/api/types'
import { ImageDropzone } from './ImageDropzone'

interface Props {
  model: StudioModel
  catalog: StudioCatalog
  params: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
}

function AspectPicker({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { id: string; label: string }[]
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            'rounded-full border px-3 py-1 text-xs transition-all',
            value === o.id
              ? 'border-violet-500/50 bg-violet-500/15 text-white'
              : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-100',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function FieldWrap({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-300">
        {label} {required ? <span className="text-red-400">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-zinc-500">{hint}</p> : null}
    </div>
  )
}

export function ParamForm({ model, catalog, params, onChange }: Props) {
  function set(key: string, val: unknown) {
    const next = { ...params }
    if (val === undefined || val === null || val === '') {
      delete next[key]
    } else {
      next[key] = val
    }
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {model.params.map((p: StudioModelParam) => {
        const val = params[p.name]
        if (p.type === 'textarea') {
          return (
            <FieldWrap key={p.name} label={p.label} required={p.required} hint={p.hint}>
              <Textarea
                value={(val as string) ?? ''}
                placeholder={p.placeholder}
                onChange={(e) => set(p.name, e.target.value)}
                rows={p.name === 'prompt' ? 4 : 2}
              />
            </FieldWrap>
          )
        }
        if (p.type === 'text') {
          return (
            <FieldWrap key={p.name} label={p.label} required={p.required} hint={p.hint}>
              <Input
                value={(val as string) ?? ''}
                placeholder={p.placeholder}
                onChange={(e) => set(p.name, e.target.value)}
              />
            </FieldWrap>
          )
        }
        if (p.type === 'select') {
          return (
            <FieldWrap key={p.name} label={p.label} required={p.required} hint={p.hint}>
              <select
                value={(val as string) ?? (p.default as string) ?? ''}
                onChange={(e) => set(p.name, e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {p.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FieldWrap>
          )
        }
        if (p.type === 'aspect') {
          const opts = model.kind === 'IMAGE' ? catalog.aspectImage : catalog.aspectVideo
          const current = (val as string) ?? (p.default as string) ?? opts[0]?.id
          return (
            <FieldWrap key={p.name} label={p.label} required={p.required} hint={p.hint}>
              <AspectPicker value={current ?? ''} onChange={(v) => set(p.name, v)} options={opts} />
            </FieldWrap>
          )
        }
        if (p.type === 'number') {
          return (
            <FieldWrap key={p.name} label={p.label} required={p.required} hint={p.hint}>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={(val as number) ?? (p.default as number) ?? 0}
                  onChange={(e) => set(p.name, Number(e.target.value))}
                  className="flex-1 accent-violet-500"
                />
                <span className="w-14 rounded-md border border-white/10 bg-zinc-900 px-2 py-1 text-center text-xs text-zinc-200">
                  {Number(val ?? p.default ?? 0)}
                </span>
              </div>
            </FieldWrap>
          )
        }
        if (p.type === 'boolean') {
          const checked = Boolean(val ?? p.default)
          return (
            <FieldWrap key={p.name} label={p.label} hint={p.hint}>
              <button
                type="button"
                onClick={() => set(p.name, !checked)}
                className={cn(
                  'inline-flex h-6 w-11 items-center rounded-full border border-white/10 transition',
                  checked ? 'bg-violet-600' : 'bg-zinc-800',
                )}
                aria-pressed={checked}
              >
                <span
                  className={cn(
                    'ml-0.5 inline-block h-5 w-5 transform rounded-full bg-white transition',
                    checked ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
            </FieldWrap>
          )
        }
        if (p.type === 'image') {
          const isMystic =
            model.id === 'mystic' &&
            (p.name === 'structure_reference' || p.name === 'style_reference')
          return (
            <ImageDropzone
              key={p.name}
              label={p.label}
              hint={p.hint}
              mode={isMystic ? 'base64' : 'url'}
              paramValue={(val as string) ?? null}
              onValueChange={(v) => set(p.name, v ?? undefined)}
            />
          )
        }
        return null
      })}
    </div>
  )
}
