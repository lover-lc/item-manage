import { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Button } from '@/components/ui/button'

type AvatarCropDialogProps = {
  open: boolean
  imageSrc: string
  onClose: () => void
  onConfirm: (blob: Blob) => void
  isPending?: boolean
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const size = 256
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to crop image'))
      },
      'image/jpeg',
      0.9,
    )
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export default function AvatarCropDialog({
  open,
  imageSrc,
  onClose,
  onConfirm,
  isPending,
}: AvatarCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels)
  }, [])

  async function handleConfirm() {
    if (!croppedArea) return
    const blob = await getCroppedBlob(imageSrc, croppedArea)
    onConfirm(blob)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-card p-4 sm:rounded-2xl">
        <h2 className="mb-3 text-base font-semibold">裁剪头像</h2>
        <div className="relative h-64 overflow-hidden rounded-xl bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <label className="mt-3 block text-xs text-muted-foreground">
          缩放
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            取消
          </Button>
          <Button type="button" onClick={() => void handleConfirm()} disabled={isPending}>
            {isPending ? '上传中…' : '确认'}
          </Button>
        </div>
      </div>
    </div>
  )
}
