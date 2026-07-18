// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Rating } from './rating'

afterEach(cleanup)

describe('Rating', () => {
  it('renders an accessible radio group and reports a clicked value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Rating value={2} max={5} onValueChange={onValueChange} aria-label="Quality" />)

    expect(screen.getByRole('radiogroup', { name: 'Quality' })).toBeTruthy()
    expect(screen.getAllByRole('radio')).toHaveLength(5)
    expect(screen.getByRole('radio', { name: '2 out of 5' }).getAttribute('aria-checked')).toBe(
      'true'
    )

    await user.click(screen.getByRole('radio', { name: '4 out of 5' }))
    expect(onValueChange).toHaveBeenCalledWith(4)
  })

  it('supports arrow, Home, and End keyboard changes', () => {
    const onValueChange = vi.fn()
    render(<Rating value={3} max={5} onValueChange={onValueChange} />)
    const selected = screen.getByRole('radio', { name: '3 out of 5' })

    fireEvent.keyDown(selected, { key: 'ArrowRight' })
    fireEvent.keyDown(selected, { key: 'Home' })
    fireEvent.keyDown(selected, { key: 'End' })

    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([4, 1, 5])
  })

  it('does not change when disabled or read-only', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(<Rating value={2} max={3} onValueChange={onValueChange} disabled />)

    await user.click(screen.getByRole('radio', { name: '3 out of 3' }))
    rerender(<Rating value={2} max={3} onValueChange={onValueChange} readOnly />)
    await user.click(screen.getByRole('radio', { name: '3 out of 3' }))

    expect(onValueChange).not.toHaveBeenCalled()
  })
})
