'use client'

import * as React from 'react'
import { Slider as SliderPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full cursor-pointer touch-none items-center select-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-neutral-200 relative grow overflow-hidden rounded-full data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="bg-primary absolute select-none data-horizontal:h-full data-vertical:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-border relative block size-4 shrink-0 cursor-pointer rounded-full border bg-neutral-0 shadow-(--shadow-xs) transition-[color,box-shadow] select-none after:absolute after:-inset-2 focus-visible:outline-hidden hover:border-neutral-400 hover:ring-4 hover:ring-primary/10 focus-visible:border-neutral-400 focus-visible:ring-4 focus-visible:ring-primary/20 active:border-neutral-400 active:ring-4 active:ring-primary/20 data-disabled:cursor-not-allowed data-disabled:border-border data-disabled:hover:ring-0 data-disabled:focus-visible:ring-0 data-disabled:active:ring-0"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
