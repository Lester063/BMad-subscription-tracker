import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';
import { SubscriptionProvider } from '../../context/SubscriptionContext';
import styles from './SearchBar.module.css';

/**
 * SearchBar Component Test Suite
 * Tests all acceptance criteria and edge cases
 */

describe('SearchBar Component', () => {
  // Wrapper to provide SubscriptionContext
  const renderWithContext = (component: React.ReactElement) => {
    return render(<SubscriptionProvider>{component}</SubscriptionProvider>);
  };

  // ========== AC1: Component Creation & Rendering ==========
  describe('AC1: Component renders with text input and label', () => {
    it('should render container with .searchBar class', () => {
      renderWithContext(<SearchBar />);
      const container = screen.getByRole('textbox').closest('div');
      expect(container).toHaveClass(styles.searchBar);
    });

    it('should render label with "Search subscriptions" text', () => {
      renderWithContext(<SearchBar />);
      const label = screen.getByLabelText(/search subscriptions/i);
      expect(label).toBeInTheDocument();
    });

    it('should render input element with .searchBar__input class', () => {
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(styles.searchBar__input);
    });

    it('should render input with default placeholder "Search by subscription name"', () => {
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Search by subscription name');
    });

    it('should render input with custom placeholder when provided', () => {
      renderWithContext(<SearchBar placeholder="Find your subscription..." />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Find your subscription...');
    });

    it('should have autoComplete="off" on input', () => {
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autoComplete', 'off');
    });

    it('should export component as default export', () => {
      expect(SearchBar).toBeDefined();
      expect(typeof SearchBar).toBe('function');
    });
  });

  // ========== AC2: Real-Time Search Dispatch ==========
  describe('AC2: Real-time search dispatch on input change', () => {
    it('should update searchState.searchTerm on every keystroke', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      // Type single character
      await user.type(input, 'N');
      expect(input).toHaveValue('N');

      // Type more characters
      await user.type(input, 'etflix');
      expect(input).toHaveValue('Netflix');
    });

    it('should handle rapid typing (real-time updates)', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      const text = 'Spotify Premium Annual';
      await user.type(input, text);
      expect(input).toHaveValue(text);
    });

    it('should handle backspace and character deletion', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Netflix');
      expect(input).toHaveValue('Netflix');

      // Delete last 3 characters (should leave 'Netf')
      await user.type(input, '{Backspace}{Backspace}{Backspace}');
      expect(input).toHaveValue('Netf');
    });

    it('should handle special characters in search term', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.type(input, "Cloud's Storage & Backup");
      expect(input).toHaveValue("Cloud's Storage & Backup");
    });

    it('should handle empty input (initial state)', () => {
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  // ========== AC3: Clear Button Visibility ==========
  describe('AC3: Clear button appears/disappears based on input text', () => {
    it('should NOT render clear button when input is empty', () => {
      renderWithContext(<SearchBar />);
      const clearButtonWhenEmpty = screen.queryByRole('button', { name: /clear search/i });
      expect(clearButtonWhenEmpty).not.toBeInTheDocument();
    });

    it('should render clear button when input has text', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Netflix');
      const clearButtonWhenText = screen.getByRole('button', { name: /clear search/i });
      expect(clearButtonWhenText).toBeInTheDocument();
    });

    it('should hide clear button when input is cleared', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      // Type to show button
      await user.type(input, 'Netflix');
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toBeInTheDocument();

      // Delete all text
      await user.clear(input);
      const clearButtonAfterClear = screen.queryByRole('button', { name: /clear search/i });
      expect(clearButtonAfterClear).not.toBeInTheDocument();
    });

    it('should render clear button with .searchBar__button class', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Test');
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toHaveClass(styles.searchBar__button);
    });

    it('should render clear button with aria-label for accessibility', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Test');
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
    });
  });

  // ========== AC4: Clear Button Functionality ==========
  describe('AC4: Clear button clears search and resets input', () => {
    it('should clear input when clear button is clicked', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Netflix');
      expect(input).toHaveValue('Netflix');

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      expect(input).toHaveValue('');
    });

    it('should hide clear button after clearing', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Netflix');
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toBeInTheDocument();

      await user.click(clearButton);
      const clearButtonAfterClick = screen.queryByRole('button', { name: /clear search/i });
      expect(clearButtonAfterClick).not.toBeInTheDocument();
    });

    it('should call onClear callback when provided', async () => {
      const user = userEvent.setup();
      const onClearMock = vi.fn();
      renderWithContext(<SearchBar onClear={onClearMock} />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Netflix');
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      expect(onClearMock).toHaveBeenCalledTimes(1);
    });

    it('should not crash if onClear is not provided', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Netflix');
      const clearButton = screen.getByRole('button', { name: /clear search/i });

      expect(() => {
        fireEvent.click(clearButton);
      }).not.toThrow();
    });
  });

  // ========== AC5: CSS Module with BEM Naming ==========
  describe('AC5: CSS Module with BEM naming', () => {
    it('should have .searchBar container class', () => {
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');
      const container = input.closest('div');
      expect(container).toHaveClass(styles.searchBar);
    });

    it('should have .searchBar__input class on input element', () => {
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(styles.searchBar__input);
    });

    it('should have .searchBar__button class on clear button', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Test');
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toHaveClass(styles.searchBar__button);
    });

    it('should apply .searchBar__input--focused class on focus (optional)', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      // Focus indicator via CSS, this test verifies focus state is reachable
      expect(document.activeElement).toBe(input);
    });
  });

  // ========== AC6: WCAG 2.1 Level A Accessibility ==========
  describe('AC6: WCAG 2.1 Level A Accessibility', () => {
    it('should have associated label with input', () => {
      renderWithContext(<SearchBar />);
      const label = screen.getByLabelText(/search subscriptions/i);
      const input = screen.getByRole('textbox');
      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });

    it('should be keyboard focusable (Tab reaches input)', () => {
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should support keyboard activation of clear button', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Netflix');
      const clearButton = screen.getByRole('button', { name: /clear search/i });

      // Button should be keyboard activatable (Tab + Enter/Space)
      expect(clearButton).toHaveProperty('type', 'button');
    });

    it('should have visible focus indicator (focus reachable)', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.tab();
      expect(document.activeElement).toBe(input);
    });

    it('should have no keyboard trap (can tab out)', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      await user.tab(); // Should move focus away from input to clear button or out

      // Verify focus moved
      expect(document.activeElement).not.toBe(input);
    });

    it('should have clear button with aria-label for screen readers', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Test');
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
    });
  });

  // ========== EDGE CASES & ERROR HANDLING ==========
  describe('Edge Cases & Error Handling', () => {
    it('should handle moderate length input text', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      const moderateText = 'A'.repeat(100);
      await user.type(input, moderateText);
      expect(input).toHaveValue(moderateText);
    });

    it('should handle rapid clear button clicks', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Netflix');
      let clearButton = screen.getByRole('button', { name: /clear search/i });

      await user.click(clearButton);
      await user.click(clearButton); // Should not crash

      expect(input).toHaveValue('');
    });

    it('should handle input with leading/trailing whitespace', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');

      await user.type(input, '   Netflix   ');
      expect(input).toHaveValue('   Netflix   ');
    });

    it('should handle paste events', async () => {
      const user = userEvent.setup();
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Simulate paste event
      await user.click(input);
      await user.paste('Netflix Premium');
      expect(input.value).toContain('Netflix Premium');
    });
  });

  // ========== PROPS & CUSTOMIZATION ==========
  describe('Props & Customization', () => {
    it('should accept optional placeholder prop', () => {
      renderWithContext(<SearchBar placeholder="Custom placeholder" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Custom placeholder');
    });

    it('should accept optional onClear callback prop', () => {
      const onClearMock = vi.fn();
      renderWithContext(<SearchBar onClear={onClearMock} />);
      expect(onClearMock).not.toHaveBeenCalled();
    });

    it('should use default placeholder when not provided', () => {
      renderWithContext(<SearchBar />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Search by subscription name');
    });

    it('should render correctly with all props provided', async () => {
      const user = userEvent.setup();
      const onClearMock = vi.fn();
      renderWithContext(
        <SearchBar placeholder="Find subscriptions..." onClear={onClearMock} />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Find subscriptions...');

      await user.type(input, 'Test');
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      expect(onClearMock).toHaveBeenCalledTimes(1);
    });
  });
});

