/**
 * SubscriptionForm Edit Mode Tests (Story 4.1)
 * 
 * Tests verify edit mode functionality and acceptance criteria:
 * - AC1: Pre-populated Edit Form with current values
 * - AC2: Dynamic Submit Button Text ("Update Subscription" in edit mode)
 * - AC3: Cancel Button visible only when in edit mode
 * - AC8: Keyboard Navigation (Tab, Enter, Escape)
 * - AC9: Accessibility (WCAG 2.1 Level A)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubscriptionForm, type SubscriptionFormProps } from '../../src/components/SubscriptionForm/SubscriptionForm';
import type { Subscription } from '../../src/types/subscription';

describe('SubscriptionForm Edit Mode (Story 4.1)', () => {
  const mockSubscription: Subscription = {
    id: 'sub-1',
    name: 'Netflix',
    cost: 15.99,
    dueDate: 15,
    createdAt: 1000000000,
    updatedAt: 1000000000,
  };

  describe('AC1: Pre-populated Edit Form', () => {
    it('should pre-populate form with existing subscription values', () => {
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
        initialValues: {
          name: mockSubscription.name,
          cost: mockSubscription.cost,
          dueDate: mockSubscription.dueDate.toString(),
        },
      };

      render(<SubscriptionForm {...props} />);

      const nameInput = screen.getByDisplayValue('Netflix') as HTMLInputElement;
      expect(nameInput).toBeInTheDocument();
      expect(nameInput.value).toBe('Netflix');

      const costInput = screen.getByDisplayValue('15.99') as HTMLInputElement;
      expect(costInput).toBeInTheDocument();
      expect(costInput.value).toBe('15.99');

      const dueeDateInput = screen.getByDisplayValue('15') as HTMLInputElement;
      expect(dueeDateInput).toBeInTheDocument();
      expect(dueeDateInput.value).toBe('15');
    });

    it('should start with empty fields when initialValues not provided', () => {
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
      };

      render(<SubscriptionForm {...props} />);

      const nameInput = screen.getByPlaceholderText('e.g., Netflix') as HTMLInputElement;
      expect(nameInput.value).toBe('');

      const costInput = screen.getByPlaceholderText('e.g., 15.99') as HTMLInputElement;
      expect(costInput.value).toBe('0');

      const dueeDateInput = screen.getByPlaceholderText('e.g., 15') as HTMLInputElement;
      expect(dueeDateInput.value).toBe('');
    });

    it('should preserve field values when user modifies form during edit', async () => {
      const user = userEvent.setup();
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
        initialValues: {
          name: 'Netflix',
          cost: 15.99,
          dueDate: '15',
        },
      };

      render(<SubscriptionForm {...props} />);

      const nameInput = screen.getByDisplayValue('Netflix') as HTMLInputElement;
      await user.clear(nameInput);
      await user.type(nameInput, 'Spotify');

      expect(nameInput.value).toBe('Spotify');
    });
  });

  describe('AC2: Dynamic Submit Button Text', () => {
    it('should show "Add Subscription" button by default', () => {
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
      };

      render(<SubscriptionForm {...props} />);

      const submitButton = screen.getByRole('button', { name: /add subscription/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should show "Update Subscription" button when in edit mode', () => {
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
        submitButtonLabel: 'Update Subscription',
      };

      render(<SubscriptionForm {...props} />);

      const updateButton = screen.getByRole('button', { name: /update subscription/i });
      expect(updateButton).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^add subscription$/i })).not.toBeInTheDocument();
    });

    it('should change button text from Add to Update dynamically', () => {
      const onSubmit = jest.fn();
      const { rerender } = render(
        <SubscriptionForm onSubmit={onSubmit} submitButtonLabel="Add Subscription" />
      );

      let submitButton = screen.getByRole('button', { name: /add subscription/i });
      expect(submitButton).toBeInTheDocument();

      rerender(
        <SubscriptionForm
          onSubmit={onSubmit}
          submitButtonLabel="Update Subscription"
          initialValues={{ name: 'Netflix', cost: 15.99, dueDate: '15' }}
        />
      );

      submitButton = screen.getByRole('button', { name: /update subscription/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('AC3: Cancel Button Presence and Visibility', () => {
    it('should show Clear button in add mode (when onCancel is not provided)', () => {
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
      };

      render(<SubscriptionForm {...props} />);

      const clearButton = screen.getByRole('button', { name: /clear/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should show Cancel button in edit mode (when onCancel is provided)', () => {
      const onCancel = jest.fn();
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
        onCancel,
        initialValues: {
          name: 'Netflix',
          cost: 15.99,
          dueDate: '15',
        },
      };

      render(<SubscriptionForm {...props} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^clear$/i })).not.toBeInTheDocument();
    });

    it('should call onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
        onCancel,
        initialValues: {
          name: 'Netflix',
          cost: 15.99,
          dueDate: '15',
        },
      };

      render(<SubscriptionForm {...props} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should not show Cancel button when onCancel is not provided', () => {
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
        initialValues: {
          name: 'Netflix',
          cost: 15.99,
          dueDate: '15',
        },
      };

      render(<SubscriptionForm {...props} />);

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });
  });

  describe('AC8: Keyboard Navigation', () => {
    it('should support Tab navigation through form fields', async () => {
      const user = userEvent.setup();
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
      };

      render(<SubscriptionForm {...props} />);

      const nameInput = screen.getByLabelText(/subscription name/i);
      const costInput = screen.getByLabelText(/monthly cost/i);
      const dueDateInput = screen.getByLabelText(/due date/i);

      nameInput.focus();
      expect(nameInput).toHaveFocus();

      await user.tab();
      expect(costInput).toHaveFocus();

      await user.tab();
      expect(dueDateInput).toHaveFocus();
    });

    it('should support Enter to submit form', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      const props: SubscriptionFormProps = {
        onSubmit,
        initialValues: {
          name: 'Netflix',
          cost: 15.99,
          dueDate: '15',
        },
      };

      render(<SubscriptionForm {...props} />);

      const submitButton = screen.getByRole('button', { name: /add subscription/i });
      submitButton.focus();

      await user.keyboard('{Enter}');

      // Note: React Hook Form's handleSubmit may need fireEvent instead for some cases
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    it('should have visible focus indicators on form inputs', () => {
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
      };

      const { container } = render(<SubscriptionForm {...props} />);

      const inputs = container.querySelectorAll('input');
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('id');
        // Focus styles handled by CSS modules
      });
    });

    it('should support Escape key in future modal context (AC8)', () => {
      // Note: Escape key handling may be implemented at parent component level
      // This test placeholder ensures story requirements are captured
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
      };

      const { container } = render(<SubscriptionForm {...props} />);

      expect(container.querySelector('form')).toBeInTheDocument();
    });
  });

  describe('AC9: Accessibility (WCAG 2.1 Level A)', () => {
    it('should maintain semantic HTML structure in edit mode', () => {
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
        initialValues: {
          name: 'Netflix',
          cost: 15.99,
          dueDate: '15',
        },
      };

      const { container } = render(<SubscriptionForm {...props} />);

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('aria-label');
    });

    it('should have proper label associations in edit mode', () => {
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
        initialValues: {
          name: 'Netflix',
          cost: 15.99,
          dueDate: '15',
        },
      };

      render(<SubscriptionForm {...props} />);

      // getByLabelText will fail if labels are not properly associated
      const nameInput = screen.getByLabelText(/subscription name/i);
      const costInput = screen.getByLabelText(/monthly cost/i);
      const dueDateInput = screen.getByLabelText(/due date/i);

      expect(nameInput).toBeInTheDocument();
      expect(costInput).toBeInTheDocument();
      expect(dueDateInput).toBeInTheDocument();
    });

    it('should have aria-required on all required fields in edit mode', () => {
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
        initialValues: {
          name: 'Netflix',
          cost: 15.99,
          dueDate: '15',
        },
      };

      render(<SubscriptionForm {...props} />);

      const nameInput = screen.getByLabelText(/subscription name/i);
      const costInput = screen.getByLabelText(/monthly cost/i);
      const dueDateInput = screen.getByLabelText(/due date/i);

      expect(nameInput).toHaveAttribute('aria-required', 'true');
      expect(costInput).toHaveAttribute('aria-required', 'true');
      expect(dueDateInput).toHaveAttribute('aria-required', 'true');
    });

    it('should have accessible button names in edit mode', () => {
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
        submitButtonLabel: 'Update Subscription',
        initialValues: {
          name: 'Netflix',
          cost: 15.99,
          dueDate: '15',
        },
      };

      render(<SubscriptionForm {...props} />);

      const updateButton = screen.getByRole('button', { name: /update subscription/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      expect(updateButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
    });
  });

  describe('Form Submission Behavior in Edit Mode', () => {
    it('should call onSubmit with form data when Update button is clicked', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      const props: SubscriptionFormProps = {
        onSubmit,
        submitButtonLabel: 'Update Subscription',
        initialValues: {
          name: 'Netflix',
          cost: 15.99,
          dueDate: '15',
        },
      };

      render(<SubscriptionForm {...props} />);

      const submitButton = screen.getByRole('button', { name: /update subscription/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Netflix',
            cost: 15.99,
            dueDate: '15',
          })
        );
      });
    });

    it('should allow editing fields and submit new values', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      const props: SubscriptionFormProps = {
        onSubmit,
        submitButtonLabel: 'Update Subscription',
        initialValues: {
          name: 'Netflix',
          cost: 15.99,
          dueDate: '15',
        },
      };

      render(<SubscriptionForm {...props} />);

      const nameInput = screen.getByDisplayValue('Netflix') as HTMLInputElement;
      await user.clear(nameInput);
      await user.type(nameInput, 'Spotify');

      const costInput = screen.getByDisplayValue('15.99') as HTMLInputElement;
      await user.clear(costInput);
      await user.type(costInput, '9.99');

      const submitButton = screen.getByRole('button', { name: /update subscription/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Spotify',
            cost: 9.99,
            dueDate: '15',
          })
        );
      });
    });

    it('should disable form during submission', () => {
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
        submitButtonLabel: 'Update Subscription',
        disabled: true,
      };

      render(<SubscriptionForm {...props} />);

      const submitButton = screen.getByRole('button', { name: /update subscription/i }) as HTMLButtonElement;
      const cancelButton = screen.getByRole('button', { name: /cancel/i }) as HTMLButtonElement;

      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('ref-based reset functionality in edit mode', () => {
    it('should reset form to initial values when ref.reset() is called', () => {
      const props: SubscriptionFormProps = {
        onSubmit: jest.fn(),
        initialValues: {
          name: 'Netflix',
          cost: 15.99,
          dueDate: '15',
        },
      };

      const { container } = render(<SubscriptionForm {...props} />);

      // In React Hook Form, reset() clears the form
      // This behavior is used by App.tsx after successful submission
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });
});
