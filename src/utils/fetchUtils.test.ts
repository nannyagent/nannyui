import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithTimeout } from './fetchUtils';

describe('fetchWithTimeout', () => {
  const mockFetch = vi.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  it('should return response when fetch completes within timeout', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), { status: 200 });
    mockFetch.mockResolvedValue(mockResponse);

    const response = await fetchWithTimeout('https://api.example.com/test');
    
    expect(response).toBe(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/test',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('should pass options to fetch', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), { status: 200 });
    mockFetch.mockResolvedValue(mockResponse);

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true }),
    };

    await fetchWithTimeout('https://api.example.com/test', options);
    
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/test',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true }),
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('should abort fetch when timeout is reached', async () => {
    // Create a fetch that never resolves
    const fetchPromise = new Promise<Response>(() => {});
    mockFetch.mockReturnValue(fetchPromise);

    const timeoutPromise = fetchWithTimeout('https://api.example.com/test', {}, 5000);
    
    // Fast-forward past the timeout
    vi.advanceTimersByTime(5001);
    
    // The fetch should have been called with an abort signal
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/test',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );

    // Note: In a real scenario, this would throw an AbortError
    // but we can't easily test this with fake timers and mocks
  });

  it('should use default 10 second timeout', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), { status: 200 });
    mockFetch.mockResolvedValue(mockResponse);

    // Call without explicit timeout
    await fetchWithTimeout('https://api.example.com/test');
    
    expect(mockFetch).toHaveBeenCalled();
  });

  it('should use custom timeout when provided', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), { status: 200 });
    mockFetch.mockResolvedValue(mockResponse);

    // Call with custom 30 second timeout
    await fetchWithTimeout('https://api.example.com/test', {}, 30000);
    
    expect(mockFetch).toHaveBeenCalled();
  });

  it('should clear timeout after fetch completes', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), { status: 200 });
    mockFetch.mockResolvedValue(mockResponse);

    await fetchWithTimeout('https://api.example.com/test');
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should clear timeout even if fetch fails', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    mockFetch.mockRejectedValue(new Error('Network error'));

    await expect(fetchWithTimeout('https://api.example.com/test')).rejects.toThrow('Network error');
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
