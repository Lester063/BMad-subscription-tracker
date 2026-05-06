import { useRef, useState, useEffect } from 'react'
import { SubscriptionProvider } from './context/SubscriptionContext'
import { SubscriptionForm, type FormData, type SubscriptionFormRef } from './components/SubscriptionForm/SubscriptionForm'
import { SubscriptionList } from './components/SubscriptionList/SubscriptionList'
import { useSubscriptions } from './hooks/useSubscriptions'
import type { Subscription } from './types/subscription'
import './App.css'

/**
 * Generate a UUID v4 identifier for new subscriptions
 * Uses native crypto.randomUUID() with fallback to Math.random()
 * 
 * @returns UUID string
 */
function generateUUID(): string {
  // Try native crypto.randomUUID() first (supported in modern browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  
  // Fallback for environments without crypto.randomUUID()
  return Math.random().toString(36).substring(2, 9) + '-' +
         Math.random().toString(36).substring(2, 9) + '-' +
         Math.random().toString(36).substring(2, 9) + '-' +
         Math.random().toString(36).substring(2, 9)
}

/**
 * Inner component that handles form submission logic
 * Uses hooks to access useSubscriptions context
 * 
 * Story 4.1: Supports both Add and Edit modes
 * - Story 3.3: Add mode - creates new subscription with UUID and timestamps
 * - Story 4.1: Edit mode - updates existing subscription with new values, preserving createdAt
 */
function AppContent() {
  const { addSubscription, updateSubscription } = useSubscriptions()
  const formRef = useRef<SubscriptionFormRef>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

  /**
   * Handle edit button click on SubscriptionRow (Story 4.1: AC1)
   * Sets the form into edit mode with the subscription's current values
   */
  const handleEditClick = (subscription: Subscription): void => {
    setEditingSubscription(subscription)
  }

  /**
   * Handle cancel button in form (Story 4.1: AC3)
   * Exits edit mode and clears form
   */
  const handleCancelEdit = (): void => {
    setEditingSubscription(null)
    formRef.current?.reset()
  }

  /**
   * Handle form submission for both Add (Story 3.3) and Edit (Story 4.1) modes
   * 
   * Add mode:
   * - Creates a new Subscription object with UUID and timestamps
   * - Dispatches ADD_SUBSCRIPTION action
   * - Displays "Subscription added successfully"
   * 
   * Edit mode (Story 4.1):
   * - Updates existing subscription with new name, cost, dueDate
   * - Preserves createdAt timestamp (Story 4.3 will set updatedAt)
   * - Dispatches UPDATE_SUBSCRIPTION action
   * - Displays "Subscription updated successfully"
   * - Exits edit mode
   */
  const handleFormSubmit = (data: FormData): void => {
    try {
      setIsSubmitting(true)
      setFormError(null) // Clear previous errors

      if (editingSubscription) {
        // Edit mode (Story 4.1)
        const updatedSubscription: Subscription = {
          ...editingSubscription,              // Preserve id, createdAt, and other fields
          name: data.name,                     // Update from form
          cost: parseFloat(data.cost.toString()), // Update from form
          dueDate: parseInt(data.dueDate, 10), // Update from form
          updatedAt: Date.now(),               // Story 4.3: Update timestamp
        }

        // Dispatch UPDATE_SUBSCRIPTION action
        updateSubscription(updatedSubscription)

        // Clear form and exit edit mode
        formRef.current?.reset()
        setEditingSubscription(null)

        // Display success message
        setSuccessMessage('Subscription updated successfully')
      } else {
        // Add mode (Story 3.3)
        const newSubscription: Subscription = {
          id: generateUUID(),                    // Unique UUID
          name: data.name,                       // String from form
          cost: parseFloat(data.cost.toString()), // Number
          dueDate: parseInt(data.dueDate, 10),   // Number 1-31
          createdAt: Date.now(),                 // Current timestamp
          updatedAt: Date.now(),                 // Current timestamp
        }

        // Dispatch ADD_SUBSCRIPTION action
        addSubscription(newSubscription)

        // Clear form
        formRef.current?.reset()

        // Display success message
        setSuccessMessage('Subscription added successfully')
      }

      setIsSubmitting(false)
    } catch (error) {
      setIsSubmitting(false)
      
      // Capture error message for user display (Story 4.1 AC10)
      if (error instanceof Error) {
        setFormError(error.message)
      } else {
        setFormError('An error occurred. Please try again.')
      }
      
      // Log full error for debugging
      console.error('Error submitting form:', error)
    }
  }

  // Cleanup setTimeout when component unmounts or successMessage changes (prevent memory leak)
  useEffect(() => {
    if (successMessage) {
      setFormError(null) // Clear any errors when success is shown
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  return (
    <div className="app" data-testid="app-container" role="main">
      <h1>Subscription Tracker</h1>
      {successMessage && (
        <div className="app__success-message" data-testid="success-message" role="alert" aria-live="polite">
          {successMessage}
        </div>
      )}
      <SubscriptionForm
        ref={formRef}
        onSubmit={handleFormSubmit}
        disabled={isSubmitting}
        errorMessage={formError}
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
  )
}

/**
 * App component - Subscription Tracker
 * 
 * Provides SubscriptionContext and renders the tracker UI
 * Story 3.3 implementation:
 * - Form submission handler with UUID and timestamp generation
 * - Context dispatch via useSubscriptions hook
 * - Form clearing via ref after successful submission
 * - Success message display with auto-dismiss
 */
function App() {
  return (
    <SubscriptionProvider>
      <AppContent />
    </SubscriptionProvider>
  )
}

export default App

