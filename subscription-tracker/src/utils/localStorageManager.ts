import { Subscription } from '../types/subscription'
import { STORAGE_KEY } from '../constants'

/**
 * Loads subscriptions from browser localStorage
 *
 * Safely retrieves subscriptions from localStorage.
 * Returns an empty array if storage is unavailable, key doesn't exist,
 * or data is corrupted.
 *
 * @returns Array of Subscription objects, or empty array on error
 *
 * @example
 * const subscriptions = loadSubscriptionsFromStorage()
 * // Returns: Subscription[] (guaranteed non-null)
 */
export function loadSubscriptionsFromStorage(): Subscription[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data) as Subscription[]
  } catch (error) {
    // Silent graceful degradation: return empty array instead of throwing
    // This handles: localStorage unavailable, corrupted JSON, quota errors
    return []
  }
}

/**
 * Saves subscriptions to browser localStorage
 *
 * Persists an array of subscriptions as JSON string to localStorage.
 * Returns boolean indicating success or failure. Never throws.
 *
 * @param subscriptions - Array of Subscription objects to persist
 * @returns true if save succeeded, false if save failed
 *
 * @example
 * const success = saveSubscriptionsToStorage(mySubscriptions)
 * if (!success) {
 *   // Handle storage failure (quota exceeded, etc.)
 *   setError('Could not save subscriptions')
 * }
 */
export function saveSubscriptionsToStorage(subscriptions: Subscription[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions))
    return true
  } catch (error) {
    // Graceful degradation: return false on any error
    // This handles: localStorage unavailable, quota exceeded, permission denied
    return false
  }
}

/**
 * Clears all subscriptions from browser localStorage
 *
 * Removes the subscriptions key from localStorage.
 * Returns boolean indicating success or failure.
 * Idempotent - safe to call multiple times.
 *
 * @returns true if removal succeeded or key didn't exist, false if error occurred
 *
 * @example
 * const success = clearSubscriptionsStorage()
 * // Returns: true (key removed) or false (error occurred)
 */
export function clearSubscriptionsStorage(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    // Graceful degradation: return false on any error
    return false
  }
}
