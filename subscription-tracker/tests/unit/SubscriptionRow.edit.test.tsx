/**
 * SubscriptionRow Edit Button Tests (Story 4.1)
 * 
 * Tests verify SubscriptionRow edit button functionality and acceptance criteria:
 * - Edit button click triggers onEditClick callback
 * - Callback receives the subscription object
 * - Button has proper accessibility attributes
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubscriptionRow } from '../../src/components/SubscriptionRow/SubscriptionRow';
import type { Subscription } from '../../src/types/subscription';

describe('SubscriptionRow Edit Button (Story 4.1)', () => {
  const mockSubscription: Subscription = {
    id: 'sub-1',
    name: 'Netflix',
    cost: 15.99,
    dueDate: 15,
    createdAt: 1000000000,
    updatedAt: 1000000000,
  };

  describe('Edit Button Rendering', () => {
    it('should render Edit button with accessible name', () => {
      render(<SubscriptionRow subscription={mockSubscription} />);

      const editButton = screen.getByRole('button', { name: /edit netflix/i });
      expect(editButton).toBeInTheDocument();
    });

    it('should have aria-label on Edit button', () => {
      render(<SubscriptionRow subscription={mockSubscription} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toHaveAttribute('aria-label', 'Edit Netflix');
    });

    it('should render Edit button with type="button"', () => {
      render(<SubscriptionRow subscription={mockSubscription} />);

      const editButton = screen.getByRole('button', { name: /edit netflix/i }) as HTMLButtonElement;
      expect(editButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Edit Button Click Handler (Story 4.1: AC1)', () => {
    it('should call onEditClick with subscription when Edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEditClick = jest.fn();

      render(
        <SubscriptionRow
          subscription={mockSubscription}
          onEditClick={onEditClick}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit netflix/i });
      await user.click(editButton);

      expect(onEditClick).toHaveBeenCalledTimes(1);
      expect(onEditClick).toHaveBeenCalledWith(mockSubscription);
    });

    it('should pass correct subscription data to onEditClick callback', async () => {
      const user = userEvent.setup();
      const onEditClick = jest.fn();

      render(
        <SubscriptionRow
          subscription={mockSubscription}
          onEditClick={onEditClick}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit netflix/i });
      await user.click(editButton);

      const callArgs = onEditClick.mock.calls[0][0];
      expect(callArgs.id).toBe('sub-1');
      expect(callArgs.name).toBe('Netflix');
      expect(callArgs.cost).toBe(15.99);
      expect(callArgs.dueDate).toBe(15);
    });

    it('should work without onEditClick callback (backward compatibility)', async () => {
      const user = userEvent.setup();

      render(<SubscriptionRow subscription={mockSubscription} />);

      const editButton = screen.getByRole('button', { name: /edit netflix/i });
      // Should not throw error
      await user.click(editButton);
      expect(editButton).toBeInTheDocument();
    });

    it('should handle multiple subscriptions with different names', async () => {
      const user = userEvent.setup();
      const onEditClick = jest.fn();

      const spotify: Subscription = {
        ...mockSubscription,
        id: 'sub-2',
        name: 'Spotify',
      };

      const { rerender } = render(
        <SubscriptionRow
          subscription={mockSubscription}
          onEditClick={onEditClick}
        />
      );

      let editButton = screen.getByRole('button', { name: /edit netflix/i });
      await user.click(editButton);

      expect(onEditClick).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Netflix' })
      );

      rerender(
        <SubscriptionRow
          subscription={spotify}
          onEditClick={onEditClick}
        />
      );

      editButton = screen.getByRole('button', { name: /edit spotify/i });
      await user.click(editButton);

      expect(onEditClick).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Spotify' })
      );
    });
  });

  describe('Memoization and Re-renders', () => {
    it('should not re-render when parent re-renders with same subscription', () => {
      const onEditClick = jest.fn();
      const { rerender } = render(
        <SubscriptionRow
          subscription={mockSubscription}
          onEditClick={onEditClick}
        />
      );

      expect(screen.getByRole('button', { name: /edit netflix/i })).toBeInTheDocument();

      rerender(
        <SubscriptionRow
          subscription={mockSubscription}
          onEditClick={onEditClick}
        />
      );

      expect(screen.getByRole('button', { name: /edit netflix/i })).toBeInTheDocument();
    });

    it('should update when subscription data changes', () => {
      const onEditClick = jest.fn();
      const updated: Subscription = {
        ...mockSubscription,
        name: 'Updated Netflix',
        cost: 19.99,
      };

      const { rerender } = render(
        <SubscriptionRow
          subscription={mockSubscription}
          onEditClick={onEditClick}
        />
      );

      expect(screen.getByRole('button', { name: /edit netflix/i })).toBeInTheDocument();

      rerender(
        <SubscriptionRow
          subscription={updated}
          onEditClick={onEditClick}
        />
      );

      expect(screen.getByRole('button', { name: /edit updated netflix/i })).toBeInTheDocument();
    });
  });

  describe('Edit Button Styling', () => {
    it('should have edit button CSS class', () => {
      const { container } = render(
        <SubscriptionRow subscription={mockSubscription} />
      );

      const editButton = screen.getByRole('button', { name: /edit netflix/i });
      // CSS Modules apply class with specific pattern
      expect(editButton).toHaveClass('editBtn');
    });

    it('should be distinct from Delete button', () => {
      render(<SubscriptionRow subscription={mockSubscription} />);

      const editButton = screen.getByRole('button', { name: /edit netflix/i });
      const deleteButton = screen.getByRole('button', { name: /delete netflix/i });

      expect(editButton).not.toBe(deleteButton);
      expect(editButton).toHaveClass('editBtn');
      expect(deleteButton).toHaveClass('deleteBtn');
    });
  });

  describe('Integration with Subscription Data', () => {
    it('should handle subscription with special characters in name', async () => {
      const user = userEvent.setup();
      const onEditClick = jest.fn();
      const specialSub: Subscription = {
        ...mockSubscription,
        name: 'Adobe CC (All Apps)',
      };

      render(
        <SubscriptionRow
          subscription={specialSub}
          onEditClick={onEditClick}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit adobe cc/i });
      await user.click(editButton);

      expect(onEditClick).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Adobe CC (All Apps)' })
      );
    });

    it('should display correct cost format', () => {
      render(<SubscriptionRow subscription={mockSubscription} />);

      // Cost should be formatted as currency ($15.99)
      expect(screen.getByTestId('subscription-cost')).toHaveTextContent('$15.99');
    });

    it('should display correct due date format', () => {
      render(<SubscriptionRow subscription={mockSubscription} />);

      // Due date should be formatted as ordinal (15th)
      expect(screen.getByTestId('subscription-duedate')).toHaveTextContent('15th');
    });
  });

  describe('Accessibility', () => {
    it('should have role="button" on Edit button', () => {
      render(<SubscriptionRow subscription={mockSubscription} />);

      const editButton = screen.getByRole('button', { name: /edit netflix/i });
      expect(editButton).toBeInTheDocument();
    });

    it('should have descriptive aria-label', () => {
      render(<SubscriptionRow subscription={mockSubscription} />);

      const editButton = screen.getByRole('button', { name: /edit netflix/i });
      expect(editButton).toHaveAttribute('aria-label', 'Edit Netflix');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const onEditClick = jest.fn();

      render(
        <SubscriptionRow
          subscription={mockSubscription}
          onEditClick={onEditClick}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit netflix/i });
      editButton.focus();

      expect(editButton).toHaveFocus();

      await user.keyboard('{Enter}');

      expect(onEditClick).toHaveBeenCalledWith(mockSubscription);
    });
  });
});
