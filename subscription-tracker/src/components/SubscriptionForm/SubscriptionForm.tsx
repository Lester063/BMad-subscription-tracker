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

import React, { forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller, type UseFormReturn, type FieldError } from 'react-hook-form';
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

  /**
   * Error message to display (optional).
   * Submission errors are passed from parent and displayed to user.
   * Story 4.1 AC10: Form displays user-friendly error messages
   */
  errorMessage?: string;

  /**
   * Disable form submission (optional).
   * Used to prevent double submissions while processing (Story 3.3: Rapid submission handling)
   */
  disabled?: boolean;
}

/**
 * Ref type for SubscriptionForm component
 * Allows parent component to programmatically reset the form
 * (Story 3.3: Reset form after successful submission)
 */
export interface SubscriptionFormRef {
  /**
   * Reset all form fields to their default values
   */
  reset: () => void;
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
 * Supports ref-based reset for Story 3.3 (form clearing after submission).
 * 
 * Usage for Add (Story 3.1):
 *   const formRef = useRef<SubscriptionFormRef>(null);
 *   <SubscriptionForm ref={formRef} onSubmit={handleAddSubscription} />
 *   // After submission: formRef.current?.reset();
 * 
 * Usage for Edit (Story 4.1):
 *   <SubscriptionForm
 *     initialValues={existingSubscription}
 *     onSubmit={handleUpdateSubscription}
 *     submitButtonLabel="Update Subscription"
 *     onCancel={handleCloseEdit}
 *   />
 */
export const SubscriptionForm = forwardRef<SubscriptionFormRef, SubscriptionFormProps>(
  (
    {
      onSubmit,
      initialValues,
      submitButtonLabel = 'Add Subscription',
      onCancel,
      errorMessage,
      disabled = false,
    },
    ref
  ) => {
    // React Hook Form setup
    const form: UseFormReturn<FormData> = useForm<FormData>({
      mode: 'onChange',
      defaultValues: {
        name: initialValues?.name || '',
        cost: initialValues?.cost || 0,
        dueDate: initialValues?.dueDate || '',
      },
    });

    const { control, handleSubmit, reset, formState } = form;
    const { errors } = formState;

    // Expose reset function to parent component via ref (Story 3.3)
    useImperativeHandle(ref, () => ({
      reset: () => reset(),
    }));

    const handleFormSubmit = (data: FormData): void => {
      onSubmit(data);
    };

    const handleReset = (): void => {
      reset();
      if (onCancel) {
        onCancel();
      }
    };

  // Helper to render field error message (Story 4.1 AC10)
  const renderFieldError = (error: FieldError | undefined): React.ReactNode => {
    if (!error) return null;
    if (error.type === 'required') return 'This field is required';
    if (error.type === 'maxLength') return 'Name must be 100 characters or less';
    if (error.type === 'min') return 'Cost must be greater than or equal to 0';
    return error.message || 'Invalid input';
  };

  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit)} 
      className={styles.SubscriptionForm}
      aria-label="Subscription form"
    >
      {/* Submission Error Display (Story 4.1 AC10) */}
      {errorMessage && (
        <div 
          className={styles.SubscriptionForm__error}
          role="alert"
          aria-live="polite"
          data-testid="form-error-message"
        >
          {errorMessage}
        </div>
      )}

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
          rules={{ required: 'Subscription name is required', maxLength: 100 }}
          render={({ field }) => (
            <input
              id="subscription-name"
              type="text"
              placeholder="e.g., Netflix"
              maxLength={100}
              className={`${styles.SubscriptionForm__input} ${errors.name ? styles['SubscriptionForm__input--error'] : ''}`}
              data-testid="subscription-name-input"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              {...field}
            />
          )}
        />
        {errors.name && (
          <span 
            id="name-error" 
            className={styles.SubscriptionForm__field_error}
            role="alert"
          >
            {renderFieldError(errors.name)}
          </span>
        )}
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
          rules={{ required: 'Monthly cost is required', min: 0 }}
          render={({ field }) => (
            <input
              id="subscription-cost"
              type="number"
              placeholder="e.g., 15.99"
              step="0.01"
              min="0"
              className={`${styles.SubscriptionForm__input} ${errors.cost ? styles['SubscriptionForm__input--error'] : ''}`}
              data-testid="subscription-cost-input"
              aria-required="true"
              aria-invalid={!!errors.cost}
              aria-describedby={errors.cost ? 'cost-error' : undefined}
              {...field}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                field.onChange(parseFloat(e.target.value) || 0);
              }}
            />
          )}
        />
        {errors.cost && (
          <span 
            id="cost-error" 
            className={styles.SubscriptionForm__field_error}
            role="alert"
          >
            {renderFieldError(errors.cost)}
          </span>
        )}
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
          rules={{ required: 'Due date is required' }}
          render={({ field }) => (
            <input
              id="subscription-due-date"
              type="text"
              placeholder="e.g., 15"
              className={`${styles.SubscriptionForm__input} ${errors.dueDate ? styles['SubscriptionForm__input--error'] : ''}`}
              data-testid="subscription-duedate-input"
              aria-required="true"
              aria-invalid={!!errors.dueDate}
              aria-describedby={errors.dueDate ? 'duedate-error' : undefined}
              {...field}
            />
          )}
        />
        {errors.dueDate && (
          <span 
            id="duedate-error" 
            className={styles.SubscriptionForm__field_error}
            role="alert"
          >
            {renderFieldError(errors.dueDate)}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className={styles.SubscriptionForm__actions}>
        <button
          type="submit"
          disabled={disabled}
          data-testid="add-subscription-button"
          className={`${styles.SubscriptionForm__button} ${styles['SubscriptionForm__button--primary']}`}
        >
          {submitButtonLabel}
        </button>
        {/* Story 4.1: AC3 - Show Cancel button only in edit mode, Clear in add mode */}
        <button
          type="button"
          onClick={handleReset}
          disabled={disabled}
          data-testid={onCancel ? "cancel-button" : "clear-button"}
          className={`${styles.SubscriptionForm__button} ${styles['SubscriptionForm__button--secondary']}`}
        >
          {onCancel ? 'Cancel' : 'Clear'}
        </button>
      </div>
    </form>
  );
});

export default SubscriptionForm;