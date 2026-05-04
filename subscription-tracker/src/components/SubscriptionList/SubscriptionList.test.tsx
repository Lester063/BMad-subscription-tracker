import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubscriptionList } from './SubscriptionList';
import { SubscriptionProvider } from '../../context/SubscriptionContext';
import type { Subscription } from '../../types/subscription';

// Helper function to render SubscriptionList with initial subscriptions
function renderWithSubscriptions(subscriptions: Subscription[]) {
  return render(
    <SubscriptionProvider initialSubscriptions={subscriptions}>
      <SubscriptionList />
    </SubscriptionProvider>
  );
}

describe('SubscriptionList', () => {
  it('renders empty state when no subscriptions exist', () => {
    render(
      <SubscriptionProvider>
        <SubscriptionList />
      </SubscriptionProvider>
    );
    
    expect(screen.getByText('No subscriptions yet.')).toBeDefined();
  });

  describe('Sorting by dueDate (Story 3.4)', () => {
    it('should sort subscriptions by dueDate in ascending order', () => {
      const subscriptions: Subscription[] = [
        { id: '1', name: 'Netflix', cost: 15.99, dueDate: 20, createdAt: 1000, updatedAt: 1000 },
        { id: '2', name: 'Gym', cost: 50, dueDate: 5, createdAt: 2000, updatedAt: 2000 },
        { id: '3', name: 'AWS', cost: 100, dueDate: 15, createdAt: 3000, updatedAt: 3000 },
      ];

      renderWithSubscriptions(subscriptions);

      const rows = screen.getAllByTestId('subscription-item');
      expect(rows).toHaveLength(3);
      
      // Verify sort order: Gym (5) → AWS (15) → Netflix (20)
      expect(rows[0].textContent).toContain('Gym');
      expect(rows[1].textContent).toContain('AWS');
      expect(rows[2].textContent).toContain('Netflix');
    });

    it('should maintain insertion order for subscriptions with same dueDate', () => {
      const subscriptions: Subscription[] = [
        { id: '1', name: 'Netflix', cost: 15.99, dueDate: 15, createdAt: 1000, updatedAt: 1000 },
        { id: '2', name: 'Hulu', cost: 12.99, dueDate: 15, createdAt: 2000, updatedAt: 2000 },
        { id: '3', name: 'Disney', cost: 13.99, dueDate: 15, createdAt: 3000, updatedAt: 3000 },
      ];

      renderWithSubscriptions(subscriptions);

      const rows = screen.getAllByTestId('subscription-item');
      expect(rows).toHaveLength(3);
      
      // All have same dueDate (15), so insertion order should be preserved (stable sort)
      expect(rows[0].textContent).toContain('Netflix');
      expect(rows[1].textContent).toContain('Hulu');
      expect(rows[2].textContent).toContain('Disney');
    });

    it('should sort single subscription (edge case)', () => {
      const subscriptions: Subscription[] = [
        { id: '1', name: 'Netflix', cost: 15.99, dueDate: 20, createdAt: 1000, updatedAt: 1000 },
      ];

      renderWithSubscriptions(subscriptions);

      const rows = screen.getAllByTestId('subscription-item');
      expect(rows).toHaveLength(1);
      expect(rows[0].textContent).toContain('Netflix');
    });

    it('should handle subscriptions with all due dates 1-31', () => {
      const subscriptions: Subscription[] = [
        { id: '1', name: 'Sub1', cost: 10, dueDate: 31, createdAt: 1000, updatedAt: 1000 },
        { id: '2', name: 'Sub2', cost: 10, dueDate: 1, createdAt: 2000, updatedAt: 2000 },
        { id: '3', name: 'Sub3', cost: 10, dueDate: 15, createdAt: 3000, updatedAt: 3000 },
      ];

      renderWithSubscriptions(subscriptions);

      const rows = screen.getAllByTestId('subscription-item');
      expect(rows).toHaveLength(3);
      
      // Should be sorted: 1 → 15 → 31
      expect(rows[0].textContent).toContain('Sub2'); // dueDate: 1
      expect(rows[1].textContent).toContain('Sub3'); // dueDate: 15
      expect(rows[2].textContent).toContain('Sub1'); // dueDate: 31
    });

    it('should sort after list is rendered (verifies immutability)', () => {
      const subscriptions: Subscription[] = [
        { id: '1', name: 'Z_Sub', cost: 10, dueDate: 20, createdAt: 1000, updatedAt: 1000 },
        { id: '2', name: 'A_Sub', cost: 10, dueDate: 5, createdAt: 2000, updatedAt: 2000 },
      ];

      renderWithSubscriptions(subscriptions);

      // Verify original array is not mutated (still in add order)
      expect(subscriptions[0].name).toBe('Z_Sub');
      expect(subscriptions[1].name).toBe('A_Sub');

      // But rendered list is sorted
      const rows = screen.getAllByTestId('subscription-item');
      expect(rows[0].textContent).toContain('A_Sub'); // dueDate: 5
      expect(rows[1].textContent).toContain('Z_Sub'); // dueDate: 20
    });
  });
});