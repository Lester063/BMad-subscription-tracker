import { useContext, useCallback, useMemo } from 'react';
import { SubscriptionContext } from '../context/SubscriptionContext';
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
  };
}
