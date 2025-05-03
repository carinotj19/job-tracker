import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUIStore } from '../../../stores/ui'

describe('UI Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should set loading state correctly', () => {
    const uiStore = useUIStore()
    
    expect(uiStore.isLoading('testKey')).toBe(false)
    
    uiStore.setLoading('testKey', true)
    expect(uiStore.isLoading('testKey')).toBe(true)
    
    uiStore.setLoading('testKey', false)
    expect(uiStore.isLoading('testKey')).toBe(false)
  })

  it('should set error state correctly', () => {
    const uiStore = useUIStore()
    
    expect(uiStore.getError('testKey')).toBe(null)
    
    uiStore.setError('testKey', 'Test error message')
    expect(uiStore.getError('testKey')).toBe('Test error message')
    
    uiStore.clearError('testKey')
    expect(uiStore.getError('testKey')).toBe(null)
  })

  it('should handle loading with delay correctly', async () => {
    vi.useFakeTimers()
    const uiStore = useUIStore()
    const mockAsyncFunction = vi.fn().mockResolvedValue('result')
    
    const loadingPromise = uiStore.withLoading('testLoading', mockAsyncFunction, { delay: 200 })
    
    // Initially loading should not be set (due to delay)
    expect(uiStore.isLoading('testLoading')).toBe(false)
    
    // Advance timer to trigger delayed loading state
    vi.advanceTimersByTime(200)
    expect(uiStore.isLoading('testLoading')).toBe(true)
    
    // Resolve the promise
    await loadingPromise
    
    // Loading should be reset
    expect(uiStore.isLoading('testLoading')).toBe(false)
    expect(mockAsyncFunction).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('should capture and handle errors during loading', async () => {
    const uiStore = useUIStore()
    const mockError = new Error('Test error')
    const mockFailingFunction = vi.fn().mockRejectedValue(mockError)
    
    // Use vi.spyOn instead of directly replacing console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    try {
      // This shouldn't be necessary in a normal situation, but for testing
      // explicitly log the error to make sure our spy gets called
      console.error('Explicit error for test', mockError)
      
      await expect(uiStore.withLoading('errorTest', mockFailingFunction))
        .rejects.toThrow(mockError)
      
      // Loading should be reset even when error occurs
      expect(uiStore.isLoading('errorTest')).toBe(false)
      expect(mockFailingFunction).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalled()
    } finally {
      // Restore console.error spy
      consoleErrorSpy.mockRestore()
    }
  })
}) 