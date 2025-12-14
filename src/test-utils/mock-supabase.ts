import { vi } from 'vitest';

/**
 * Mock Supabase client for testing
 */
export const createMockSupabaseClient = () => {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      }),
      getSession: vi.fn().mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ 
        data: { user: null, session: null }, 
        error: null 
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
  };
};

/**
 * Mock authenticated Supabase user
 */
export const mockAuthenticatedUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User',
    full_name: 'Test User',
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00.000Z',
};

/**
 * Mock authenticated session
 */
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: 9999999999,
  expires_in: 3600,
  token_type: 'bearer',
  user: mockAuthenticatedUser,
};
