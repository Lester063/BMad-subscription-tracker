import { useContext, useCallback, useMemo } from 'react';
import { SubscriptionContext, type SearchState } from '../context/SubscriptionContext';
import type { Subscription } from '../types/subscription';
import { ACTIONS } from '../constants';

/**
 * Return type for useSubscriptions hook
 * Provides state and action dispatchers for subscription management
 */
export interface UseSubscriptionsReturn {
  /** Array of all subscriptions from context state */
  subscriptions: Subscription[];
  /** Error message if any operation failed, null otherwise */
  error: string | null;
  /** Add a new subscription to state via dispatcher */
  addSubscription: (subscription: Subscription) => void;
  /** Update an existing subscription in state via dispatcher */
  updateSubscription: (subscription: Subscription) => void;
  /** Delete a subscription by ID from state via dispatcher */
  deleteSubscription: (id: string) => void;
  /** Set an error message in state via dispatcher */
  setError: (message: string) => void;
  /** Computed total cost of all subscriptions */
  totalCost: number;
  /** Search and filter state (Story 11.1) */
  searchState: SearchState;
  /** Update search term for name filtering (Story 11.1) */
  setSearchTerm: (term: string) => void;
  /** Update minimum cost range filter (Story 11.1) */
  setCostRangeMin: (min: number | null) => void;
  /** Update maximum cost range filter (Story 11.1) */
  setCostRangeMax: (max: number | null) => void;
  /** Reset all search/filter criteria to defaults (Story 11.1) */
  resetAllFilters: () => void;
}

/**
 * Custom hook to manage subscriptions via SubscriptionContext
 *
 * Wraps context access and provides helper functions for common operations.
 * Error state is managed by the reducer; dispatchers do not suppress or clear errors.
 * totalCost is memoized and only recalculates when subscriptions array changes.
 *
 * @returns {UseSubscriptionsReturn} Object with subscriptions, error, dispatchers, and totalCost
 * @throws {Error} If used outside of SubscriptionProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { subscriptions, addSubscription, totalCost } = useSubscriptions();
 *   return <div>Total: ${totalCost.toFixed(2)}</div>;
 * }
 * ```
 */
export function useSubscriptions(): UseSubscriptionsReturn {
  // Access context - will throw if not within SubscriptionProvider
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error(
      'useSubscriptions must be used within SubscriptionProvider. ' +
        'Wrap your root component or component tree with <SubscriptionProvider> in the component hierarchy.'
    );
  }

  if (!context.state || !context.dispatch) {
    throw new Error(
      'SubscriptionContext is malformed: missing state or dispatch. ' +
        'Ensure SubscriptionProvider is properly initialized.'
    );
  }

  const { state, dispatch } = context;

  /**
   * Dispatcher for adding a new subscription
   * Dispatches ADD_SUBSCRIPTION action; error management handled by reducer
   */
  const addSubscription = useCallback(
    (subscription: Subscription) => {
      try {
        dispatch({
          type: ACTIONS.ADD_SUBSCRIPTION,
          payload: subscription,
        });
      } catch (error) {
        console.error('Error dispatching ADD_SUBSCRIPTION:', error);
      }
    },
    [dispatch]
  );

  /**
   * Dispatcher for updating an existing subscription
   * Dispatches UPDATE_SUBSCRIPTION action; error management handled by reducer
   */
  const updateSubscription = useCallback(
    (subscription: Subscription) => {
      try {
        dispatch({
          type: ACTIONS.UPDATE_SUBSCRIPTION,
          payload: subscription,
        });
      } catch (error) {
        console.error('Error dispatching UPDATE_SUBSCRIPTION:', error);
      }
    },
    [dispatch]
  );

  /**
   * Dispatcher for deleting a subscription
   * Dispatches DELETE_SUBSCRIPTION action with subscription ID; error management handled by reducer
   */
  const deleteSubscription = useCallback(
    (id: string) => {
      try {
        dispatch({
          type: ACTIONS.DELETE_SUBSCRIPTION,
          payload: id,
        });
      } catch (error) {
        console.error('Error dispatching DELETE_SUBSCRIPTION:', error);
      }
    },
    [dispatch]
  );

  /**
   * Dispatcher for setting error message
   * Dispatches SET_ERROR action directly
   */
  const setError = useCallback(
    (message: string) => {
      try {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: message,
        });
      } catch (error) {
        console.error('Error dispatching SET_ERROR:', error);
      }
    },
    [dispatch]
  );

  /**
   * Dispatcher for updating search term filter (Story 11.1)
   * Dispatches SET_SEARCH_TERM action for name-based filtering
   */
  const setSearchTerm = useCallback(
    (term: string) => {
      try {
        dispatch({
          type: ACTIONS.SET_SEARCH_TERM,
          payload: term,
        });
      } catch (error) {
        console.error('Error dispatching SET_SEARCH_TERM:', error);
      }
    },
    [dispatch]
  );

  /**
   * Dispatcher for updating minimum cost range filter (Story 11.1)
   * Dispatches SET_COST_RANGE_MIN action; null removes the minimum filter
   */
  const setCostRangeMin = useCallback(
    (min: number | null) => {
      try {
        dispatch({
          type: ACTIONS.SET_COST_RANGE_MIN,
          payload: min,
        });
      } catch (error) {
        console.error('Error dispatching SET_COST_RANGE_MIN:', error);
      }
    },
    [dispatch]
  );

  /**
   * Dispatcher for updating maximum cost range filter (Story 11.1)
   * Dispatches SET_COST_RANGE_MAX action; null removes the maximum filter
   */
  const setCostRangeMax = useCallback(
    (max: number | null) => {
      try {
        dispatch({
          type: ACTIONS.SET_COST_RANGE_MAX,
          payload: max,
        });
      } catch (error) {
        console.error('Error dispatching SET_COST_RANGE_MAX:', error);
      }
    },
    [dispatch]
  );

  /**
   * Dispatcher for resetting all search/filter criteria (Story 11.1)
   * Dispatches RESET_ALL_FILTERS action to clear search term and cost ranges
   */
  const resetAllFilters = useCallback(() => {
    try {
      dispatch({
        type: ACTIONS.RESET_ALL_FILTERS,
      });
    } catch (error) {
      console.error('Error dispatching RESET_ALL_FILTERS:', error);
    }
  }, [dispatch]);

  /**
   * Compute total cost of all subscriptions
   * Memoized to only recalculate when subscriptions array changes
   * Guards against NaN/Infinity values
   */
  const totalCost = useMemo(() => {
    if (!Array.isArray(state.subscriptions)) {
      return 0;
    }
    const sum = state.subscriptions.reduce((total, sub) => {
      const cost = typeof sub.cost === 'number' && isFinite(sub.cost) ? sub.cost : 0;
      return total + cost;
    }, 0);
    return isFinite(sum) ? sum : 0;
  }, [state.subscriptions]);

  return {
    subscriptions: state.subscriptions,
    error: state.error,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    setError,
    totalCost,
    searchState: state.searchState,
    setSearchTerm,
    setCostRangeMin,
    setCostRangeMax,
    resetAllFilters,
  };
}
