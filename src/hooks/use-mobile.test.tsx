import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  let originalInnerWidth: number;
  let matchMediaMock: typeof window.matchMedia;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    matchMediaMock = window.matchMedia;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    window.matchMedia = matchMediaMock;
  });

  it('should return true for mobile viewport (width < 768)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    });

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false for desktop viewport (width >= 768)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query !== '(max-width: 768px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.fn();
    
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerSpy,
      dispatchEvent: vi.fn(),
    }));

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalled();
  });
});
