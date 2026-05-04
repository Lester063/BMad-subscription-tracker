/**
 * SubscriptionList Component
 * 
 * Displays a list of all subscriptions using SubscriptionRow components.
 * Uses the useSubscriptions hook to access subscription data from context.
 * Shows empty state when no subscriptions exist.
 * 
 * @component
 * @requires useSubscriptions hook
 * @requires SubscriptionRow component
 * @requires SubscriptionList.module.css
 */

import { useSubscriptions } from '../../hooks/useSubscriptions';
import { SubscriptionRow } from '../SubscriptionRow';
import styles from './SubscriptionList.module.css';

/**
 * Renders a list of subscriptions or empty state message
 * 
 * @returns {JSX.Element} List of subscription rows or empty state message
 */
export function SubscriptionList() {
  const { subscriptions } = useSubscriptions();
  
  // Guard against null/undefined subscriptions from hook
  if (!subscriptions || subscriptions.length === 0) {
    return <p className={styles.emptyState} data-testid="empty-list-message">No subscriptions yet.</p>;
  }
  
  return (
    <ul className={styles.list} data-testid="subscription-list">
      {subscriptions.map(sub => {
        // Validate subscription ID is present for React key reconciliation
        if (!sub?.id) {
          console.warn('SubscriptionRow rendered without valid ID:', sub);
        }
        return (
          <SubscriptionRow key={sub.id} subscription={sub} />
        );
      })}
    </ul>
  );
}