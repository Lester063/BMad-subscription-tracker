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
 */
function AppContent() {
  const { addSubscription } = useSubscriptions()
  const formRef = useRef<SubscriptionFormRef>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Handle form submission (AC1, AC2, AC3, AC4)
   * 
   * Creates a new Subscription object with:
   * - Unique UUID (AC2)
   * - Form data (name, cost, dueDate)
   * - Timestamps (createdAt, updatedAt)
   * 
   * Then:
   * - Dispatches ADD_SUBSCRIPTION action (AC1)
   * - Clears form fields (AC3)
   * - Displays success message (AC4)
   */
  const handleFormSubmit = (data: FormData): void => {
    try {
      setIsSubmitting(true)
      // Create new Subscription object with UUID and timestamps (AC2)
      const newSubscription: Subscription = {
        id: generateUUID(),                    // Unique UUID (AC2)
        name: data.name,                       // String from form
        cost: parseFloat(data.cost.toString()), // Number (AC8)
        dueDate: parseInt(data.dueDate, 10),   // Number 1-31 (AC8)
        createdAt: Date.now(),                 // Current timestamp
        updatedAt: Date.now(),                 // Current timestamp
      }

      // Dispatch ADD_SUBSCRIPTION action via useSubscriptions hook (AC1)
      addSubscription(newSubscription)

      // Clear form fields after successful submission (AC3)
      formRef.current?.reset()

      // Display success message (AC4)
      setSuccessMessage('Subscription added successfully')
      setIsSubmitting(false)
    } catch (error) {
      console.error('Error adding subscription:', error)
      setIsSubmitting(false)
    }
  }

  // Cleanup setTimeout when component unmounts or successMessage changes (prevent memory leak)
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  return (
    <div className="app">
      <h1>Subscription Tracker</h1>
      {successMessage && (
        <div className="app__success-message" role="alert" aria-live="polite">
          {successMessage}
        </div>
      )}
      <SubscriptionForm ref={formRef} onSubmit={handleFormSubmit} disabled={isSubmitting} />
      <SubscriptionList />
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

