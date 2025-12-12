import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getBackendURL,
  getFrontendURL,
  getAccessControlAllowOrigin,
  createApiHeaders,
  fetchApi,
} from './config';

describe('config utilities', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  describe('getBackendURL', () => {
    it('should return API URL from env variable if set', () => {
      vi.stubEnv('VITE_API_URL', 'https://custom-api.com');
      const url = getBackendURL();
      expect(url).toBe('https://custom-api.com');
    });

    it('should return production URL for production env', () => {
      vi.stubEnv('VITE_API_URL', '');
      vi.stubEnv('VITE_ENV', 'production');
      const url = getBackendURL();
      expect(url).toBe('https://api.nannyai.dev');
    });

    it('should return test URL for test env', () => {
      vi.stubEnv('VITE_API_URL', '');
      vi.stubEnv('VITE_ENV', 'test');
      const url = getBackendURL();
      expect(url).toBe('https://api.nannyai.dev');
    });

    it('should return localhost for development env', () => {
      vi.stubEnv('VITE_API_URL', '');
      vi.stubEnv('VITE_ENV', 'development');
      const url = getBackendURL();
      expect(url).toBe('http://localhost:8080');
    });
  });

  describe('getFrontendURL', () => {
    it('should return localhost URL for localhost hostname', () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'localhost',
          protocol: 'http:',
          port: '5173',
          origin: 'http://localhost:5173',
        },
        writable: true,
      });

      const url = getFrontendURL();
      expect(url).toContain('localhost');
    });

    it('should return origin for production env', () => {
      vi.stubEnv('VITE_ENV', 'production');
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'app.nannyai.dev',
          protocol: 'https:',
          port: '',
          origin: 'https://app.nannyai.dev',
        },
        writable: true,
      });

      const url = getFrontendURL();
      expect(url).toBe('https://app.nannyai.dev');
    });
  });

  describe('getAccessControlAllowOrigin', () => {
    it('should return frontend URL', () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'localhost',
          protocol: 'http:',
          port: '5173',
          origin: 'http://localhost:5173',
        },
        writable: true,
      });

      const origin = getAccessControlAllowOrigin();
      expect(origin).toContain('localhost');
    });
  });

  describe('createApiHeaders', () => {
    it('should create headers without token', () => {
      const headers = createApiHeaders();
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBeUndefined();
    });

    it('should create headers with token', () => {
      const headers = createApiHeaders('test-token-123');
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBe('Bearer test-token-123');
    });
  });

  describe('fetchApi', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should fetch with correct URL and headers', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      vi.stubEnv('VITE_API_URL', 'https://api.test.com');

      await fetchApi('/endpoint', {}, 'test-token');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/endpoint',
        expect.objectContaining({
          credentials: 'include',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    it('should handle fetch errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      vi.stubEnv('VITE_API_URL', 'https://api.test.com');

      await expect(fetchApi('/endpoint')).rejects.toThrow('Network error');
    });

    it('should handle endpoint without leading slash', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      vi.stubEnv('VITE_API_URL', 'https://api.test.com');

      await fetchApi('endpoint');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/endpoint',
        expect.any(Object)
      );
    });
  });
});
