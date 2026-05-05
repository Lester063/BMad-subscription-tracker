/**
 * SubscriptionForm Accessibility Tests (Story 3.5)
 * 
 * Tests verify WCAG 2.1 Level A compliance for SubscriptionForm component:
 * - AC2: Form labels properly associated with inputs
 * - AC7: Semantic HTML and ARIA labels
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubscriptionForm, type SubscriptionFormProps } from './SubscriptionForm';

describe('SubscriptionForm Accessibility (Story 3.5)', () => {
  const defaultProps: SubscriptionFormProps = {
    onSubmit: vi.fn(),
  };

  describe('AC2: Form Labels Properly Associated', () => {
    it('should have label for name input with htmlFor association', () => {
      render(<SubscriptionForm {...defaultProps} />);
      
      // AC2: getByLabelText will fail if label is not properly associated
      const nameInput = screen.getByLabelText(/subscription name/i);
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute('id', 'subscription-name');
    });

    it('should have label for cost input with htmlFor association', () => {
      render(<SubscriptionForm {...defaultProps} />);
      
      const costInput = screen.getByLabelText(/monthly cost/i);
      expect(costInput).toBeInTheDocument();
      expect(costInput).toHaveAttribute('id', 'subscription-cost');
    });

    it('should have label for dueDate input with htmlFor association', () => {
      render(<SubscriptionForm {...defaultProps} />);
      
      const dueeDateInput = screen.getByLabelText(/due date/i);
      expect(dueeDateInput).toBeInTheDocument();
      expect(dueeDateInput).toHaveAttribute('id', 'subscription-due-date');
    });

    it('should mark required fields with aria-required="true"', () => {
      render(<SubscriptionForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/subscription name/i) as HTMLInputElement;
      const costInput = screen.getByLabelText(/monthly cost/i) as HTMLInputElement;
      const dueDateInput = screen.getByLabelText(/due date/i) as HTMLInputElement;
      
      expect(nameInput).toHaveAttribute('aria-required', 'true');
      expect(costInput).toHaveAttribute('aria-required', 'true');
      expect(dueDateInput).toHaveAttribute('aria-required', 'true');
    });

    it('should include required indicator (*) in labels', () => {
      render(<SubscriptionForm {...defaultProps} />);
      
      const labels = screen.getAllByText(/\*/);
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe('AC3: Buttons Have Accessible Names', () => {
    it('should have descriptive submit button name', () => {
      render(<SubscriptionForm {...defaultProps} submitButtonLabel="Add Subscription" />);
      
      const submitButton = screen.getByRole('button', { name: /add subscription/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should support custom submit button label', () => {
      render(<SubscriptionForm {...defaultProps} submitButtonLabel="Update Subscription" />);
      
      const updateButton = screen.getByRole('button', { name: /update subscription/i });
      expect(updateButton).toBeInTheDocument();
    });

    it('should have clear button with accessible name', () => {
      render(<SubscriptionForm {...defaultProps} />);
      
      const clearButton = screen.getByRole('button', { name: /clear/i });
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('AC7: Semantic HTML & ARIA Labels', () => {
    it('should render as semantic form element', () => {
      const { container } = render(<SubscriptionForm {...defaultProps} />);
      
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have aria-label on form', () => {
      const { container } = render(<SubscriptionForm {...defaultProps} />);
      
      const form = container.querySelector('form');
      expect(form).toHaveAttribute('aria-label');
    });

    it('should have proper label elements for all inputs', () => {
      const { container } = render(<SubscriptionForm {...defaultProps} />);
      
      const labels = container.querySelectorAll('label');
      expect(labels.length).toBeGreaterThanOrEqual(3); // At least 3 labels
      
      labels.forEach(label => {
        // Note: DOM attribute name is 'for', not 'htmlFor' (htmlFor is React/JSX)
        expect(label).toHaveAttribute('for');
      });
    });
  });

  describe('AC6: Focus Management', () => {
    it('should render form with input fields that can receive focus', () => {
      const { container } = render(<SubscriptionForm {...defaultProps} />);
      
      const inputs = container.querySelectorAll('input');
      expect(inputs.length).toBeGreaterThanOrEqual(3);
      
      inputs.forEach(input => {
        expect(input).toHaveAttribute('id');
      });
    });

    it('should render buttons that can receive focus', () => {
      render(<SubscriptionForm {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('AC1: No Elements with tabindex > 0', () => {
    it('should not have any elements with tabindex > 0', () => {
      const { container } = render(<SubscriptionForm {...defaultProps} />);
      
      const elementsWithBadTabindex = container.querySelectorAll('[tabindex]:not([tabindex="-1"]):not([tabindex="0"])');
      expect(elementsWithBadTabindex.length).toBe(0);
    });
  });
});
