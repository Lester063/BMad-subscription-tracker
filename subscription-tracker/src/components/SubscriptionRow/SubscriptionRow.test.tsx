/**
 * SubscriptionRow Component Tests
 * Story 4.2: Delete button and onDeleteClick callback
 * 
 * Tests cover all acceptance criteria for Story 4.2:
 * - AC1: Delete button visible on each subscription row
 * - AC2: Delete button triggers callback
 * - AC9: aria-label for accessibility
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import type { Subscription } from '../../types/subscription'
import { SubscriptionRow } from './SubscriptionRow'

// Mock subscription for testing
const mockSubscription: Subscription = {
  id: 'sub-netflix-001',
  name: 'Netflix',
  cost: 15.99,
  dueDate: 5,
  createdAt: Date.now() - 1000000,
  updatedAt: Date.now(),
}

describe('SubscriptionRow', () => {
  describe('Delete Button', () => {
    test('[AC1] Delete button is visible', () => {
      render(<SubscriptionRow subscription={mockSubscription} />)
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(deleteButton).toBeInTheDocument()
      expect(deleteButton).toBeVisible()
    })

    test('[AC2] Delete button calls onDeleteClick callback when clicked', () => {
      const onDeleteClick = vi.fn()
      render(
        <SubscriptionRow subscription={mockSubscription} onDeleteClick={onDeleteClick} />
      )
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)
      expect(onDeleteClick).toHaveBeenCalledOnce()
      expect(onDeleteClick).toHaveBeenCalledWith(mockSubscription)
    })

    test('[AC9] Delete button has aria-label for accessibility', () => {
      render(<SubscriptionRow subscription={mockSubscription} />)
      const deleteButton = screen.getByLabelText(`Delete ${mockSubscription.name}`)
      expect(deleteButton).toBeInTheDocument()
    })

    test('Delete button does not throw error if onDeleteClick is not provided', () => {
      render(<SubscriptionRow subscription={mockSubscription} />)
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(() => fireEvent.click(deleteButton)).not.toThrow()
    })

    test('Delete button is type="button" (not submit)', () => {
      render(<SubscriptionRow subscription={mockSubscription} />)
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(deleteButton).toHaveAttribute('type', 'button')
    })

    test('Delete button passes correct subscription object to callback', () => {
      const onDeleteClick = vi.fn()
      const customSubscription: Subscription = {
        ...mockSubscription,
        id: 'sub-hulu-002',
        name: 'Hulu',
        cost: 8.99,
      }
      render(
        <SubscriptionRow subscription={customSubscription} onDeleteClick={onDeleteClick} />
      )
      const deleteButton = screen.getByLabelText(`Delete ${customSubscription.name}`)
      fireEvent.click(deleteButton)
      expect(onDeleteClick).toHaveBeenCalledWith(customSubscription)
    })
  })

  describe('Component Rendering', () => {
    test('renders subscription name', () => {
      render(<SubscriptionRow subscription={mockSubscription} />)
      expect(screen.getByText(mockSubscription.name)).toBeInTheDocument()
    })

    test('renders subscription cost in currency format', () => {
      render(<SubscriptionRow subscription={mockSubscription} />)
      expect(screen.getByText(/\$15\.99/)).toBeInTheDocument()
    })

    test('renders subscription due date with ordinal suffix', () => {
      render(<SubscriptionRow subscription={mockSubscription} />)
      expect(screen.getByText(/Due: 5th/)).toBeInTheDocument()
    })

    test('renders Edit button', () => {
      render(<SubscriptionRow subscription={mockSubscription} />)
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    test('renders both Edit and Delete buttons', () => {
      render(<SubscriptionRow subscription={mockSubscription} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
      expect(buttons[0]).toHaveTextContent('Edit')
      expect(buttons[1]).toHaveTextContent('Delete')
    })
  })

  describe('Edit Button', () => {
    test('Edit button calls onEditClick callback when clicked', () => {
      const onEditClick = vi.fn()
      render(
        <SubscriptionRow subscription={mockSubscription} onEditClick={onEditClick} />
      )
      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)
      expect(onEditClick).toHaveBeenCalledOnce()
      expect(onEditClick).toHaveBeenCalledWith(mockSubscription)
    })

    test('Edit and Delete buttons both work independently', () => {
      const onEditClick = vi.fn()
      const onDeleteClick = vi.fn()
      render(
        <SubscriptionRow
          subscription={mockSubscription}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      )
      const editButton = screen.getByRole('button', { name: /edit/i })
      const deleteButton = screen.getByRole('button', { name: /delete/i })

      fireEvent.click(editButton)
      expect(onEditClick).toHaveBeenCalledOnce()
      expect(onDeleteClick).not.toHaveBeenCalled()

      fireEvent.click(deleteButton)
      expect(onDeleteClick).toHaveBeenCalledOnce()
      expect(onEditClick).toHaveBeenCalledOnce() // Still 1 from edit click
    })
  })

  describe('Data Validation', () => {
    test('handles subscription with negative cost', () => {
      const invalidSubscription: Subscription = {
        ...mockSubscription,
        cost: -5.99,
      }
      render(<SubscriptionRow subscription={invalidSubscription} />)
      expect(screen.getByText(mockSubscription.name)).toBeInTheDocument()
    })

    test('handles subscription with special characters in name', () => {
      const specialSubscription: Subscription = {
        ...mockSubscription,
        name: "Bob's Streaming & Entertainment",
      }
      render(<SubscriptionRow subscription={specialSubscription} />)
      expect(screen.getByText(specialSubscription.name)).toBeInTheDocument()
    })

    test('returns null for invalid subscription (missing id)', () => {
      const invalidSubscription = {
        name: 'Netflix',
        cost: 15.99,
        dueDate: 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as Subscription

      const { container } = render(<SubscriptionRow subscription={invalidSubscription} />)
      expect(container.firstChild).toBeNull()
    })

    test('returns null for invalid subscription (missing name)', () => {
      const invalidSubscription = {
        id: 'sub-1',
        cost: 15.99,
        dueDate: 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as Subscription

      const { container } = render(<SubscriptionRow subscription={invalidSubscription} />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Data Attributes', () => {
    test('renders with data-testid for testing', () => {
      render(<SubscriptionRow subscription={mockSubscription} />)
      expect(screen.getByTestId('subscription-item')).toBeInTheDocument()
      expect(screen.getByTestId('subscription-name')).toBeInTheDocument()
      expect(screen.getByTestId('subscription-cost')).toBeInTheDocument()
      expect(screen.getByTestId('subscription-duedate')).toBeInTheDocument()
    })
  })
})
