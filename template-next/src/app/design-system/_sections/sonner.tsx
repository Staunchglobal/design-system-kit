'use client'

import { toast } from 'sonner'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'

export default function SonnerDemo() {
  return (
    <ComponentSection
        id="sonner"
        title="Sonner"
        description="A toast notification system. The Toaster is mounted globally in the root layout."
      >
        <Example title="Toast triggers" description="Click a button to fire a toast.">
          <Button
            variant="outline"
            onClick={() =>
              toast('Event has been created', {
                description: 'Monday, January 3rd at 6:00pm',
              })
            }
          >
            Default
          </Button>
          <Button variant="outline" onClick={() => toast.success('Changes saved successfully')}>
            Success
          </Button>
          <Button variant="outline" onClick={() => toast.error('Failed to save changes')}>
            Error
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.warning('Your session is about to expire')}
          >
            Warning
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.promise(
                new Promise<{ name: string }>((resolve) =>
                  setTimeout(() => resolve({ name: 'design-system.json' }), 2000)
                ),
                {
                  loading: 'Uploading file...',
                  success: (data) => `${data.name} uploaded successfully`,
                  error: 'Upload failed',
                }
              )
            }
          >
            Promise
          </Button>
        </Example>
      </ComponentSection>
  )
}
