import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AppIcon } from '@/components/icons/icon'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-0 flex w-auto justify-end', className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex items-center gap-1', className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <Button
      asChild
      variant={isActive ? 'outline' : 'ghost'}
      size={size}
      className={cn(
        size === 'icon'
          ? [
              'box-border w-8! h-6! min-w-8! min-h-6! p-0! rounded-md! border! border-border! bg-neutral-0! text-muted-600! text-xs! font-medium! leading-none! shadow-none! ring-0! outline-none!',
              'hover:bg-neutral-50! hover:text-foreground!',
              'focus-visible:border-info-500! focus-visible:shadow-none! focus-visible:outline-none! focus-visible:ring-0!',
              'data-[active=true]:bg-info-50! data-[active=true]:text-info-700! data-[active=true]:border-transparent! dark:data-[active=true]:bg-info-950! dark:data-[active=true]:text-info-300!',
              'data-[active=true]:hover:bg-info-100! data-[active=true]:hover:text-info-700!',
              'dark:bg-neutral-900! dark:text-muted-400! dark:border-neutral-700!',
            ]
          : 'w-auto! min-w-0! px-2!',
        className
      )}
    >
      <a
        aria-current={isActive ? 'page' : undefined}
        data-ui="pagination-link"
        data-active={isActive}
        {...props}
      />
    </Button>
  )
}

function PaginationPrevious({
  className,
  text = 'Previous',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn('pl-1.5!', className)}
      {...props}
      size="default"
    >
      <AppIcon name="pagination.previous" data-icon="inline-start" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = 'Next',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn('pr-1.5!', className)}
      {...props}
      size="default"
    >
      <span className="hidden sm:block">{text}</span>
      <AppIcon name="pagination.next" data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex w-8 h-6 items-center justify-center rounded-md border border-neutral-200 bg-neutral-0 text-muted-600 text-xs font-medium before:content-['…'] before:leading-none [&_svg]:hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-muted-400",
        className
      )}
      {...props}
    >
      <AppIcon name="pagination.ellipsis" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
