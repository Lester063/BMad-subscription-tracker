import React, { useReducer, ReactNode } from 'react'
import { Subscription } from '../types/subscription'
import { ACTIONS } from '../constants'
import { saveSubscriptionsToStorage } from '../utils/localStorageManager'

/**
 * Subscription state shape for the context
 * Contains all subscription data and any error messages
 */
export interface SubscriptionState {
  subscriptions: Subscription[]
  error: string | null
}

/**
 * Action dispatched to the reducer
 * Discriminated union ensures type safety for payloads based on action type
 * Each action type has specific payload structure or no payload
 */
export type SubscriptionAction =
  | { type: typeof ACTIONS.SET_SUBSCRIPTIONS; payload: Subscription[] }
  | { type: typeof ACTIONS.ADD_SUBSCRIPTION; payload: Subscription }
  | { type: typeof ACTIONS.UPDATE_SUBSCRIPTION; payload: Subscription }
  | { type: typeof ACTIONS.DELETE_SUBSCRIPTION; payload: string }
  | { type: typeof ACTIONS.SET_ERROR; payload: string }
  | { type: string } // fallback for unknown types

/**
 * Initial state for SubscriptionContext
 * Empty subscriptions array and no error
 */
const initialState: SubscriptionState = {
  subscriptions: [],
  error: null,
}

/**
 * Reducer function for subscription state mutations.
 *
 * Handles all subscription actions: SET_SUBSCRIPTIONS, ADD_SUBSCRIPTION,
 * UPDATE_SUBSCRIPTION, DELETE_SUBSCRIPTION, SET_ERROR.
 *
 * Side effects: ADD/UPDATE/DELETE actions call saveSubscriptionsToStorage()
 * to persist changes. Error handling is graceful (no crashes if save fails).
 *
 * All state transformations are immutable (using spread operators and map/filter).
 *
 * @param state - Current SubscriptionState
 * @param action - Action with type from ACTIONS constant and optional payload
 * @returns Updated SubscriptionState
 */
export function subscriptionReducer(
  state: SubscriptionState,
  action: SubscriptionAction
): SubscriptionState {
  switch (action.type) {
    // Load subscriptions from localStorage (used on app start in Story 2.5)
    case ACTIONS.SET_SUBSCRIPTIONS: {
      const payload = action.payload
      // Validate payload is a non-empty array of valid subscriptions
      if (
        !payload ||
        !Array.isArray(payload) ||
        !payload.every(
          (item) =>
            item &&
            typeof item === 'object' &&
            'id' in item &&
            'name' in item &&
            'cost' in item
        )
      ) {
        return state // Silently reject invalid payload
      }
      return {
        subscriptions: payload as Subscription[],
        error: null,
      }
    }

    // Add new subscription and persist to localStorage
    case ACTIONS.ADD_SUBSCRIPTION: {
      const subscription = action.payload as Subscription
      // Validate payload has required fields
      if (!subscription || !subscription.id || !subscription.name) {
        return {
          ...state,
          error: 'Invalid subscription data',
        }
      }
      const updated = [...state.subscriptions, subscription]
      const saveSuccess = saveSubscriptionsToStorage(updated)
      // AC6: Handle saveSubscriptionsToStorage return value
      if (!saveSuccess) {
        return {
          ...state,
          error: 'Failed to save subscription to storage',
        }
      }
      return {
        subscriptions: updated,
        error: null,
      }
    }

    // Update existing subscription and persist to localStorage
    case ACTIONS.UPDATE_SUBSCRIPTION: {
      const updatedSub = action.payload as Subscription
      // Validate payload has required fields
      if (!updatedSub || !updatedSub.id || !updatedSub.name) {
        return {
          ...state,
          error: 'Invalid subscription data',
        }
      }
      const updated = state.subscriptions.map((sub) =>
        sub.id === updatedSub.id ? updatedSub : sub
      )
      const saveSuccess = saveSubscriptionsToStorage(updated)
      // AC6: Handle saveSubscriptionsToStorage return value
      if (!saveSuccess) {
        return {
          ...state,
          error: 'Failed to save subscription to storage',
        }
      }
      return {
        subscriptions: updated,
        error: null,
      }
    }

    // Delete subscription and persist to localStorage
    case ACTIONS.DELETE_SUBSCRIPTION: {
      const subscriptionId = action.payload as string
      // Validate payload is non-empty string
      if (!subscriptionId || typeof subscriptionId !== 'string') {
        return {
          ...state,
          error: 'Invalid subscription ID',
        }
      }
      const updated = state.subscriptions.filter(
        (sub) => sub.id !== subscriptionId
      )
      const saveSuccess = saveSubscriptionsToStorage(updated)
      // AC6: Handle saveSubscriptionsToStorage return value
      if (!saveSuccess) {
        return {
          ...state,
          error: 'Failed to delete subscription from storage',
        }
      }
      return {
        subscriptions: updated,
        error: null,
      }
    }

    // Set error message (does not persist to localStorage)
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload as string,
      }

    // Invalid action type - return state unchanged
    default:
      return state
  }
}

/**
 * SubscriptionContext - holds subscription state and dispatch
 * Used by SubscriptionProvider and consumed via useSubscriptions hook (Story 2.4)
 *
 * Decision: Include both state and dispatch in context value (Decision #2 from code review)
 * This allows Story 2.4 hook to wrap dispatch for creating helper functions
 */
export const SubscriptionContext = React.createContext<
  { state: SubscriptionState; dispatch: React.Dispatch<SubscriptionAction> } | undefined
>(undefined)

/**
 * SubscriptionProvider component - wraps app with subscription state context
 *
 * Usage in App.tsx:
 *   <SubscriptionProvider>
 *     <YourApp />
 *   </SubscriptionProvider>
 *
 * Provides both state and dispatch via context for useSubscriptions() hook (Story 2.4).
 * The hook wraps dispatch to provide helper functions for components.
 *
 * @param children - React components to wrap
 */
export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState)

  // Context value includes both state and dispatch for Story 2.4 hook to wrap
  const contextValue: { state: SubscriptionState; dispatch: React.Dispatch<SubscriptionAction> } = {
    state,
    dispatch,
  }

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  )
}
