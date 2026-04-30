/**
 * SubscriptionForm Component
 * 
 * A React Hook Form powered component for adding/editing subscriptions.
 * Supports both Add mode (Story 3.1) and Edit mode (Story 4.1).
 * 
 * Features:
 * - Name input (text, max 100 chars)
 * - Cost input (number, step 0.01)
 * - Due date input (day of month, 1-31)
 * - Submit and Clear buttons
 * - React Hook Form integration with Controller pattern
 * - CSS Modules with BEM naming
 * - WCAG 2.1 Level A accessibility
 */

import React from 'react';
import { useForm, Controller, type UseFormReturn } from 'react-hook-form';
import styles from './SubscriptionForm.module.css';

/**
 * Form data structure (subset of Subscription - without id/timestamps)
 * Timestamps and ID are generated on submission (Story 3.3)
 */
export interface FormData {
  name: string;
  cost: number;
  dueDate: string;
}

/**
 * Props for SubscriptionForm component
 * Supports both Add and Edit modes (Story 3.1 for Add, Story 4.1 for Edit)
 */
export interface SubscriptionFormProps {
  /**
   * Called when form is submitted with validated data.
   * Handler receives form data (name, cost, dueDate).
   * For Add mode (Story 3.1): receives FormData with empty values
   * For Edit mode (Story 4.1): receives FormData with existing values
   */
  onSubmit: (data: FormData) => void;

  /**
   * Initial form values (optional).
   * If not provided: form starts with empty fields (Add mode)
   * If provided: form pre-populates with these values (Edit mode in Story 4.1)
   */
  initialValues?: Partial<FormData>;

  /**
   * Label for submit button (optional).
   * Default: "Add Subscription" (Add mode)
   * Story 4.1 will pass: "Update Subscription" (Edit mode)
   */
  submitButtonLabel?: string;

  /**
   * Called when user clicks Cancel/Reset (optional).
   * For Add mode: clears form
   * For Edit mode: closes edit modal or returns to list view
   */
  onCancel?: () => void;
}

/**
 * SubscriptionForm component - React Hook Form powered subscription input
 * 
 * Renders a form for adding/editing subscriptions with:
 * - Name input (text)
 * - Cost input (number)
 * - Due date input (day of month, 1-31)
 * - Submit button
 * - Clear button
 * 
 * Validation and duplicate prevention handled in later stories.
 * This story focuses on form rendering and React Hook Form integration.
 * 
 * Usage for Add (Story 3.1):
 *   <SubscriptionForm onSubmit={handleAddSubscription} />
 * 
 * Usage for Edit (Story 4.1):
 *   <SubscriptionForm
 *     initialValues={existingSubscription}
 *     onSubmit={handleUpdateSubscription}
 *     submitButtonLabel="Update Subscription"
 *     onCancel={handleCloseEdit}
 *   />
 */
export function SubscriptionForm({
  onSubmit,
  initialValues,
  submitButtonLabel = 'Add Subscription',
  onCancel,
}: SubscriptionFormProps): JSX.Element {
  // React Hook Form setup
  const form: UseFormReturn<FormData> = useForm<FormData>({
    defaultValues: {
      name: initialValues?.name || '',
      cost: initialValues?.cost || 0,
      dueDate: initialValues?.dueDate || '',
    },
  });

  const { control, handleSubmit, reset } = form;

  const handleFormSubmit = (data: FormData): void => {
    onSubmit(data);
  };

  const handleReset = (): void => {
    reset();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit)} 
      className={styles.SubscriptionForm}
      aria-label="Subscription form"
    >
      {/* Name Field */}
      <div className={styles.SubscriptionForm__field}>
        <label 
          htmlFor="subscription-name" 
          className={styles.SubscriptionForm__label}
        >
          Subscription Name *
        </label>
        <Controller
          name="name"
          control={control}
          rules={{ required: true, maxLength: 100 }}
          render={({ field }) => (
            <input
              id="subscription-name"
              type="text"
              placeholder="e.g., Netflix"
              maxLength={100}
              className={styles.SubscriptionForm__input}
              aria-required="true"
              {...field}
            />
          )}
        />
      </div>

      {/* Cost Field */}
      <div className={styles.SubscriptionForm__field}>
        <label 
          htmlFor="subscription-cost" 
          className={styles.SubscriptionForm__label}
        >
          Monthly Cost ($) *
        </label>
        <Controller
          name="cost"
          control={control}
          rules={{ required: true, min: 0 }}
          render={({ field }) => (
            <input
              id="subscription-cost"
              type="number"
              placeholder="e.g., 15.99"
              step="0.01"
              min="0"
              className={styles.SubscriptionForm__input}
              aria-required="true"
              {...field}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                field.onChange(parseFloat(e.target.value) || 0);
              }}
            />
          )}
        />
      </div>

      {/* Due Date Field */}
      <div className={styles.SubscriptionForm__field}>
        <label 
          htmlFor="subscription-due-date" 
          className={styles.SubscriptionForm__label}
        >
          Due Date (Day of Month, 1-31) *
        </label>
        <Controller
          name="dueDate"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <input
              id="subscription-due-date"
              type="text"
              placeholder="e.g., 15"
              className={styles.SubscriptionForm__input}
              aria-required="true"
              {...field}
            />
          )}
        />
      </div>

      {/* Action Buttons */}
      <div className={styles.SubscriptionForm__actions}>
        <button
          type="submit"
          className={`${styles.SubscriptionForm__button} ${styles['SubscriptionForm__button--primary']}`}
        >
          {submitButtonLabel}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className={`${styles.SubscriptionForm__button} ${styles['SubscriptionForm__button--secondary']}`}
        >
          Clear
        </button>
      </div>
    </form>
  );
}

export default SubscriptionForm;