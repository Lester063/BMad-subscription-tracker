# Blind Hunter Prompt

You are a Blind Hunter adversarial reviewer. You have ONLY the diff below. You MUST NOT use any project spec, story file, or additional context.

Review this diff with an adversarial mindset. Identify bugs, risky assumptions, incorrect logic, missing error handling, invalid React patterns, accessibility regressions, styling issues, and test defects visible from the diff alone.

Output findings as a Markdown list. Each finding should include:
- one-line title
- evidence from the diff
- the affected file(s)

---

## Diff

+import React, { useCallback, useState } from 'react';
+import { useSubscriptions } from '../../hooks/useSubscriptions';
+import styles from './CostRangeFilter.module.css';
+
+/**
+ * Props for CostRangeFilter component
+ */
+export interface CostRangeFilterProps {
+  /** Optional callback when filter values change; called with (min, max) after valid changes */
+  onFilterChange?: (min: number | null, max: number | null) => void;
+}
+
+/**
+ * CostRangeFilter Component
+ *
+ * Two-input filter for minimum and maximum subscription costs.
+ * Dispatches SET_COST_RANGE_MIN and SET_COST_RANGE_MAX actions on every change.
+ *
+ * Features:
+ * - Real-time filter dispatch (no debounce)
+ * - Validation: min ≤ max (shows error if invalid)
+ * - Clear button to reset both filters to null
+ * - Keyboard accessible (WCAG 2.1 Level A)
+ * - Screen reader support with aria-describedby for errors
+ * - CSS Modules with BEM naming
+ *
+ * @param {CostRangeFilterProps} props - Component props
+ * @returns {React.ReactElement} Rendered CostRangeFilter component
+ *
+ * @example
+ * ```tsx
+ * <CostRangeFilter
+ *   onFilterChange={(min, max) => console.log(`Filter: $${min ?? 0}-$${max ?? 999}`)}
+ * />
+ * ```
+ */
+export function CostRangeFilter({ onFilterChange }: CostRangeFilterProps): React.ReactElement {
+  const { searchState, setCostRangeMin, setCostRangeMax } = useSubscriptions();
+  const [validationError, setValidationError] = useState<string | null>(null);
+
+  /**
+   * Handler for min input change
+   * Dispatches new min value after validation
+   */
+  const handleMinChange = useCallback(
+    (event: React.ChangeEvent<HTMLInputElement>) => {
+      try {
+        const value = event.target.value === '' ? null : parseFloat(event.target.value);
+
+        // Validate against current max value
+        if (value !== null && searchState.costRangeMax !== null && value > searchState.costRangeMax) {
+          setValidationError('Minimum cost must be less than or equal to maximum');
+        } else {
+          setValidationError(null);
+          setCostRangeMin(value);
+          onFilterChange?.(value, searchState.costRangeMax);
+        }
+      } catch (error) {
+        console.error('Error updating min cost:', error);
+      }
+    },
+    [setCostRangeMin, searchState.costRangeMax, onFilterChange]
+  );
+
+  /**
+   * Handler for max input change
+   * Dispatches new max value after validation
+   */
+  const handleMaxChange = useCallback(
+    (event: React.ChangeEvent<HTMLInputElement>) => {
+      try {
+        const value = event.target.value === '' ? null : parseFloat(event.target.value);
+
+        // Validate against current min value
+        if (searchState.costRangeMin !== null && value !== null && searchState.costRangeMin > value) {
+          setValidationError('Minimum cost must be less than or equal to maximum');
+        } else {
+          setValidationError(null);
+          setCostRangeMax(value);
+          onFilterChange?.(searchState.costRangeMin, value);
+        }
+      } catch (error) {
+        console.error('Error updating max cost:', error);
+      }
+    },
+    [setCostRangeMax, searchState.costRangeMin, onFilterChange]
+  );
+
+  /**
+   * Handler for clear button click
+   * Resets both filters to null
+   */
+  const handleClear = useCallback(() => {
+    try {
+      setCostRangeMin(null);
+      setCostRangeMax(null);
+      setValidationError(null);
+      onFilterChange?.(null, null);
+    } catch (error) {
+      console.error('Error clearing filter:', error);
+    }
+  }, [setCostRangeMin, setCostRangeMax, onFilterChange]);
+
+  // Only show clear button if at least one filter is set
+  const showClearButton = searchState.costRangeMin !== null || searchState.costRangeMax !== null;
+
+  return (
+    <div className={styles.costRangeFilter} aria-label="Cost range filter">
+      {/* Min cost input group */}
+      <div className={styles.costRangeFilter__inputGroup}>
+        <label htmlFor="min-cost-input" className={styles.costRangeFilter__label}>
+          Min Cost
+        </label>
+        <input
+          id="min-cost-input"
+          type="number"
+          className={`${styles.costRangeFilter__input} ${
+            validationError ? styles['costRangeFilter__input--error'] : ''
+          }`}
+          value={searchState.costRangeMin ?? ''}
+          onChange={handleMinChange}
+          placeholder="$0.00"
+          inputMode="decimal"
+          aria-describedby={validationError ? 'cost-error' : undefined}
+        />
+      </div>
+
+      {/* Max cost input group */}
+      <div className={styles.costRangeFilter__inputGroup}>
+        <label htmlFor="max-cost-input" className={styles.costRangeFilter__label}>
+          Max Cost
+        </label>
+        <input
+          id="max-cost-input"
+          type="number"
+          className={`${styles.costRangeFilter__input} ${
+            validationError ? styles['costRangeFilter__input--error'] : ''
+          }`}
+          value={searchState.costRangeMax ?? ''}
+          onChange={handleMaxChange}
+          placeholder="$100.00"
+          inputMode="decimal"
+          aria-describedby={validationError ? 'cost-error' : undefined}
+        />
+      </div>
+
+      {/* Clear button (only visible if filter is set) */}
+      {showClearButton && (
+        <button
+          type="button"
+          className={styles.costRangeFilter__button}
+          onClick={handleClear}
+          aria-label="Clear cost filter"
+          title="Clear cost range filter"
+        >
+          Clear Filter
+        </button>
+      )}
+
+      {/* Error message */}
+      {validationError && (
+        <div id="cost-error" className={styles.costRangeFilter__error} role="alert">
+          {validationError}
+        </div>
+      )}
+    </div>
+  );
+}
+
+diff --git a/subscription-tracker/src/components/CostRangeFilter/CostRangeFilter.module.css b/subscription-tracker/src/components/CostRangeFilter/CostRangeFilter.module.css
+new file mode 100644
+index 0000000..3ca23c5
+--- /dev/null
++++ b/subscription-tracker/src/components/CostRangeFilter/CostRangeFilter.module.css
+@@ -0,0 +1,216 @@
+/**
+ * CostRangeFilter Component Styles
+ * BEM Naming: .costRangeFilter (block) → __element → --modifier
+ * All colors/spacing use CSS variables from src/styles/variables.css
+ */
+
+/* ========== BLOCK: costRangeFilter (container) ========== */
+.costRangeFilter {
+  display: flex;
+  gap: var(--space-sm);
+  align-items: flex-end;
+  flex-wrap: wrap;
+  width: 100%;
+}
+
+/* ========== ELEMENT: costRangeFilter__inputGroup ========== */
+.costRangeFilter__inputGroup {
+  display: flex;
+  flex-direction: column;
+  gap: var(--space-xs);
+  flex: 1;
+  min-width: 120px;
+}
+
+/* ========== ELEMENT: costRangeFilter__label ========== */
+.costRangeFilter__label {
+  font-size: var(--text-sm);
+  font-weight: var(--font-weight-semibold);
+  color: var(--text);
+  margin: 0;
+  padding: 0;
+}
+
+/* ========== ELEMENT: costRangeFilter__input ========== */
+.costRangeFilter__input {
+  padding: var(--space-sm) 12px;
+  border: 2px solid var(--border);
+  border-radius: var(--radius-sm);
+  font-size: var(--text-base);
+  color: var(--text);
+  background-color: var(--bg);
+  transition: all 150ms ease-in-out;
+  font-family: inherit;
+  width: 100%;
+  box-sizing: border-box;
+}
+
+/* ========== ELEMENT: costRangeFilter__input:focus ========== */
+.costRangeFilter__input:focus {
+  outline: 2px solid var(--primary);
+  outline-offset: 2px;
+  border-color: var(--primary);
+}
+
+/* ========== MODIFIER: costRangeFilter__input--error ========== */
+.costRangeFilter__input--error {
+  border-color: var(--error);
+  background-color: var(--error-light);
+}
+
+/* ========== ELEMENT: costRangeFilter__button ========== */
+.costRangeFilter__button {
+  padding: 8px 16px;
+  border: 1px solid var(--border);
+  background-color: var(--bg-secondary);
+  border-radius: var(--radius-sm);
+  cursor: pointer;
+  font-size: var(--text-base);
+  font-weight: var(--font-weight-semibold);
+  color: var(--text);
+  transition: all 150ms ease-in-out;
+  white-space: nowrap;
+  align-self: flex-end;
+  height: fit-content;
+}
+
+/* ========== RESPONSIVE DESIGN ========== */
+@media (max-width: 1024px) {
+  .costRangeFilter {
+    flex-direction: column;
+    align-items: stretch;
+  }
+
+  .costRangeFilter__button {
+    width: 100%;
+    align-self: auto;
+  }
+}
+
+@media (max-width: 640px) {
+  .costRangeFilter {
+    flex-direction: column;
+    gap: var(--space-sm);
+    align-items: stretch;
+  }
+
+  .costRangeFilter__input {
+    width: 100%;
+  }
+}
+
+diff --git a/subscription-tracker/src/components/CostRangeFilter/CostRangeFilter.test.tsx b/subscription-tracker/src/components/CostRangeFilter/CostRangeFilter.test.tsx
+new file mode 100644
+index 0000000..6c36016
+--- /dev/null
++++ b/subscription-tracker/src/components/CostRangeFilter/CostRangeFilter.test.tsx
+@@ -0,0 +1,572 @@
+/* test file contents omitted for brevity */
