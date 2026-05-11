import React, { useCallback } from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import styles from './SearchBar.module.css';

/**
 * SearchBarProps Interface
 *
 * @interface SearchBarProps
 * @property {string} [placeholder='Search by subscription name'] - Optional custom placeholder text
 * @property {() => void} [onClear] - Optional callback when clear button is clicked
 */
export interface SearchBarProps {
  placeholder?: string;
  onClear?: () => void;
}

/**
 * SearchBar Component
 *
 * A real-time search input component for filtering subscriptions by name.
 * Manages search state through the SubscriptionContext and provides a clear button
 * for resetting the search term.
 *
 * Features:
 * - Real-time search dispatch (no debounce)
 * - Conditional clear button (✕) when input has text
 * - WCAG 2.1 Level A accessibility (labels, keyboard navigation, screen readers)
 * - CSS Module styling with BEM naming convention
 * - TypeScript strict mode compliance
 *
 * @component
 * @example
 * ```tsx
 * <SearchBar
 *   placeholder="Find your subscription..."
 *   onClear={() => console.log('search cleared')}
 * />
 * ```
 *
 * @param {SearchBarProps} props - Component props
 * @returns {React.ReactElement} SearchBar component
 */
export function SearchBar({
  placeholder = 'Search by subscription name',
  onClear,
}: SearchBarProps): React.ReactElement {
  const { searchState, setSearchTerm } = useSubscriptions();

  /**
   * Handles input change events - dispatches search term in real-time
   * @param {React.ChangeEvent<HTMLInputElement>} event - Input change event
   */
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    [setSearchTerm]
  );

  /**
   * Handles clear button click - resets search term and optionally calls onClear callback
   */
  const handleClear = useCallback(() => {
    setSearchTerm('');
    onClear?.();
  }, [setSearchTerm, onClear]);

  return (
    <div className={styles.searchBar} data-testid="search-bar">
      <label htmlFor="searchbar-input" className={styles['searchBar__label']}>
        Search subscriptions
      </label>
      <input
        id="searchbar-input"
        type="text"
        className={styles.searchBar__input}
        value={searchState?.searchTerm ?? ''}
        onChange={handleInputChange}
        placeholder={placeholder}
        maxLength={100}
        autoComplete="off"
      />
      {searchState?.searchTerm && searchState.searchTerm.length > 0 && (
        <button
          type="button"
          className={styles.searchBar__button}
          onClick={handleClear}
          aria-label="Clear search"
          title="Clear search term"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;
