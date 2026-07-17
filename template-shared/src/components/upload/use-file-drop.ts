'use client'

import * as React from 'react'

type RejectedFile = {
  file: File
  reason: string
}

type UseFileDropOptions = {
  accept?: string
  maxSizeBytes?: number
  multiple?: boolean
  onFiles: (files: File[], rejected: RejectedFile[]) => void
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept || accept.trim() === '' || accept === '*') return true
  const tokens = accept.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()

  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) {
      const prefix = token.slice(0, -1)
      return type.startsWith(prefix)
    }
    return type === token
  })
}

function useFileDrop({ accept, maxSizeBytes, multiple = false, onFiles }: UseFileDropOptions) {
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dragDepth = React.useRef(0)

  const validate = React.useCallback(
    (list: FileList | File[]) => {
      const accepted: File[] = []
      const rejected: RejectedFile[] = []
      const files = Array.from(list)

      for (const file of files) {
        if (!matchesAccept(file, accept)) {
          rejected.push({ file, reason: 'File type not accepted' })
          continue
        }
        if (maxSizeBytes != null && file.size > maxSizeBytes) {
          rejected.push({
            file,
            reason: `File exceeds ${(maxSizeBytes / (1024 * 1024)).toFixed(1)} MB limit`,
          })
          continue
        }
        accepted.push(file)
      }

      if (!multiple && accepted.length > 1) {
        rejected.push(
          ...accepted.slice(1).map((file) => ({ file, reason: 'Only one file allowed' }))
        )
        return { accepted: accepted.slice(0, 1), rejected }
      }

      return { accepted, rejected }
    },
    [accept, maxSizeBytes, multiple]
  )

  const handleFiles = React.useCallback(
    (list: FileList | File[] | null) => {
      if (!list || list.length === 0) return
      const { accepted, rejected } = validate(list)
      onFiles(accepted, rejected)
    },
    [onFiles, validate]
  )

  const dragHandlers = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragDepth.current += 1
      setIsDragging(true)
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragDepth.current -= 1
      if (dragDepth.current <= 0) {
        dragDepth.current = 0
        setIsDragging(false)
      }
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragDepth.current = 0
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
  }

  function openBrowser() {
    inputRef.current?.click()
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files)
    e.target.value = ''
  }

  return {
    isDragging,
    inputRef,
    dragHandlers,
    openBrowser,
    onInputChange,
    accept,
    multiple,
  }
}

export { useFileDrop, matchesAccept }
export type { UseFileDropOptions, RejectedFile }
