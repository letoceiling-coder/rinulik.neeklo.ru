import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImageIcon, UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'
import { uploadReference } from '@/shared/api/studio'
import { cn } from '@/shared/lib/cn'
import { AdminMediaImage } from '@/shared/ui/AdminMediaImage'

interface Props {
  label?: string
  hint?: string
  /** url: URL отправляется на бэк (image-to-video); base64: передаётся исходное base64 без data:-префикса. */
  mode: 'url' | 'base64'
  /** Текущее значение, которое уже ушло в params (url или base64). Мы его не используем для превью в base64-режиме (нет смысла). */
  paramValue: string | null
  onValueChange: (value: string | null) => void
}

export function ImageDropzone({ label, hint, mode, paramValue, onValueChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const blobRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (blobRef.current) URL.revokeObjectURL(blobRef.current)
    }
  }, [])

  // Когда paramValue приходит как /uploads/... — показываем его
  useEffect(() => {
    if (mode === 'url' && paramValue && paramValue.startsWith('/uploads/')) {
      setPreview(paramValue)
    }
    if (!paramValue) {
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current)
        blobRef.current = null
      }
      setPreview(null)
    }
  }, [paramValue, mode])

  const handleFiles = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) return
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Файл больше 10MB')
        return
      }
      setUploading(true)
      try {
        if (blobRef.current) {
          URL.revokeObjectURL(blobRef.current)
          blobRef.current = null
        }
        const blobUrl = URL.createObjectURL(file)
        blobRef.current = blobUrl
        setPreview(blobUrl)

        if (mode === 'base64') {
          const b64 = await new Promise<string>((resolve, reject) => {
            const fr = new FileReader()
            fr.onload = () => {
              const r = String(fr.result || '')
              const comma = r.indexOf(',')
              resolve(comma >= 0 ? r.slice(comma + 1) : r)
            }
            fr.onerror = () => reject(fr.error)
            fr.readAsDataURL(file)
          })
          onValueChange(b64)
        } else {
          const res = await uploadReference(file)
          onValueChange(res.url)
          toast.success('Файл загружен')
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Ошибка загрузки')
      } finally {
        setUploading(false)
      }
    },
    [mode, onValueChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFiles,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: false,
    noClick: !!preview,
  })

  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-300">{label}</label>
          {preview ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-red-300"
              onClick={() => {
                if (blobRef.current) {
                  URL.revokeObjectURL(blobRef.current)
                  blobRef.current = null
                }
                setPreview(null)
                onValueChange(null)
              }}
            >
              <X className="size-3" /> Убрать
            </button>
          ) : null}
        </div>
      ) : null}
      <div
        {...getRootProps()}
        className={cn(
          'relative flex min-h-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-center transition-all',
          isDragActive && 'border-violet-400/60 bg-violet-500/10',
          preview && 'cursor-default',
        )}
      >
        <input {...getInputProps()} />
        {preview ? (
          preview.startsWith('blob:') ? (
            <img src={preview} alt="reference" className="h-36 w-full object-contain" />
          ) : (
            <AdminMediaImage url={preview} alt="reference" className="h-36 w-full object-contain" />
          )
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-xs text-zinc-400">
            {uploading ? (
              <>
                <UploadCloud className="size-6 animate-pulse text-violet-400" />
                Загрузка…
              </>
            ) : (
              <>
                <ImageIcon className="size-6 text-zinc-500" />
                <span>Перетащите или выберите изображение</span>
                {hint ? <span className="text-[10px] text-zinc-500">{hint}</span> : null}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
