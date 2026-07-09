'use client'

import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

export default function CarouselDemo() {
  return (
    <ComponentSection
        id="carousel"
        title="Carousel"
        description="A slideshow of content items with previous/next controls."
      >
        <Example title="Basic carousel" contentClassName="block">
          <Carousel className="mx-auto w-full max-w-xs">
            <CarouselContent>
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index}>
                  <div className="bg-muted flex aspect-square items-center justify-center rounded-lg text-4xl font-semibold">
                    {index + 1}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </Example>
      </ComponentSection>
  )
}
