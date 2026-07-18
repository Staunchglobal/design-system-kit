'use client'

import * as React from 'react'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ImageCropDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The image file to crop. A new object URL is created (and cleaned up) whenever this changes. */
  file: File | null
  /** Crop aspect ratio (width / height). Omit for free-form. */
  aspect?: number
  /** Called with the cropped File on successful apply. */
  onCropped: (file: File) => void
}

async function cropToFile(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  originalName: string
): Promise<File> {
  const canvas = document.createElement('canvas')
  // PixelCrop coordinates are in displayed-image pixels; scale to natural resolution.
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  canvas.width = Math.max(1, Math.round(pixelCrop.width * scaleX))
  canvas.height = Math.max(1, Math.round(pixelCrop.height * scaleY))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not acquire 2D canvas context')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  )

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('canvas.toBlob returned null'))),
      'image/jpeg',
      0.95
    )
  })

  const ext = originalName.replace(/\.[^.]+$/, '')
  return new File([blob], `${ext}.jpg`, { type: 'image/jpeg' })
}

function ImageCropDialog({ open, onOpenChange, file, aspect, onCropped }: ImageCropDialogProps) {
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null)
  const [crop, setCrop] = React.useState<Crop | undefined>()
  const [completedCrop, setCompletedCrop] = React.useState<PixelCrop | undefined>()
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const imageRef = React.useRef<HTMLImageElement>(null)

  // Create/revoke object URL whenever the file changes.
  /* eslint-disable react-hooks/set-state-in-effect -- file changes must synchronously reset crop state while managing the object URL lifecycle */
  React.useEffect(() => {
    if (!file) {
      setObjectUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setObjectUrl(url)
    setCrop(undefined)
    setCompletedCrop(undefined)
    setError(null)
    return () => URL.revokeObjectURL(url)
  }, [file])
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleApply() {
    if (!imageRef.current || !file) return
    setBusy(true)
    setError(null)
    try {
      let result: File
      const hasCrop =
        completedCrop && completedCrop.width > 0 && completedCrop.height > 0

      if (hasCrop) {
        result = await cropToFile(imageRef.current, completedCrop, file.name)
      } else {
        // No selection made — pass the original file through unchanged.
        result = file
      }
      onCropped(result)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Crop failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ui="image-crop-dialog" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
        </DialogHeader>

        {objectUrl ? (
          <div className="overflow-auto rounded-lg">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="max-h-[60vh]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={objectUrl}
                alt="Image to crop"
                className="max-w-full"
              />
            </ReactCrop>
          </div>
        ) : null}

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <DialogFooter showCloseButton>
          <Button type="button" disabled={!objectUrl || busy} onClick={handleApply}>
            {busy ? 'Applying…' : 'Apply crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ImageCropDialog }
export type { ImageCropDialogProps }
