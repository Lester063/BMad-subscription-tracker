/**
 * SubscriptionList Accessibility Tests (Story 3.5)
 * 
 * Tests verify WCAG 2.1 Level A compliance for SubscriptionList component:
 * - AC4: List semantics and proper aria-label
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubscriptionList } from './SubscriptionList';
import { SubscriptionProvider } from '../../context/SubscriptionContext';
import type { Subscription } from '../../types/subscription';

// Test fixtures
const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    cost: 15.99,
    dueDate: 20,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '2',
    name: 'Spotify',
    cost: 11.99,
    dueDate: 5,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '3',
    name: 'AWS',
    cost: 50,
    dueDate: 15,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// Helper to render SubscriptionList with provider
function renderWithSubscriptions(subscriptions: Subscription[] = mockSubscriptions) {
  return render(
    <SubscriptionProvider initialSubscriptions={subscriptions}>
      <SubscriptionList />
    </SubscriptionProvider>
  );
}

describe('SubscriptionList Accessibility (Story 3.5)', () => {
  describe('AC4: List Semantics & Navigation', () => {
    it('should render as semantic ul element', () => {
      const { container } = renderWithSubscriptions();
      
      const list = container.querySelector('ul');
      expect(list).toBeInTheDocument();
    });

    it('should have aria-label on list container', () => {
      const { container } = renderWithSubscriptions();
      
      // aria-label is now on the container div, not the ul
      const listContainer = container.querySelector('[aria-label="Subscriptions"]');
      expect(listContainer).toBeInTheDocument();
    });

    it('should have aria-label="Subscriptions" on list container', () => {
      const { container } = renderWithSubscriptions();
      
      // Verify the container has the correct aria-label
      const listContainer = container.querySelector('[aria-label="Subscriptions"]');
      expect(listContainer).toHaveAttribute('aria-label', 'Subscriptions');
    });

    it('should render items as li elements', () => {
      const { container } = renderWithSubscriptions();
      
      const items = container.querySelectorAll('li');
      expect(items.length).toBeGreaterThan(0);
    });

    it('should render li for each subscription in list', () => {
      const { container } = renderWithSubscriptions();
      
      const items = container.querySelectorAll('li');
      expect(items.length).toBe(3); // 3 mock subscriptions
    });

    it('should make buttons in list items keyboard accessible', () => {
      renderWithSubscriptions();
      
      // All Edit/Delete buttons should be accessible
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      
      expect(editButtons.length).toBe(3);
      expect(deleteButtons.length).toBe(3);
    });

    it('should have aria-label on each Edit button', () => {
      renderWithSubscriptions();
      
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      editButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have aria-label on each Delete button', () => {
      renderWithSubscriptions();
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      deleteButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have subscription name in Edit button aria-label', () => {
      renderWithSubscriptions();
      
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      const labels = editButtons.map(btn => btn.getAttribute('aria-label'));
      
      expect(labels).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Netflix'),
          expect.stringContaining('Spotify'),
        ])
      );
    });

    it('should have subscription name in Delete button aria-label', () => {
      renderWithSubscriptions();
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      const labels = deleteButtons.map(btn => btn.getAttribute('aria-label'));
      
      expect(labels).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Netflix'),
          expect.stringContaining('Spotify'),
        ])
      );
    });
  });

  describe('AC1: No tabindex > 0', () => {
    it('should not have any elements with tabindex > 0', () => {
      const { container } = renderWithSubscriptions();
      
      const badTabindex = container.querySelectorAll('[tabindex]:not([tabindex="-1"]):not([tabindex="0"])');
      expect(badTabindex.length).toBe(0);
    });
  });

  describe('Empty State', () => {
    it('should show empty state message when no subscriptions', () => {
      render(
        <SubscriptionProvider initialSubscriptions={[]}>
          <SubscriptionList />
        </SubscriptionProvider>
      );
      
      // Verify component renders empty state without error
      expect(screen.getByText('No subscriptions yet.')).toBeInTheDocument();
    });

    it('should have aria-label on list container in empty state (AC4 compliance)', () => {
      const { container } = render(
        <SubscriptionProvider initialSubscriptions={[]}>
          <SubscriptionList />
        </SubscriptionProvider>
      );
      
      // Verify aria-label is present even when no subscriptions
      const container_element = container.querySelector('[aria-label="Subscriptions"]');
      expect(container_element).toBeInTheDocument();
      
      // Verify empty state message is still rendered
      expect(screen.getByText('No subscriptions yet.')).toBeInTheDocument();
    });

    it('should have aria-label on list container with subscriptions (AC4 compliance)', () => {
      const { container } = renderWithSubscriptions();
      
      // Verify aria-label is present on container
      const container_element = container.querySelector('[aria-label="Subscriptions"]');
      expect(container_element).toBeInTheDocument();
      
      // Verify ul is rendered inside container
      const list = container.querySelector('ul');
      expect(list).toBeInTheDocument();
    });
  });
});
