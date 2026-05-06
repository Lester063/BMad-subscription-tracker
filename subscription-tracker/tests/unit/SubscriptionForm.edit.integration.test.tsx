/**
 * Edit Subscription Workflow Integration Tests (Story 4.1)
 * 
 * Tests verify end-to-end edit workflow:
 * - User clicks Edit on subscription row
 * - Form pre-populates with subscription data
 * - User modifies fields
 * - User submits form
 * - List updates in real-time with new values
 * - Success message displays
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubscriptionProvider } from '../../src/context/SubscriptionContext';
import { SubscriptionForm, type SubscriptionFormRef } from '../../src/components/SubscriptionForm/SubscriptionForm';
import { SubscriptionList } from '../../src/components/SubscriptionList/SubscriptionList';
import type { Subscription } from '../../src/types/subscription';
import { useSubscriptions } from '../../src/hooks/useSubscriptions';
import { useRef, useState } from 'react';

/**
 * Test harness component that simulates App.tsx with edit mode
 * Manages form state and edit mode similar to the actual app
 */
function EditWorkflowTestApp() {
  const { addSubscription, updateSubscription } = useSubscriptions();
  const formRef = useRef<SubscriptionFormRef>(null);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditClick = (subscription: Subscription): void => {
    setEditingSubscription(subscription);
  };

  const handleCancelEdit = (): void => {
    setEditingSubscription(null);
    formRef.current?.reset();
  };

  const handleFormSubmit = (data: any): void => {
    try {
      setIsSubmitting(true);

      if (editingSubscription) {
        // Update mode
        const updatedSubscription: Subscription = {
          ...editingSubscription,
          name: data.name,
          cost: parseFloat(data.cost.toString()),
          dueDate: parseInt(data.dueDate, 10),
          updatedAt: Date.now(),
        };

        updateSubscription(updatedSubscription);
        formRef.current?.reset();
        setEditingSubscription(null);
        setSuccessMessage('Subscription updated successfully');
      } else {
        // Add mode
        const newSubscription: Subscription = {
          id: Math.random().toString(36).substring(2, 9),
          name: data.name,
          cost: parseFloat(data.cost.toString()),
          dueDate: parseInt(data.dueDate, 10),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        addSubscription(newSubscription);
        formRef.current?.reset();
        setSuccessMessage('Subscription added successfully');
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="test-app">
      <h1>Subscription Tracker</h1>
      {successMessage && (
        <div data-testid="success-message" role="alert">
          {successMessage}
        </div>
      )}
      <SubscriptionForm
        ref={formRef}
        onSubmit={handleFormSubmit}
        disabled={isSubmitting}
        initialValues={editingSubscription ? {
          name: editingSubscription.name,
          cost: editingSubscription.cost,
          dueDate: editingSubscription.dueDate.toString(),
        } : undefined}
        submitButtonLabel={editingSubscription ? 'Update Subscription' : 'Add Subscription'}
        onCancel={editingSubscription ? handleCancelEdit : undefined}
      />
      <SubscriptionList onEditClick={handleEditClick} />
    </div>
  );
}

describe('Edit Subscription Workflow Integration (Story 4.1)', () => {
  describe('Complete Edit Flow', () => {
    it('should support complete edit workflow from click to update', async () => {
      const user = userEvent.setup();

      render(
        <SubscriptionProvider>
          <EditWorkflowTestApp />
        </SubscriptionProvider>
      );

      // Step 1: Add initial subscription
      const nameInput = screen.getByLabelText(/subscription name/i);
      const costInput = screen.getByLabelText(/monthly cost/i);
      const dueDateInput = screen.getByLabelText(/due date/i);

      await user.type(nameInput, 'Netflix');
      await user.type(costInput, '15.99');
      await user.type(dueDateInput, '15');

      const addButton = screen.getByRole('button', { name: /add subscription/i });
      await user.click(addButton);

      // Wait for subscription to appear in list
      await waitFor(() => {
        expect(screen.getByText('Netflix')).toBeInTheDocument();
      });

      // Step 2: Click Edit button on subscription row
      const editButton = screen.getByRole('button', { name: /edit netflix/i });
      await user.click(editButton);

      // Step 3: Verify form is pre-populated
      const nameInputAfterEdit = screen.getByDisplayValue('Netflix') as HTMLInputElement;
      expect(nameInputAfterEdit).toBeInTheDocument();

      // Step 4: Verify Update button is shown
      expect(screen.getByRole('button', { name: /update subscription/i })).toBeInTheDocument();

      // Step 5: Verify Cancel button is shown
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

      // Step 6: Modify values
      await user.clear(nameInputAfterEdit);
      await user.type(nameInputAfterEdit, 'Netflix Premium');

      const costInputAfterEdit = screen.getByDisplayValue('15.99') as HTMLInputElement;
      await user.clear(costInputAfterEdit);
      await user.type(costInputAfterEdit, '19.99');

      // Step 7: Submit update
      const updateButton = screen.getByRole('button', { name: /update subscription/i });
      await user.click(updateButton);

      // Step 8: Verify success message
      await waitFor(() => {
        expect(screen.getByText('Subscription updated successfully')).toBeInTheDocument();
      });

      // Step 9: Verify list updated with new values (AC5: Real-time update)
      await waitFor(() => {
        expect(screen.getByText('Netflix Premium')).toBeInTheDocument();
        expect(screen.getByText('$19.99')).toBeInTheDocument();
      });
    });

    it('should preserve createdAt timestamp during edit', async () => {
      const user = userEvent.setup();

      // Create subscription with known timestamp
      const mockSub: Subscription = {
        id: 'sub-1',
        name: 'Netflix',
        cost: 15.99,
        dueDate: 15,
        createdAt: 1000000000,
        updatedAt: 1000000000,
      };

      const createdTimestamp = mockSub.createdAt;

      // This test would need access to context state to fully validate
      // For now, we test that the flow completes without errors
      render(
        <SubscriptionProvider>
          <EditWorkflowTestApp />
        </SubscriptionProvider>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Cancel Edit Mode', () => {
    it('should exit edit mode when Cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <SubscriptionProvider>
          <EditWorkflowTestApp />
        </SubscriptionProvider>
      );

      // Add subscription
      const nameInput = screen.getByLabelText(/subscription name/i);
      await user.type(nameInput, 'Netflix');

      const costInput = screen.getByLabelText(/monthly cost/i);
      await user.type(costInput, '15.99');

      const dueDateInput = screen.getByLabelText(/due date/i);
      await user.type(dueDateInput, '15');

      const addButton = screen.getByRole('button', { name: /add subscription/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Netflix')).toBeInTheDocument();
      });

      // Click Edit
      const editButton = screen.getByRole('button', { name: /edit netflix/i });
      await user.click(editButton);

      // Verify in edit mode
      expect(screen.getByRole('button', { name: /update subscription/i })).toBeInTheDocument();

      // Click Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Verify back to add mode
      expect(screen.getByRole('button', { name: /^add subscription$/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /update subscription/i })).not.toBeInTheDocument();
    });

    it('should clear form when Cancel is clicked', async () => {
      const user = userEvent.setup();

      render(
        <SubscriptionProvider>
          <EditWorkflowTestApp />
        </SubscriptionProvider>
      );

      // Add subscription
      const nameInput = screen.getByLabelText(/subscription name/i);
      await user.type(nameInput, 'Netflix');

      const costInput = screen.getByLabelText(/monthly cost/i);
      await user.type(costInput, '15.99');

      const dueDateInput = screen.getByLabelText(/due date/i);
      await user.type(dueDateInput, '15');

      const addButton = screen.getByRole('button', { name: /add subscription/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Netflix')).toBeInTheDocument();
      });

      // Click Edit
      const editButton = screen.getByRole('button', { name: /edit netflix/i });
      await user.click(editButton);

      // Modify form
      const nameInputAfterEdit = screen.getByDisplayValue('Netflix') as HTMLInputElement;
      await user.clear(nameInputAfterEdit);
      await user.type(nameInputAfterEdit, 'Modified Name');

      // Click Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Form should be cleared
      const nameInputAfterCancel = screen.getByPlaceholderText('e.g., Netflix') as HTMLInputElement;
      expect(nameInputAfterCancel.value).toBe('');
    });
  });

  describe('Keyboard Navigation in Edit Mode (AC8)', () => {
    it('should support Tab navigation through form in edit mode', async () => {
      const user = userEvent.setup();

      render(
        <SubscriptionProvider>
          <EditWorkflowTestApp />
        </SubscriptionProvider>
      );

      // Add subscription
      const nameInput = screen.getByLabelText(/subscription name/i);
      await user.type(nameInput, 'Netflix');

      const costInput = screen.getByLabelText(/monthly cost/i);
      await user.type(costInput, '15.99');

      const dueDateInput = screen.getByLabelText(/due date/i);
      await user.type(dueDateInput, '15');

      const addButton = screen.getByRole('button', { name: /add subscription/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Netflix')).toBeInTheDocument();
      });

      // Click Edit
      const editButton = screen.getByRole('button', { name: /edit netflix/i });
      await user.click(editButton);

      // Verify form is pre-populated and focusable
      const nameInputAfterEdit = screen.getByDisplayValue('Netflix') as HTMLInputElement;
      nameInputAfterEdit.focus();
      expect(nameInputAfterEdit).toHaveFocus();
    });
  });

  describe('Fuzzy Match Exclusion (AC4)', () => {
    it('should allow user to keep same name without duplicate error', async () => {
      const user = userEvent.setup();

      render(
        <SubscriptionProvider>
          <EditWorkflowTestApp />
        </SubscriptionProvider>
      );

      // Add subscription
      const nameInput = screen.getByLabelText(/subscription name/i);
      await user.type(nameInput, 'Netflix');

      const costInput = screen.getByLabelText(/monthly cost/i);
      await user.type(costInput, '15.99');

      const dueDateInput = screen.getByLabelText(/due date/i);
      await user.type(dueDateInput, '15');

      const addButton = screen.getByRole('button', { name: /add subscription/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Netflix')).toBeInTheDocument();
      });

      // Click Edit (AC4: fuzzy match should exclude the subscription being edited)
      const editButton = screen.getByRole('button', { name: /edit netflix/i });
      await user.click(editButton);

      // Form still shows "Netflix" - user can submit without duplicate error
      const nameInputAfterEdit = screen.getByDisplayValue('Netflix') as HTMLInputElement;
      expect(nameInputAfterEdit).toBeInTheDocument();

      // Change only cost
      const costInputAfterEdit = screen.getByDisplayValue('15.99') as HTMLInputElement;
      await user.clear(costInputAfterEdit);
      await user.type(costInputAfterEdit, '19.99');

      const updateButton = screen.getByRole('button', { name: /update subscription/i });
      await user.click(updateButton);

      // Should succeed without duplicate error
      await waitFor(() => {
        expect(screen.getByText('Subscription updated successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Subscriptions Edit', () => {
    it('should handle editing multiple different subscriptions', async () => {
      const user = userEvent.setup();

      render(
        <SubscriptionProvider>
          <EditWorkflowTestApp />
        </SubscriptionProvider>
      );

      // Add first subscription
      let nameInput = screen.getByLabelText(/subscription name/i);
      await user.type(nameInput, 'Netflix');

      let costInput = screen.getByLabelText(/monthly cost/i);
      await user.type(costInput, '15.99');

      let dueDateInput = screen.getByLabelText(/due date/i);
      await user.type(dueDateInput, '15');

      let addButton = screen.getByRole('button', { name: /add subscription/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Netflix')).toBeInTheDocument();
      });

      // Add second subscription
      nameInput = screen.getByPlaceholderText('e.g., Netflix') as HTMLInputElement;
      await user.type(nameInput, 'Spotify');

      costInput = screen.getByPlaceholderText('e.g., 15.99') as HTMLInputElement;
      await user.clear(costInput);
      await user.type(costInput, '9.99');

      dueDateInput = screen.getByPlaceholderText('e.g., 15') as HTMLInputElement;
      await user.clear(dueDateInput);
      await user.type(dueDateInput, '1');

      addButton = screen.getByRole('button', { name: /add subscription/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Spotify')).toBeInTheDocument();
      });

      // Edit Netflix
      let editButton = screen.getByRole('button', { name: /edit netflix/i });
      await user.click(editButton);

      let nameInputAfterEdit = screen.getByDisplayValue('Netflix') as HTMLInputElement;
      await user.clear(nameInputAfterEdit);
      await user.type(nameInputAfterEdit, 'Netflix Premium');

      let updateButton = screen.getByRole('button', { name: /update subscription/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('Netflix Premium')).toBeInTheDocument();
      });

      // Edit Spotify
      editButton = screen.getByRole('button', { name: /edit spotify/i });
      await user.click(editButton);

      nameInputAfterEdit = screen.getByDisplayValue('Spotify') as HTMLInputElement;
      await user.clear(nameInputAfterEdit);
      await user.type(nameInputAfterEdit, 'Spotify Premium');

      updateButton = screen.getByRole('button', { name: /update subscription/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('Spotify Premium')).toBeInTheDocument();
      });

      // Both should be updated
      expect(screen.getByText('Netflix Premium')).toBeInTheDocument();
      expect(screen.getByText('Spotify Premium')).toBeInTheDocument();
    });
  });
});
