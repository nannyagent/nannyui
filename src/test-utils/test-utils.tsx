import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthContext, AuthContextType } from '../contexts/AuthContext'
import { NotificationContext, NotificationContextType } from '../contexts/NotificationContext'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock AuthContext data
export const mockAuthContext: AuthContextType = {
  user: {
    id: 'mock-user-id',
    username: 'testuser',
    email: 'test@example.com',
    emailVisibility: true,
    verified: true,
    created: '2023-01-01T00:00:00.000Z',
    updated: '2023-01-01T00:00:00.000Z',
    name: 'Test User',
    avatar: ''
  },
  token: 'mock-token',
  signOut: vi.fn(),
  signIn: vi.fn(),
  loading: false
}

export const mockNotificationContext: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
};

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
  notificationContext?: Partial<NotificationContextType>
  queryClient?: QueryClient
  route?: string
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    authContext = {},
    notificationContext = {},
    queryClient = createTestQueryClient(),
    route = '/',
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Combine default auth context with overrides
  const authContextValue = { ...mockAuthContext, ...authContext }
  const notificationContextValue = { ...mockNotificationContext, ...notificationContext }
  
  // Navigate to the specified route
  window.history.pushState({}, 'Test page', route)

  function Wrapper({ children }: { children?: React.ReactNode }) {
    return (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthContext.Provider value={authContextValue}>
            <NotificationContext.Provider value={notificationContextValue}>
              {children}
            </NotificationContext.Provider>
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
