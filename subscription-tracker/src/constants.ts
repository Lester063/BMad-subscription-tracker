/**
 * Application Constants
 *
 * Single source of truth for magic strings, numbers, and configuration values
 * used throughout the subscription tracker.
 *
 * These are frozen objects/values (immutable at runtime) and use string literals
 * for type safety with TypeScript's 'as const' operator.
 */

// ============================================================================
// ACTION TYPES (used by SubscriptionContext reducer in Story 2.3)
// ============================================================================

/**
 * Redux-style action types for the subscription state reducer.
 *
 * Use only these action types when dispatching to SubscriptionContext.
 * Never create custom action types.
 *
 * Usage in reducer (Story 2.3):
 *   dispatch({ type: ACTIONS.ADD_SUBSCRIPTION, payload: newSubscription })
 *
 * Usage in useSubscriptions hook (Story 2.4):
 *   dispatch({ type: ACTIONS.DELETE_SUBSCRIPTION, payload: subscriptionId })
 */
export const ACTIONS = {
  /** Load all subscriptions from localStorage on app start (Story 2.5) */
  SET_SUBSCRIPTIONS: 'SET_SUBSCRIPTIONS',

  /** Create new subscription (Story 3.3) */
  ADD_SUBSCRIPTION: 'ADD_SUBSCRIPTION',

  /** Edit existing subscription (Story 4.1) */
  UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION',

  /** Remove subscription (Story 4.2) */
  DELETE_SUBSCRIPTION: 'DELETE_SUBSCRIPTION',

  /** Set error message for display (Story 8.1+) */
  SET_ERROR: 'SET_ERROR',
} as const;

// ============================================================================
// STORAGE CONFIGURATION
// ============================================================================

/**
 * localStorage key for persisting subscriptions
 *
 * Value: exactly 'subscriptions' (lowercase, no prefix)
 *
 * Used by (Story 2.2):
 *   localStorage.getItem(STORAGE_KEY)
 *   localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions))
 *
 * Important: This is the exact key - do not modify spelling or case
 */
export const STORAGE_KEY = 'subscriptions';

// ============================================================================
// FORM & VALIDATION CONSTANTS
// ============================================================================

/**
 * Maximum length for subscription name
 *
 * Value: 100 characters
 *
 * Used by (Story 7.4):
 *   Form validation: maxLength constraint
 *   Error message: "Name must be 100 characters or less"
 */
export const MAX_SUBSCRIPTION_NAME_LENGTH = 100;

/**
 * Threshold for fuzzy name matching (duplicate prevention)
 *
 * Value: 0.85 (85% similarity)
 *
 * When user tries to add "Netflix", app checks existing subscriptions:
 *   - If "Netflix" matches existing subscription 85%+ similar, warn user
 *   - Threshold prevents false positives (e.g., "Netflix" vs "Hulu" = ~50%)
 *   - Threshold allows typos (e.g., "Netflx" vs "Netflix" = ~95%)
 *
 * Used by (Story 7.2):
 *   useFuzzyMatch hook: compare new name against existing names
 *   Duplicate prevention validation: flag warnings
 */
export const FUZZY_MATCH_THRESHOLD = 0.85;
