import { CircleUserIcon, ShieldCheckIcon, UserIcon } from 'lucide-react'
import { ComponentSection, Example, ExampleGrid } from '@/design-system/_lib/showcase'
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge } from '@/components/ui/avatar'

export default function AvatarDemo() {
  return (
    <ComponentSection
        id="avatar"
        title="Avatar"
        description="User representations with image, fallback, sizes, grouping, and status badges."
      >
        <ExampleGrid>
          <Example title="Image and fallback">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="Shad" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="/broken-image.png" alt="Broken" />
              <AvatarFallback>
                <UserIcon className="size-4" />
              </AvatarFallback>
            </Avatar>
          </Example>
          <Example title="Sizes" description="sm / default / lg">
            <Avatar size="sm">
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            <Avatar size="default">
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>LG</AvatarFallback>
            </Avatar>
          </Example>
          <Example title="Avatar group" description="Stacked avatars with overflow count">
            <AvatarGroup>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Member 1" />
                <AvatarFallback>M1</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>M2</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>M3</AvatarFallback>
              </Avatar>
              <AvatarGroupCount>+3</AvatarGroupCount>
            </AvatarGroup>
          </Example>
          <Example title="Status badge" description="Online indicator on an avatar">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="Online user" />
              <AvatarFallback>ON</AvatarFallback>
              <AvatarBadge className="bg-emerald-500" />
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>
                <CircleUserIcon className="size-5" />
              </AvatarFallback>
              <AvatarBadge>
                <ShieldCheckIcon />
              </AvatarBadge>
            </Avatar>
          </Example>
        </ExampleGrid>
      </ComponentSection>
  )
}
