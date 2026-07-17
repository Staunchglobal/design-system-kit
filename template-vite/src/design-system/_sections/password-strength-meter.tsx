import * as React from 'react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { PasswordInput } from '@/components/auth/password-input'
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter'

export default function PasswordStrengthMeterDemo() {
  const [password, setPassword] = React.useState('')
  return (
    <ComponentSection
      id="password-strength-meter"
      title="Password Strength Meter"
      description="Three-bar strength meter scored from auth password-policy rules."
    >
      <Example title="With password input" contentClassName="block w-72">
        <div className="space-y-3">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
          />
          <PasswordStrengthMeter password={password} />
        </div>
      </Example>
    </ComponentSection>
  )
}
