import imageCompression from 'browser-image-compression'

const MAX_SIZE_MB = 1.5
const MAX_WIDTH_OR_HEIGHT = 1920

/**
 * Compresses an image client-side before it's attached to a chat message (mirrors
 * function-rx's `imageCompression.ts`) — keeps large phone-camera photos from bloating
 * every upload. Non-image files pass through untouched.
 */
export async function compressImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  try {
    return await imageCompression(file, {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
      useWebWorker: true,
    })
  } catch {
    // A compression failure (corrupt image, worker unavailable, etc.) shouldn't block
    // sending the original file.
    return file
  }
}

export function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImageIfNeeded))
}
