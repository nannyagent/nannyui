import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthContext, AuthContextType } from '../contexts/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock AuthContext data
export const mockAuthContext: AuthContextType = {
  user: {
    id: 'mock-user-id',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User'
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    email_confirmed_at: '2023-01-01T00:00:00.000Z',
    phone_confirmed_at: null,
    confirmed_at: '2023-01-01T00:00:00.000Z',
    last_sign_in_at: '2023-01-01T00:00:00.000Z',
    role: 'authenticated',
    identities: [],
    factors: []
  },
  session: {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_at: 9999999999,
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'mock-user-id',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User'
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
      email_confirmed_at: '2023-01-01T00:00:00.000Z',
      phone_confirmed_at: null,
      confirmed_at: '2023-01-01T00:00:00.000Z',
      last_sign_in_at: '2023-01-01T00:00:00.000Z',
      role: 'authenticated',
      identities: [],
      factors: []
    }
  },
  signOut: vi.fn(),
  signIn: vi.fn(),
  loading: false
}

// Create a custom render function that includes providers
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authContext?: Partial<AuthContextType>
  queryClient?: QueryClient
  route?: string
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    authContext = {},
    queryClient = createTestQueryClient(),
    route = '/',
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Combine default auth context with overrides
  const contextValue = { ...mockAuthContext, ...authContext }
  
  // Navigate to the specified route
  window.history.pushState({}, 'Test page', route)

  function Wrapper({ children }: { children?: React.ReactNode }) {
    return (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthContext.Provider value={contextValue}>
            {children}
          </AuthContext.Provider>
        </QueryClientProvider>
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'

// Export a version of render that doesn't have providers for testing components in isolation
export { render as renderWithoutProviders } from '@testing-library/react'