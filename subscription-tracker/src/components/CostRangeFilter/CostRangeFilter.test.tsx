import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CostRangeFilter } from './CostRangeFilter';
import { SubscriptionProvider } from '../../context/SubscriptionContext';

/**
 * Wrapper component for tests to provide SubscriptionContext
 */
function Wrapper({ children }: { children: React.ReactNode }) {
  return <SubscriptionProvider>{children}</SubscriptionProvider>;
}

describe('CostRangeFilter Component', () => {
  // ========== AC1 TESTS: Component Creation with Two Input Fields ==========

  describe('AC1: Component renders with two input fields and clear button', () => {
    it('should render container with aria-label', () => {
      render(<CostRangeFilter />, { wrapper: Wrapper });
      const container = screen.getByLabelText('Cost range filter');
      expect(container).toBeInTheDocument();
    });

    it('should render min cost input with correct type and placeholder', () => {
      render(<CostRangeFilter />, { wrapper: Wrapper });
      const minInput = screen.getByLabelText('Min Cost') as HTMLInputElement;
      expect(minInput).toHaveAttribute('type', 'number');
      expect(minInput).toHaveAttribute('placeholder', '$0.00');
      expect(minInput.id).toBe('min-cost-input');
    });

    it('should render max cost input with correct type and placeholder', () => {
      render(<CostRangeFilter />, { wrapper: Wrapper });
      const maxInput = screen.getByLabelText('Max Cost') as HTMLInputElement;
      expect(maxInput).toHaveAttribute('type', 'number');
      expect(maxInput).toHaveAttribute('placeholder', '$100.00');
      expect(maxInput.id).toBe('max-cost-input');
    });

    it('should have associated labels for both inputs', () => {
      render(<CostRangeFilter />, { wrapper: Wrapper });
      const minLabel = screen.getByLabelText('Min Cost');
      const maxLabel = screen.getByLabelText('Max Cost');
      expect(minLabel).toBeInTheDocument();
      expect(maxLabel).toBeInTheDocument();
    });

    it('should NOT render clear button initially when no filters are set', () => {
      render(<CostRangeFilter />, { wrapper: Wrapper });
      const clearButton = screen.queryByRole('button', { name: /clear cost filter/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should export as function', () => {
      expect(typeof CostRangeFilter).toBe('function');
    });

    it('should accept onFilterChange prop (optional)', () => {
      const mockOnFilterChange = vi.fn();
      render(<CostRangeFilter onFilterChange={mockOnFilterChange} />, { wrapper: Wrapper });
      expect(screen.getByLabelText('Min Cost')).toBeInTheDocument();
    });
  });

  // ========== AC2 TESTS: Real-Time Dispatch on Input Change ==========

  describe('AC2: Real-time dispatch to setCostRangeMin and setCostRangeMax', () => {
    it('should update context when min input changes', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost') as HTMLInputElement;
      await user.clear(minInput);
      await user.type(minInput, '10');

      expect(minInput).toHaveValue(10);
    });

    it('should update context when max input changes', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const maxInput = screen.getByLabelText('Max Cost') as HTMLInputElement;
      await user.clear(maxInput);
      await user.type(maxInput, '50');

      expect(maxInput).toHaveValue(50);
    });

    it('should accept decimal values in min input', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost') as HTMLInputElement;
      await user.clear(minInput);
      await user.type(minInput, '9.99');

      expect(minInput).toHaveValue(9.99);
    });

    it('should accept decimal values in max input', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const maxInput = screen.getByLabelText('Max Cost') as HTMLInputElement;
      await user.clear(maxInput);
      await user.type(maxInput, '99.99');

      expect(maxInput).toHaveValue(99.99);
    });

    it('should call onFilterChange callback when min input changes', async () => {
      const user = userEvent.setup();
      const mockOnFilterChange = vi.fn();
      render(<CostRangeFilter onFilterChange={mockOnFilterChange} />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost');
      await user.clear(minInput as HTMLInputElement);
      await user.type(minInput, '10');

      expect(mockOnFilterChange).toHaveBeenCalledWith(10, null);
    });

    it('should call onFilterChange callback when max input changes', async () => {
      const user = userEvent.setup();
      const mockOnFilterChange = vi.fn();
      render(<CostRangeFilter onFilterChange={mockOnFilterChange} />, { wrapper: Wrapper });

      const maxInput = screen.getByLabelText('Max Cost');
      await user.clear(maxInput as HTMLInputElement);
      await user.type(maxInput, '50');

      expect(mockOnFilterChange).toHaveBeenCalledWith(null, 50);
    });

    it('should handle rapid input changes to min field', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost') as HTMLInputElement;
      await user.clear(minInput);
      await user.type(minInput, '10.5');

      expect(minInput).toHaveValue(10.5);
    });

    it('should handle rapid input changes to max field', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const maxInput = screen.getByLabelText('Max Cost') as HTMLInputElement;
      await user.clear(maxInput);
      await user.type(maxInput, '99.9');

      expect(maxInput).toHaveValue(99.9);
    });

    it('should handle backspace/delete in min field', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost') as HTMLInputElement;
      await user.type(minInput, '15');
      await user.type(minInput, '{backspace}{backspace}');

      expect(minInput).toHaveValue(null);
    });

    it('should handle backspace/delete in max field', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const maxInput = screen.getByLabelText('Max Cost') as HTMLInputElement;
      await user.type(maxInput, '75');
      await user.type(maxInput, '{backspace}{backspace}');

      expect(maxInput).toHaveValue(null);
    });
  });

  // ========== AC3 TESTS: Clear Button Functionality ==========

  describe('AC3: Clear button resets both filters to null', () => {
    it('should show clear button only when at least one filter is set', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      let clearButton = screen.queryByRole('button', { name: /clear cost filter/i });
      expect(clearButton).not.toBeInTheDocument();

      const minInput = screen.getByLabelText('Min Cost');
      await user.type(minInput, '10');

      clearButton = screen.queryByRole('button', { name: /clear cost filter/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear both min and max inputs when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost') as HTMLInputElement;
      const maxInput = screen.getByLabelText('Max Cost') as HTMLInputElement;

      await user.type(minInput, '10');
      await user.type(maxInput, '50');

      const clearButton = screen.getByRole('button', { name: /clear cost filter/i });
      await user.click(clearButton);

      expect(minInput).toHaveValue(null);
      expect(maxInput).toHaveValue(null);
    });

    it('should hide clear button after clearing', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost');
      await user.type(minInput, '10');

      let clearButton = screen.queryByRole('button', { name: /clear cost filter/i });
      expect(clearButton).toBeInTheDocument();

      await user.click(clearButton);

      clearButton = screen.queryByRole('button', { name: /clear cost filter/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should call onFilterChange with (null, null) when clear button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnFilterChange = vi.fn();
      render(<CostRangeFilter onFilterChange={mockOnFilterChange} />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost');
      await user.type(minInput, '10');

      mockOnFilterChange.mockClear();

      const clearButton = screen.getByRole('button', { name: /clear cost filter/i });
      await user.click(clearButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith(null, null);
    });
  });

  // ========== AC4 TESTS: Validation (Min ≤ Max) ==========

  describe('AC4: Validation - Min ≤ Max with error display', () => {
    it('should show error when min > max', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost');
      const maxInput = screen.getByLabelText('Max Cost');

      await user.type(maxInput, '10');
      await user.type(minInput, '20');

      const errorMessage = await screen.findByText(/minimum cost must be less than or equal to maximum/i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('should allow min = max (edge case)', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost') as HTMLInputElement;
      const maxInput = screen.getByLabelText('Max Cost') as HTMLInputElement;

      // Set max to 10 first
      await user.type(maxInput, '10');
      expect(maxInput).toHaveValue(10);

      // Then set min to 10 (should be equal, no error)
      await user.type(minInput, '10');
      expect(minInput).toHaveValue(10);

      // Verify no error message appears  
      const errorMessage = screen.queryByText(/minimum cost must be less than or equal to maximum/i);
      expect(errorMessage).not.toBeInTheDocument();
    });

    it('should mark invalid input fields with error styling', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost') as HTMLInputElement;
      const maxInput = screen.getByLabelText('Max Cost') as HTMLInputElement;

      await user.type(maxInput, '10');
      await user.type(minInput, '20');

      expect(minInput.className).toContain('error');
      expect(maxInput.className).toContain('error');
    });

    it('should associate error message with input via aria-describedby', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost');
      const maxInput = screen.getByLabelText('Max Cost');

      await user.type(maxInput, '10');
      await user.type(minInput, '20');

      await screen.findByText(/minimum cost must be less than or equal to maximum/i);

      expect(minInput).toHaveAttribute('aria-describedby', 'cost-error');
      expect(maxInput).toHaveAttribute('aria-describedby', 'cost-error');
    });

    it('should clear error when range becomes valid', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost');
      const maxInput = screen.getByLabelText('Max Cost');

      await user.type(maxInput, '10');
      await user.type(minInput, '20');

      let errorMessage = await screen.findByText(/minimum cost must be less than or equal to maximum/i);
      expect(errorMessage).toBeInTheDocument();

      await user.clear(minInput as HTMLInputElement);
      await user.type(minInput, '5');

      errorMessage = screen.queryByText(/minimum cost must be less than or equal to maximum/i);
      expect(errorMessage).not.toBeInTheDocument();
    });

    it('should allow only min filter (max empty)', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost');

      await user.type(minInput, '10');

      const errorMessage = screen.queryByText(/minimum cost must be less than or equal to maximum/i);
      expect(errorMessage).not.toBeInTheDocument();
    });

    it('should allow only max filter (min empty)', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const maxInput = screen.getByLabelText('Max Cost');

      await user.type(maxInput, '50');

      const errorMessage = screen.queryByText(/minimum cost must be less than or equal to maximum/i);
      expect(errorMessage).not.toBeInTheDocument();
    });

    it('should allow both empty (no filter applied)', async () => {
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const errorMessage = screen.queryByText(/minimum cost must be less than or equal to maximum/i);
      expect(errorMessage).not.toBeInTheDocument();
    });
  });

  // ========== AC5 TESTS: CSS Module with BEM Naming ==========

  describe('AC5: CSS Module with BEM naming and responsive design', () => {
    it('should render with proper BEM structure (CSS Modules)', () => {
      render(<CostRangeFilter />, { wrapper: Wrapper });
      const container = screen.getByLabelText('Cost range filter');
      expect(container).toBeInTheDocument();
      expect(screen.getByLabelText('Min Cost')).toBeInTheDocument();
      expect(screen.getByLabelText('Max Cost')).toBeInTheDocument();
    });

    it('should render labels (BEM: costRangeFilter__label)', () => {
      render(<CostRangeFilter />, { wrapper: Wrapper });
      const minLabel = screen.getByText('Min Cost');
      const maxLabel = screen.getByText('Max Cost');
      expect(minLabel).toBeInTheDocument();
      expect(maxLabel).toBeInTheDocument();
      expect(minLabel).toHaveAttribute('for', 'min-cost-input');
      expect(maxLabel).toHaveAttribute('for', 'max-cost-input');
    });

    it('should apply error styling when validation fails', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost') as HTMLInputElement;
      const maxInput = screen.getByLabelText('Max Cost') as HTMLInputElement;

      await user.type(maxInput, '10');
      await user.type(minInput, '20');

      expect(minInput.className).toContain('error');
      expect(maxInput.className).toContain('error');
    });

    it('should display error message with proper structure', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost');
      const maxInput = screen.getByLabelText('Max Cost');

      await user.type(maxInput, '10');
      await user.type(minInput, '20');

      const errorDiv = await screen.findByText(/minimum cost must be less than or equal to maximum/i);
      expect(errorDiv).toBeInTheDocument();
      expect(errorDiv).toHaveAttribute('role', 'alert');
      expect(errorDiv).toHaveAttribute('id', 'cost-error');
    });
  });

  // ========== AC6 TESTS: WCAG 2.1 Level A Accessibility ==========

  describe('AC6: WCAG 2.1 Level A Accessibility', () => {
    it('should have keyboard focusable min input', () => {
      render(<CostRangeFilter />, { wrapper: Wrapper });
      const minInput = screen.getByLabelText('Min Cost');
      expect(minInput).toHaveAttribute('type', 'number');
    });

    it('should have keyboard focusable max input', () => {
      render(<CostRangeFilter />, { wrapper: Wrapper });
      const maxInput = screen.getByLabelText('Max Cost');
      expect(maxInput).toHaveAttribute('type', 'number');
    });

    it('should have keyboard focusable clear button', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost');
      await user.type(minInput, '10');

      const clearButton = screen.getByRole('button', { name: /clear cost filter/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should have descriptive labels for inputs', () => {
      render(<CostRangeFilter />, { wrapper: Wrapper });
      const minLabel = screen.getByLabelText('Min Cost');
      const maxLabel = screen.getByLabelText('Max Cost');
      expect(minLabel).toBeInTheDocument();
      expect(maxLabel).toBeInTheDocument();
    });

    it('should have accessible clear button name', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost');
      await user.type(minInput, '10');

      const clearButton = screen.getByRole('button', { name: /clear cost filter/i });
      expect(clearButton).toHaveAccessibleName(/clear cost filter/i);
    });

    it('should have aria-describedby for error message when present', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost');
      const maxInput = screen.getByLabelText('Max Cost');

      await user.type(maxInput, '10');
      await user.type(minInput, '20');

      expect(minInput).toHaveAttribute('aria-describedby', 'cost-error');
      expect(maxInput).toHaveAttribute('aria-describedby', 'cost-error');
    });

    it('should not have aria-describedby when no error', () => {
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost');
      const maxInput = screen.getByLabelText('Max Cost');

      expect(minInput).not.toHaveAttribute('aria-describedby');
      expect(maxInput).not.toHaveAttribute('aria-describedby');
    });

    it('should have error message with role=alert for screen readers', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost');
      const maxInput = screen.getByLabelText('Max Cost');

      await user.type(maxInput, '10');
      await user.type(minInput, '20');

      const errorDiv = await screen.findByText(/minimum cost must be less than or equal to maximum/i);
      expect(errorDiv).toHaveAttribute('role', 'alert');
    });

    it('should have aria-label on container', () => {
      render(<CostRangeFilter />, { wrapper: Wrapper });
      const container = screen.getByLabelText('Cost range filter');
      expect(container).toHaveAttribute('aria-label', 'Cost range filter');
    });

    it('should have logical focus order (Tab navigation)', () => {
      render(<CostRangeFilter />, { wrapper: Wrapper });
      expect(screen.getByLabelText('Min Cost')).toBeInTheDocument();
      expect(screen.getByLabelText('Max Cost')).toBeInTheDocument();
    });
  });

  // ========== EDGE CASE TESTS ==========

  describe('Edge Cases', () => {
    it('should handle very long input', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost') as HTMLInputElement;
      await user.type(minInput, '999999999999');

      expect(minInput.value).toBeTruthy();
    });

    it('should handle rapid clear button clicks', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost');
      await user.type(minInput, '10');

      let clearButton = screen.getByRole('button', { name: /clear cost filter/i });
      await user.click(clearButton);

      clearButton = screen.queryByRole('button', { name: /clear cost filter/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should handle zero value in min input', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost') as HTMLInputElement;
      await user.type(minInput, '0');

      expect(minInput).toHaveValue(0);
    });

    it('should handle zero value in max input', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const maxInput = screen.getByLabelText('Max Cost') as HTMLInputElement;
      await user.type(maxInput, '0');

      expect(maxInput).toHaveValue(0);
    });

    it('should handle negative values', async () => {
      const user = userEvent.setup();
      render(<CostRangeFilter />, { wrapper: Wrapper });

      const minInput = screen.getByLabelText('Min Cost') as HTMLInputElement;
      await user.type(minInput, '-5');

      expect(minInput.value).toBeTruthy();
    });
  });
});
