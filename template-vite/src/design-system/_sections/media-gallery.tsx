'use client'

import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { MediaGallery, type MediaItem } from '@/components/ui/media-gallery'

const ITEMS: MediaItem[] = [
  {
    id: 'img-1',
    type: 'image',
    src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    alt: 'Workout equipment',
  },
  {
    id: 'yt-1',
    type: 'embed',
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Sample YouTube embed',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  },
  {
    id: 'img-2',
    type: 'image',
    src: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    alt: 'Training session',
  },
]

export default function MediaGalleryDemo() {
  return (
    <ComponentSection
      id="media-gallery"
      title="Media Gallery"
      description="Mixed image / video / YouTube / Vimeo gallery with thumbnail strip and prev/next."
    >
      <Example title="Mixed media" contentClassName="block w-full max-w-2xl">
        <MediaGallery items={ITEMS} />
      </Example>
    </ComponentSection>
  )
}
