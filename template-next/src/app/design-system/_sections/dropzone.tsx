'use client'

import * as React from 'react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { Dropzone, ImageCropDialog } from '@/components/ui/dropzone'

export default function DropzoneDemo() {
  const [files, setFiles] = React.useState<File[]>([])
  const [cropFile, setCropFile] = React.useState<File | null>(null)
  const [cropOpen, setCropOpen] = React.useState(false)

  return (
    <ComponentSection
      id="dropzone"
      title="Dropzone"
      description="Drag-and-drop / click-to-browse file upload with preview cards. ImageCropDialog is an opt-in companion."
    >
      <Example title="Images up to 2 MB" contentClassName="block w-full max-w-md">
        <Dropzone accept="image/*" maxSizeBytes={2 * 1024 * 1024} multiple />
      </Example>
      <Example title="With ImageCropDialog intercept" contentClassName="block w-full max-w-md space-y-3">
        <Dropzone
          accept="image/*"
          maxSizeBytes={5 * 1024 * 1024}
          value={files}
          onValueChange={(next) => {
            const newest = next.find((f) => !files.includes(f))
            if (newest) {
              setCropFile(newest)
              setCropOpen(true)
              setFiles(files)
              return
            }
            setFiles(next)
          }}
        />
        <ImageCropDialog
          open={cropOpen}
          onOpenChange={setCropOpen}
          file={cropFile}
          aspect={1}
          onCropped={(cropped) => {
            // Dropzone here is single-file (no `multiple`), so the cropped result replaces
            // the slot rather than appending to it.
            setFiles([cropped])
            setCropFile(null)
          }}
        />
      </Example>
    </ComponentSection>
  )
}
