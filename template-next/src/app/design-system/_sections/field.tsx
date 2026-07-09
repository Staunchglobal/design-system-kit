'use client'

import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function FieldDemo() {
  return (
    <ComponentSection
        id="field"
        title="Field"
        description="Composable primitives for building consistent, accessible form fields."
      >
        <Example title="Label, input, and description">
          <FieldGroup className="max-w-sm">
            <Field>
              <FieldLabel htmlFor="field-username">Username</FieldLabel>
              <Input id="field-username" placeholder="shadcn" />
              <FieldDescription>This is your public display name.</FieldDescription>
            </Field>
          </FieldGroup>
        </Example>

        <Example title="With error">
          <FieldGroup className="max-w-sm">
            <Field data-invalid="true">
              <FieldLabel htmlFor="field-email">Email</FieldLabel>
              <Input id="field-email" aria-invalid defaultValue="not-an-email" />
              <FieldError>Please enter a valid email address.</FieldError>
            </Field>
          </FieldGroup>
        </Example>

        <Example title="Fieldset with legend and separator">
          <FieldSet className="max-w-sm">
            <FieldLegend>Address</FieldLegend>
            <FieldDescription>Enter your shipping address below.</FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="field-street">Street address</FieldLabel>
                <Input id="field-street" placeholder="123 Main St" />
              </Field>
              <FieldSeparator>Contact</FieldSeparator>
              <Field>
                <FieldLabel htmlFor="field-phone">Phone number</FieldLabel>
                <Input id="field-phone" type="tel" placeholder="+1 (555) 000-0000" />
              </Field>
            </FieldGroup>
          </FieldSet>
        </Example>

        <Example title="Card-style field with checkbox">
          <FieldLabel htmlFor="field-marketing" className="max-w-sm">
            <Field orientation="horizontal">
              <Checkbox id="field-marketing" defaultChecked />
              <FieldContent>
                <FieldTitle>Marketing emails</FieldTitle>
                <FieldDescription>Receive emails about new products and features.</FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
        </Example>
      </ComponentSection>
  )
}
