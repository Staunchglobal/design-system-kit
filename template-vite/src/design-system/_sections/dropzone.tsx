import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { Dropzone } from '@/components/ui/dropzone'

export default function DropzoneDemo() {
  return (
    <ComponentSection
      id="dropzone"
      title="Dropzone"
      description="Drag-and-drop / click-to-browse file upload with preview cards."
    >
      <Example title="Images up to 2 MB" contentClassName="block w-full max-w-md">
        <Dropzone accept="image/*" maxSizeBytes={2 * 1024 * 1024} multiple />
      </Example>
    </ComponentSection>
  )
}
