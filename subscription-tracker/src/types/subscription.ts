/**
 * Subscription Type Definition
 *
 * Represents a single subscription tracked by the user.
 * This is the single source of truth for subscription data shape.
 *
 * All fields are required (no optional fields).
 * Timestamps are milliseconds since epoch (use Date.now() to set them).
 *
 * Example:
 * {
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   name: "Netflix",
 *   cost: 15.99,
 *   dueDate: 15,
 *   createdAt: 1730204400000,
 *   updatedAt: 1730204400000
 * }
 */

export interface Subscription {
  /** UUID - Unique identifier for the subscription (generated with crypto.randomUUID()) */
  id: string;

  /** Subscription name entered by user (e.g., "Netflix", "Gym Membership") */
  name: string;

  /** Cost in USD (positive number, validated in form layer) */
  cost: number;

  /** Day of month when subscription is due (1-31) */
  dueDate: number;

  /** Timestamp when subscription was created (milliseconds since epoch, never modified) */
  createdAt: number;

  /** Timestamp when subscription was last updated (milliseconds since epoch, changes on edit) */
  updatedAt: number;
}
