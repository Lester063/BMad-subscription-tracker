/**
 * Vitest Global Setup File
 * 
 * This file runs once before all tests. It registers @testing-library/jest-dom matchers
 * globally, enabling assertions like:
 * - toBeInTheDocument()
 * - toHaveAttribute()
 * - toHaveTextContent()
 * - toBeVisible()
 * - toHaveAccessibleName()
 * 
 * Without this setup, tests will fail with: "Invalid Chai property: toBeInTheDocument"
 * 
 * Configuration: vitest.config.ts → test.setupFiles: ['./vitest.setup.ts']
 * 
 * Reference: https://github.com/testing-library/jest-dom
 */
import '@testing-library/jest-dom';
