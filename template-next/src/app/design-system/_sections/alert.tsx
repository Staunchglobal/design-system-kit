'use client'

import { AlertTriangleIcon, InfoIcon } from 'lucide-react'
import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function AlertDemo() {
  return (
    <ComponentSection
        id="alert"
        title="Alert"
        description="Displays a callout for user attention, with optional icon and inline action."
      >
        <ExampleGrid>
          <Example title="Default">
            <Alert className="w-full">
              <InfoIcon />
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
            </Alert>
          </Example>

          <Example title="Destructive">
            <Alert variant="destructive" className="w-full">
              <AlertTriangleIcon />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                Your changes could not be saved. Please try again.
              </AlertDescription>
            </Alert>
          </Example>

          <Example title="Success">
            <Alert variant="success" className="w-full">
              <InfoIcon />
              <AlertTitle>Saved</AlertTitle>
              <AlertDescription>Your changes have been saved successfully.</AlertDescription>
            </Alert>
          </Example>

          <Example title="Warning">
            <Alert variant="warning" className="w-full">
              <AlertTriangleIcon />
              <AlertTitle>Check your input</AlertTitle>
              <AlertDescription>Some fields need attention before you continue.</AlertDescription>
            </Alert>
          </Example>

          <Example title="Info">
            <Alert variant="info" className="w-full">
              <InfoIcon />
              <AlertTitle>Did you know?</AlertTitle>
              <AlertDescription>You can customize this kit from the theme editor.</AlertDescription>
            </Alert>
          </Example>

          <Example
            title="With action"
            description="AlertAction renders inline controls."
            className="md:col-span-2"
          >
            <Alert className="w-full">
              <InfoIcon />
              <AlertTitle>Update available</AlertTitle>
              <AlertDescription>A new version is ready to install.</AlertDescription>
              <AlertAction>
                <Button size="sm" variant="outline">
                  Retry
                </Button>
              </AlertAction>
            </Alert>
          </Example>
        </ExampleGrid>
      </ComponentSection>
  )
}
