/**
 * SubscriptionRow Component
 * 
 * Displays a single subscription's information in a list row format.
 * Shows name, cost (formatted as currency), due date, and action buttons.
 * Memoized to prevent unnecessary re-renders when parent re-renders.
 * 
 * @component
 * @requires Subscription type
 * @requires SubscriptionRow.module.css
 */

import { memo } from 'react';
import type { ReactElement } from 'react';
import type { Subscription } from '../../types/subscription';
import styles from './SubscriptionRow.module.css';

/**
 * Props for SubscriptionRow component
 */
export interface SubscriptionRowProps {
  /** The subscription data to display */
  subscription: Subscription;
}

/**
 * Format due date with ordinal suffix (1st, 2nd, 3rd, etc.)
 * 
 * @param day - Day of month (1-31)
 * @returns Formatted string like "15th"
 * @throws Error if day is not a number between 1-31
 */
function formatDueDate(day: number): string {
  // Validate day is a number and within valid range (1-31)
  if (typeof day !== 'number' || isNaN(day) || day < 1 || day > 31) {
    console.error(`Invalid dueDate: ${day}. Expected number between 1-31.`);
    return 'Invalid date';
  }
  
  // Reject float values
  if (!Number.isInteger(day)) {
    console.error(`Invalid dueDate: ${day}. Expected integer, got float.`);
    return 'Invalid date';
  }
  
  if (day >= 11 && day <= 13) {
    return `${day}th`;
  }
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

/**
 * Renders a single subscription row with name, cost, due date, and action buttons
 * 
 * @param props - Component props including subscription data
 * @returns {JSX.Element|null} Subscription row element or null if validation fails
 */
function SubscriptionRowComponent({ subscription }: SubscriptionRowProps): ReactElement | null {
  // Defensive checks for required subscription properties
  if (!subscription || typeof subscription !== 'object') {
    console.error('Invalid subscription prop: received', subscription);
    return null;
  }
  
  const { id, name, cost, dueDate } = subscription;
  
  // Validate required properties exist and have correct types
  if (!id || typeof id !== 'string') {
    console.error('Invalid subscription.id:', id);
    return null;
  }
  if (!name || typeof name !== 'string') {
    console.error('Invalid subscription.name:', name);
    return null;
  }
  if (typeof cost !== 'number' || isNaN(cost)) {
    console.error('Invalid subscription.cost:', cost);
    return null;
  }
  if (typeof dueDate !== 'number' || dueDate < 1 || dueDate > 31) {
    console.error('Invalid subscription.dueDate:', dueDate);
    return null;
  }
  
  // Validate cost is non-negative
  if (cost < 0) {
    console.warn(`Negative subscription cost detected for "${name}": $${cost}`);
  }
  
  const costFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cost);
  
  const dueDateFormatted = formatDueDate(dueDate);

  return (
    <li className={styles.row} data-testid="subscription-item">
      <span className={styles.name} data-testid="subscription-name">{name}</span>
      <span className={styles.cost} data-testid="subscription-cost">{costFormatted}</span>
      <span className={styles.dueDate} data-testid="subscription-duedate">Due: {dueDateFormatted}</span>
      <div className={styles.actions}>
        <button className={styles.editBtn} type="button" aria-label={`Edit ${name}`}>Edit</button>
        <button className={styles.deleteBtn} type="button" aria-label={`Delete ${name}`}>Delete</button>
      </div>
    </li>
  );
}

/**
 * Memoized SubscriptionRow component with custom equality comparison
 */
export const SubscriptionRow = memo(
  SubscriptionRowComponent,
  (prevProps: SubscriptionRowProps, nextProps: SubscriptionRowProps): boolean => {
    // Custom comparison: shallow equal on subscription object
    return prevProps.subscription === nextProps.subscription;
  }
);