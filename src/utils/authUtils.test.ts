import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getAccessToken,
  setAccessToken,
  getUsername,
  setUsername,
  validateAccessToken,
  refreshTokens
} from './authUtils'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock fetch
global.fetch = vi.fn()

describe('authUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getAccessToken', () => {
    it('should retrieve access token from localStorage', () => {
      localStorageMock.setItem('access_token', 'test-token-123')
      
      const result = getAccessToken()
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('access_token')
      expect(result).toBe('test-token-123')
    })

    it('should return null if no token exists', () => {
      const result = getAccessToken()
      
      expect(result).toBeNull()
    })
  })

  describe('setAccessToken', () => {
    it('should store access token in localStorage', () => {
      setAccessToken('new-token-456')
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'new-token-456')
    })

    it('should handle empty token', () => {
      setAccessToken('')
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', '')
    })
  })

  describe('getUsername', () => {
    it('should retrieve username from localStorage', () => {
      localStorageMock.setItem('username', 'Test User')
      
      const result = getUsername()
      
      expect(result).toBe('Test User')
    })

    it('should return default username if not set', () => {
      const result = getUsername()
      
      expect(result).toBe('Nanny User')
    })
  })

  describe('setUsername', () => {
    it('should store username in localStorage', () => {
      setUsername('John Doe')
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('username', 'John Doe')
    })
  })

  describe('validateAccessToken', () => {
    it('should return false if no token exists', async () => {
      const result = await validateAccessToken()
      
      expect(result).toBe(false)
    })

    it('should return true for valid token', async () => {
      localStorageMock.setItem('access_token', 'valid-token')
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200
      } as Response)
      
      const result = await validateAccessToken()
      
      expect(result).toBe(true)
    })

    it('should return false for invalid token', async () => {
      localStorageMock.setItem('access_token', 'invalid-token')
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401
      } as Response)
      
      const result = await validateAccessToken()
      
      expect(result).toBe(false)
    })

    it('should handle network errors', async () => {
      localStorageMock.setItem('access_token', 'test-token')
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))
      
      const result = await validateAccessToken()
      
      expect(result).toBe(false)
    })
  })

  describe('refreshTokens', () => {
    it('should return true on successful token refresh', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: 'new-token' })
      } as Response)
      
      const result = await refreshTokens()
      
      expect(result).toBe(true)
    })

    it('should return false on failed token refresh', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401
      } as Response)
      
      const result = await refreshTokens()
      
      expect(result).toBe(false)
    })

    it('should handle network errors during refresh', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))
      
      const result = await refreshTokens()
      
      expect(result).toBe(false)
    })
  })

})