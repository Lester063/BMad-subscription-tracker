/**
 * SubscriptionList Component
 * 
 * Displays a list of all subscriptions using SubscriptionRow components.
 * Uses the useSubscriptions hook to access subscription data from context.
 * Shows empty state when no subscriptions exist.
 * 
 * Story 4.1: Passes onEditClick callback to SubscriptionRow for edit mode activation
 * 
 * @component
 * @requires useSubscriptions hook
 * @requires SubscriptionRow component
 * @requires SubscriptionList.module.css
 */

import { useSubscriptions } from '../../hooks/useSubscriptions';
import { SubscriptionRow } from '../SubscriptionRow';
import type { Subscription } from '../../types/subscription';
import styles from './SubscriptionList.module.css';

/**
 * Props for SubscriptionList component
 */
export interface SubscriptionListProps {
  /**
   * Callback when Edit button is clicked on a subscription row
   * Receives the subscription object to edit
   * Story 4.1: Used to set form into edit mode
   */
  onEditClick?: (subscription: Subscription) => void;
}

/**
 * Renders a list of subscriptions or empty state message
 * 
 * @param props - Component props including onEditClick callback
 * @returns {JSX.Element} List of subscription rows or empty state message
 */
export function SubscriptionList({ onEditClick }: SubscriptionListProps) {
  const { subscriptions } = useSubscriptions();
  
  // Guard against null/undefined subscriptions from hook
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className={styles.listContainer} aria-label="Subscriptions">
        <p className={styles.emptyState} data-testid="empty-list-message">No subscriptions yet.</p>
      </div>
    );
  }
  
  // Sort subscriptions by dueDate in ascending order (1-31)
  // Using spread operator to preserve original array immutability
  const sortedSubscriptions = [...subscriptions].sort((a, b) => a.dueDate - b.dueDate);
  
  return (
    <div className={styles.listContainer} aria-label="Subscriptions">
      <ul className={styles.list} data-testid="subscription-list">
        {sortedSubscriptions.map(sub => {
          // Validate subscription ID is present for React key reconciliation
          if (!sub?.id) {
            console.warn('SubscriptionRow rendered without valid ID:', sub);
          }
          return (
            <SubscriptionRow
              key={sub.id}
              subscription={sub}
              onEditClick={onEditClick}
            />
          );
        })}
      </ul>
    </div>
  );
}