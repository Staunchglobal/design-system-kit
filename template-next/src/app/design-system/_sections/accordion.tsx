'use client'

import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

export default function AccordionDemo() {
  return (
    <ComponentSection
        id="accordion"
        title="Accordion"
        description="Vertically stacked, expandable content sections."
      >
        <ExampleGrid>
          <Example title="Single, collapsible" contentClassName="block">
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is this project?</AccordionTrigger>
                <AccordionContent>
                  A Next.js boilerplate showcasing every shadcn/ui component for visual QA.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>
                  Yes, it uses Radix primitives under the hood which follow WAI-ARIA patterns.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I customize it?</AccordionTrigger>
                <AccordionContent>
                  Yes, every component is copied into your repo so you own the source.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Example>
          <Example title="Multiple open" contentClassName="block">
            <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Billing</AccordionTrigger>
                <AccordionContent>Manage your subscription and invoices here.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Security</AccordionTrigger>
                <AccordionContent>
                  Configure two-factor authentication and sessions.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Integrations</AccordionTrigger>
                <AccordionContent>Connect third-party apps to your workspace.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </Example>
        </ExampleGrid>
      </ComponentSection>
  )
}
