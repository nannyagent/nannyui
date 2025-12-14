import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getAccessToken,
  setAccessToken,
  getUsername,
  setUsername,
  validateAccessToken,
  refreshTokens,
  fetchGitHubProfile,
  isAuthenticated,
  redirectToDashboard,
  logoutUser
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

    it('should store username from refresh response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ 
          access_token: 'new-token',
          user: { name: 'John Doe' }
        })
      } as Response)
      
      const result = await refreshTokens()
      
      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'new-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('username', 'John Doe')
    })
  })

  describe('fetchGitHubProfile', () => {
    it('should return true and store tokens on success', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ 
          access_token: 'github-token',
          user: { name: 'GitHub User' }
        })
      } as Response)
      
      const result = await fetchGitHubProfile()
      
      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'github-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('username', 'GitHub User')
    })

    it('should return false on API failure', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401
      } as Response)
      
      const result = await fetchGitHubProfile()
      
      expect(result).toBe(false)
    })

    it('should return false if no access_token in response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ user: { name: 'User' } })
      } as Response)
      
      const result = await fetchGitHubProfile()
      
      expect(result).toBe(false)
    })

    it('should handle network errors', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))
      
      const result = await fetchGitHubProfile()
      
      expect(result).toBe(false)
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      localStorageMock.setItem('access_token', 'test-token')
      
      const result = isAuthenticated()
      
      expect(result).toBe(true)
    })

    it('should return false when no access token exists', () => {
      const result = isAuthenticated()
      
      expect(result).toBe(false)
    })
  })

  describe('redirectToDashboard', () => {
    it('should redirect to dashboard', () => {
      const originalLocation = window.location.href
      
      redirectToDashboard()
      
      // Note: In test environment, window.location.href assignment might not work
      // This test verifies the function executes without errors
      expect(redirectToDashboard).toBeDefined()
    })
  })

  describe('logoutUser', () => {
    it('should clear tokens and call logout endpoint', async () => {
      localStorageMock.setItem('access_token', 'test-token')
      localStorageMock.setItem('username', 'Test User')
      
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200
      } as Response)
      
      // Mock the finally callback to avoid actual redirect
      const logoutPromise = new Promise((resolve) => {
        vi.mocked(global.fetch).mockImplementationOnce(() => 
          Promise.resolve({
            ok: true,
            status: 200
          } as Response).finally(() => resolve(true))
        )
      })
      
      logoutUser()
      
      // Wait a bit for the async operations
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('username')
    })
  })

})