import { ArrowRightIcon, MailIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function ButtonDemo() {
  return (
    <ComponentSection
        id="button"
        title="Button"
        description="Primary interactive element with multiple variants, sizes, and states."
      >
        <Example title="Variants">
          <Button variant="default">Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </Example>

        <Example title="Sizes">
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon-xs" aria-label="Add">
            <PlusIcon />
          </Button>
          <Button size="icon-sm" aria-label="Add">
            <PlusIcon />
          </Button>
          <Button size="icon" aria-label="Add">
            <PlusIcon />
          </Button>
          <Button size="icon-lg" aria-label="Add">
            <PlusIcon />
          </Button>
        </Example>

        <Example title="Disabled">
          <Button variant="default" disabled>
            Default
          </Button>
          <Button variant="outline" disabled>
            Outline
          </Button>
          <Button variant="secondary" disabled>
            Secondary
          </Button>
          <Button variant="destructive" disabled>
            Destructive
          </Button>
        </Example>

        <Example title="With icons" description="Leading and trailing icon spacing via data-icon.">
          <Button>
            <span data-icon="inline-start">
              <MailIcon />
            </span>
            Send email
          </Button>
          <Button variant="outline">
            Continue
            <span data-icon="inline-end">
              <ArrowRightIcon />
            </span>
          </Button>
          <Button variant="destructive">
            <span data-icon="inline-start">
              <TrashIcon />
            </span>
            Delete
          </Button>
        </Example>

        <Example
          title="As child"
          description="Renders an anchor styled as a button — swap in your router's Link if you use one."
        >
          <Button asChild>
            <a href="/design-system">Go to design system</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/design-system">Outline link</a>
          </Button>
        </Example>

        <Example title="Loading state">
          <Button disabled>
            <Spinner />
            Please wait
          </Button>
          <Button variant="outline" size="icon" disabled aria-label="Loading">
            <Spinner />
          </Button>
        </Example>
      </ComponentSection>
  )
}
