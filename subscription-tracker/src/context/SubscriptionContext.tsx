import React, { useReducer, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Subscription } from '../types/subscription'
import { ACTIONS } from '../constants'
import { saveSubscriptionsToStorage, loadSubscriptionsFromStorage } from '../utils/localStorageManager'

/**
 * Search and filter state for subscriptions (Story 11.1)
 *
 * Session-only state (NOT persisted to localStorage).
 * Rationale: Temporary UI state; users expect filters to reset on new session.
 * Subscriptions persist, but filter criteria do not.
 */
export interface SearchState {
  /** Search text for subscription names (case-insensitive matching) */
  searchTerm: string

  /** Minimum cost filter threshold (null = no minimum) */
  costRangeMin: number | null

  /** Maximum cost filter threshold (null = no maximum) */
  costRangeMax: number | null
}

/**
 * Subscription state shape for the context
 * Contains all subscription data, error messages, and search/filter state
 */
export interface SubscriptionState {
  subscriptions: Subscription[]
  error: string | null
  searchState: SearchState
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
  | { type: typeof ACTIONS.SET_SEARCH_TERM; payload: string }
  | { type: typeof ACTIONS.SET_COST_RANGE_MIN; payload: number | null }
  | { type: typeof ACTIONS.SET_COST_RANGE_MAX; payload: number | null }
  | { type: typeof ACTIONS.RESET_ALL_FILTERS }

/**
 * Initial state for SubscriptionContext
 * Empty subscriptions array, no error, and no search/filter criteria active
 */
const initialState: SubscriptionState = {
  subscriptions: [],
  error: null,
  searchState: {
    searchTerm: '',
    costRangeMin: null,
    costRangeMax: null,
  },
}

/**
 * Reducer function for subscription state mutations.
 *
 * Handles all subscription actions: SET_SUBSCRIPTIONS, ADD_SUBSCRIPTION,
 * UPDATE_SUBSCRIPTION, DELETE_SUBSCRIPTION, SET_ERROR.
 *
 * Also handles search/filter actions: SET_SEARCH_TERM, SET_COST_RANGE_MIN,
 * SET_COST_RANGE_MAX, RESET_ALL_FILTERS (Story 11.1).
 *
 * Side effects: ADD/UPDATE/DELETE actions call saveSubscriptionsToStorage()
 * to persist changes. Error handling is graceful (no crashes if save fails).
 *
 * All state transformations are immutable (using spread operators and map/filter).
 *
 * Search/filter actions have NO localStorage side effects (session-only state).
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
      // Validate payload is a non-empty array of valid subscriptions with all required fields
      if (
        !payload ||
        !Array.isArray(payload) ||
        !payload.every(
          (item) =>
            item &&
            typeof item === 'object' &&
            'id' in item &&
            'name' in item &&
            'cost' in item &&
            'dueDate' in item &&
            'createdAt' in item &&
            'updatedAt' in item
        )
      ) {
        return state // Silently reject invalid payload
      }
      return {
        subscriptions: payload as Subscription[],
        error: null,
        searchState: state.searchState, // Preserve search/filter state
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
        searchState: state.searchState, // Preserve search/filter state
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
        searchState: state.searchState, // Preserve search/filter state
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
        searchState: state.searchState, // Preserve search/filter state
      }
    }

    // Set error message (does not persist to localStorage)
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload as string,
        searchState: state.searchState, // Preserve search/filter state
      }

    // ========================================================================
    // NEW: Search/Filter Actions (Story 11.1) — Session-only state
    // ========================================================================
    // No localStorage persistence for these actions (temporary UI state)

    // Update search term for name filtering
    case ACTIONS.SET_SEARCH_TERM:
      return {
        ...state,
        searchState: {
          ...state.searchState,
          searchTerm: action.payload as string,
        },
      }

    // Update minimum cost range filter
    case ACTIONS.SET_COST_RANGE_MIN:
      return {
        ...state,
        searchState: {
          ...state.searchState,
          costRangeMin: action.payload as number | null,
        },
      }

    // Update maximum cost range filter
    case ACTIONS.SET_COST_RANGE_MAX:
      return {
        ...state,
        searchState: {
          ...state.searchState,
          costRangeMax: action.payload as number | null,
        },
      }

    // Reset all search/filter criteria to defaults
    case ACTIONS.RESET_ALL_FILTERS:
      return {
        ...state,
        searchState: {
          searchTerm: '',
          costRangeMin: null,
          costRangeMax: null,
        },
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
 * Usage in tests with initial subscriptions:
 *   <SubscriptionProvider initialSubscriptions={testData}>
 *     <YourComponent />
 *   </SubscriptionProvider>
 *
 * Provides both state and dispatch via context for useSubscriptions() hook (Story 2.4).
 * The hook wraps dispatch to provide helper functions for components.
 *
 * @param children - React components to wrap
 * @param initialSubscriptions - Optional: for testing, provide initial subscriptions instead of loading from localStorage
 */
const SubscriptionProvider: React.FC<{ children: ReactNode; initialSubscriptions?: Subscription[] }> = ({
  children,
  initialSubscriptions,
}) => {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState)

  // Story 2.5: Load subscriptions from localStorage on app start
  // This useEffect runs exactly once on component mount (empty dependency array)
  // and initializes the subscription state with persisted data
  // For testing: if initialSubscriptions provided, use those instead
  useEffect(() => {
    if (initialSubscriptions) {
      // Testing mode: use provided initial subscriptions
      dispatch({
        type: ACTIONS.SET_SUBSCRIPTIONS,
        payload: initialSubscriptions,
      })
    } else {
      // Production mode: load from localStorage
      const loadedSubscriptions = loadSubscriptionsFromStorage()
      dispatch({
        type: ACTIONS.SET_SUBSCRIPTIONS,
        payload: loadedSubscriptions,
      })
    }
  }, [dispatch, initialSubscriptions]) // Add to dependency array for ESLint compliance

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

export { SubscriptionProvider }
