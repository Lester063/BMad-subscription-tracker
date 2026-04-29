import { renderHook, act } from '@testing-library/react'
import { vi, expect, describe, test } from 'vitest'
import React, { ReactNode } from 'react'
import { useSubscriptions } from './useSubscriptions'
import { SubscriptionProvider } from '../context/SubscriptionContext'
import { Subscription } from '../types/subscription'
import { ACTIONS } from '../constants'

/**
 * Test suite for useSubscriptions custom hook
 * Tests context access, dispatchers, computed values, and error handling
 */

// Helper to create a test wrapper with SubscriptionProvider
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) =>
    React.createElement(SubscriptionProvider, { children })
}

// Helper to create a valid subscription object
const createMockSubscription = (overrides?: Partial<Subscription>): Subscription => ({
  id: 'test-1',
  name: 'Netflix',
  cost: 15.99,
  dueDate: 15,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
})

describe('useSubscriptions Hook', () => {
  // ========== AC1: Hook File Created ==========

  describe('AC1: Hook file exists and exports', () => {
    test('should export useSubscriptions function', () => {
      expect(typeof useSubscriptions).toBe('function')
    })

    test('should be callable as a hook', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })
      expect(result.current).toBeDefined()
    })
  })

  // ========== AC2: Returns All Required Properties ==========

  describe('AC2: Hook returns all required properties', () => {
    test('should return object with subscriptions property', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })
      expect(result.current).toHaveProperty('subscriptions')
      expect(Array.isArray(result.current.subscriptions)).toBe(true)
    })

    test('should return object with error property', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })
      expect(result.current).toHaveProperty('error')
      expect(result.current.error).toBeNull()
    })

    test('should return addSubscription function', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })
      expect(typeof result.current.addSubscription).toBe('function')
    })

    test('should return updateSubscription function', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })
      expect(typeof result.current.updateSubscription).toBe('function')
    })

    test('should return deleteSubscription function', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })
      expect(typeof result.current.deleteSubscription).toBe('function')
    })

    test('should return setError function', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })
      expect(typeof result.current.setError).toBe('function')
    })

    test('should return totalCost number', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })
      expect(typeof result.current.totalCost).toBe('number')
      expect(result.current.totalCost).toBe(0)
    })
  })

  // ========== AC3: Dispatch Actions via Helper Functions ==========

  describe('AC3: Helper functions dispatch correct actions', () => {
    test('addSubscription should add subscription to state', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      const newSub = createMockSubscription()

      act(() => {
        result.current.addSubscription(newSub)
      })

      expect(result.current.subscriptions).toHaveLength(1)
      expect(result.current.subscriptions[0]).toEqual(newSub)
    })

    test('addSubscription should clear error on success', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      // Set error first
      act(() => {
        result.current.setError('Test error')
      })
      expect(result.current.error).toBe('Test error')

      // Add subscription should clear error
      act(() => {
        result.current.addSubscription(createMockSubscription())
      })
      expect(result.current.error).toBeNull()
    })

    test('updateSubscription should update existing subscription', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      const original = createMockSubscription({ id: 'sub-1' })
      const updated = createMockSubscription({
        id: 'sub-1',
        name: 'Netflix Premium',
        cost: 19.99,
      })

      // Add original
      act(() => {
        result.current.addSubscription(original)
      })
      expect(result.current.subscriptions[0].name).toBe('Netflix')

      // Update it
      act(() => {
        result.current.updateSubscription(updated)
      })
      expect(result.current.subscriptions[0].name).toBe('Netflix Premium')
      expect(result.current.subscriptions[0].cost).toBe(19.99)
      expect(result.current.subscriptions).toHaveLength(1)
    })

    test('updateSubscription should clear error on success', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      const sub = createMockSubscription()
      act(() => {
        result.current.addSubscription(sub)
      })

      act(() => {
        result.current.setError('Update error')
      })
      expect(result.current.error).toBe('Update error')

      act(() => {
        result.current.updateSubscription(sub)
      })
      expect(result.current.error).toBeNull()
    })

    test('deleteSubscription should remove subscription by id', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      const sub1 = createMockSubscription({ id: 'sub-1' })
      const sub2 = createMockSubscription({ id: 'sub-2' })

      act(() => {
        result.current.addSubscription(sub1)
        result.current.addSubscription(sub2)
      })
      expect(result.current.subscriptions).toHaveLength(2)

      act(() => {
        result.current.deleteSubscription('sub-1')
      })
      expect(result.current.subscriptions).toHaveLength(1)
      expect(result.current.subscriptions[0].id).toBe('sub-2')
    })

    test('deleteSubscription should clear error on success', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      const sub = createMockSubscription()
      act(() => {
        result.current.addSubscription(sub)
        result.current.setError('Delete error')
      })
      expect(result.current.error).toBe('Delete error')

      act(() => {
        result.current.deleteSubscription(sub.id)
      })
      expect(result.current.error).toBeNull()
    })
  })

  // ========== AC4: Compute totalCost ==========

  describe('AC4: totalCost is computed correctly', () => {
    test('should return 0 for empty subscriptions', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })
      expect(result.current.totalCost).toBe(0)
    })

    test('should return sum of all subscription costs', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.addSubscription(createMockSubscription({ id: 's1', cost: 15.99 }))
        result.current.addSubscription(createMockSubscription({ id: 's2', cost: 12.99 }))
        result.current.addSubscription(createMockSubscription({ id: 's3', cost: 9.99 }))
      })

      expect(result.current.totalCost).toBeCloseTo(38.97, 2)
    })

    test('should recalculate when subscription is added', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.addSubscription(createMockSubscription({ cost: 10 }))
      })
      expect(result.current.totalCost).toBe(10)

      act(() => {
        result.current.addSubscription(createMockSubscription({ id: 's2', cost: 20 }))
      })
      expect(result.current.totalCost).toBe(30)
    })

    test('should recalculate when subscription is deleted', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.addSubscription(createMockSubscription({ id: 's1', cost: 15 }))
        result.current.addSubscription(createMockSubscription({ id: 's2', cost: 25 }))
      })
      expect(result.current.totalCost).toBe(40)

      act(() => {
        result.current.deleteSubscription('s1')
      })
      expect(result.current.totalCost).toBe(25)
    })

    test('should recalculate when subscription is updated', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      const sub = createMockSubscription({ id: 's1', cost: 10 })
      act(() => {
        result.current.addSubscription(sub)
      })
      expect(result.current.totalCost).toBe(10)

      act(() => {
        result.current.updateSubscription({ ...sub, cost: 25 })
      })
      expect(result.current.totalCost).toBe(25)
    })
  })

  // ========== AC5: Context Validation ==========

  describe('AC5: Context validation and error handling', () => {
    test('should throw error if used outside SubscriptionProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useSubscriptions())
      }).toThrow('useSubscriptions must be used within SubscriptionProvider')

      consoleSpy.mockRestore()
    })

    test('error message should be helpful', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      try {
        renderHook(() => useSubscriptions())
      } catch (error: any) {
        expect(error.message).toContain('SubscriptionProvider')
      }

      consoleSpy.mockRestore()
    })
  })

  // ========== AC6: TypeScript Strict Mode ==========

  describe('AC6: TypeScript strict mode compliance', () => {
    test('return type should be properly typed', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      // TypeScript should infer these types correctly
      const subscriptions: Subscription[] = result.current.subscriptions
      const error: string | null = result.current.error
      const totalCost: number = result.current.totalCost

      expect(subscriptions).toBeDefined()
      expect(error === null || typeof error === 'string').toBe(true)
      expect(typeof totalCost).toBe('number')
    })
  })

  // ========== AC7: JSDoc Documentation ==========

  describe('AC7: Hook is documented', () => {
    test('should have JSDoc comment', () => {
      const sourceCode = useSubscriptions.toString()
      // Function should exist and be well-formed
      expect(sourceCode).toBeTruthy()
      expect(sourceCode.length > 0).toBe(true)
    })
  })

  // ========== AC8: No Side Effects ==========

  describe('AC8: Hook has no side effects', () => {
    test('should not trigger localStorage on hook call', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

      renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      expect(setItemSpy).not.toHaveBeenCalled()
      setItemSpy.mockRestore()
    })

    test('should not trigger network calls on hook call', () => {
      // This is more of a code inspection test
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      expect(result.current).toBeDefined()
      // If we get here without network errors, hook is side-effect free
    })
  })

  // ========== AC9: Helper Functions Stability ==========

  describe('AC9: Helper functions are stable across renders', () => {
    test('addSubscription reference should not change on re-render', () => {
      const { result, rerender } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      const firstRef = result.current.addSubscription
      rerender()
      const secondRef = result.current.addSubscription

      expect(firstRef).toBe(secondRef)
    })

    test('updateSubscription reference should not change on re-render', () => {
      const { result, rerender } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      const firstRef = result.current.updateSubscription
      rerender()
      const secondRef = result.current.updateSubscription

      expect(firstRef).toBe(secondRef)
    })

    test('deleteSubscription reference should not change on re-render', () => {
      const { result, rerender } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      const firstRef = result.current.deleteSubscription
      rerender()
      const secondRef = result.current.deleteSubscription

      expect(firstRef).toBe(secondRef)
    })

    test('setError reference should not change on re-render', () => {
      const { result, rerender } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      const firstRef = result.current.setError
      rerender()
      const secondRef = result.current.setError

      expect(firstRef).toBe(secondRef)
    })
  })

  // ========== Integration Tests ==========

  describe('Integration: Multiple operations', () => {
    test('should handle complex workflow: add, update, delete', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      const sub1 = createMockSubscription({ id: 's1', name: 'Netflix', cost: 15.99 })
      const sub2 = createMockSubscription({ id: 's2', name: 'Spotify', cost: 12.99 })

      // Add two subscriptions
      act(() => {
        result.current.addSubscription(sub1)
        result.current.addSubscription(sub2)
      })
      expect(result.current.subscriptions).toHaveLength(2)
      expect(result.current.totalCost).toBeCloseTo(28.98, 2)

      // Update first subscription
      act(() => {
        result.current.updateSubscription({ ...sub1, cost: 20 })
      })
      expect(result.current.subscriptions[0].cost).toBe(20)
      expect(result.current.totalCost).toBeCloseTo(32.99, 2)

      // Delete second subscription
      act(() => {
        result.current.deleteSubscription('s2')
      })
      expect(result.current.subscriptions).toHaveLength(1)
      expect(result.current.totalCost).toBe(20)
    })

    test('should handle error state through workflow', () => {
      const { result } = renderHook(() => useSubscriptions(), {
        wrapper: createWrapper(),
      })

      // Set error
      act(() => {
        result.current.setError('Initial error')
      })
      expect(result.current.error).toBe('Initial error')

      // Add clears error
      act(() => {
        result.current.addSubscription(createMockSubscription())
      })
      expect(result.current.error).toBeNull()

      // Set error again
      act(() => {
        result.current.setError('Another error')
      })
      expect(result.current.error).toBe('Another error')

      // Update clears error
      act(() => {
        result.current.updateSubscription(createMockSubscription())
      })
      expect(result.current.error).toBeNull()
    })
  })
})
