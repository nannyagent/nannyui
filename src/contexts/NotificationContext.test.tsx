import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { NotificationProvider, useNotifications } from './NotificationContext';
import { pb } from '@/lib/pocketbase';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock pocketbase
vi.mock('@/lib/pocketbase', () => ({
  pb: {
    collection: vi.fn(),
  },
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Test component to consume context
const TestComponent = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  return (
    <div>
      <div data-testid="unread-count">{unreadCount}</div>
      <button onClick={markAllAsRead}>Mark All Read</button>
      <ul>
        {notifications.map((n) => (
          <li key={n.id} data-testid="notification" onClick={() => markAsRead(n.id)}>
            {n.title} - {n.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

describe('NotificationContext', () => {
  let subscribeMock: any;
  let unsubscribeMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    subscribeMock = vi.fn();
    unsubscribeMock = vi.fn();
    (pb.collection as any).mockReturnValue({
      subscribe: subscribeMock,
      unsubscribe: unsubscribeMock,
    });
  });

  it('subscribes to collections on mount', () => {
    render(
      <BrowserRouter>
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      </BrowserRouter>
    );

    expect(pb.collection).toHaveBeenCalledWith('patch_operations');
    expect(pb.collection).toHaveBeenCalledWith('investigations');
    expect(subscribeMock).toHaveBeenCalledTimes(2);
  });

  it('handles patch_operations updates', async () => {
    // Better way: mock implementation based on collection name
    const patchSubscribe = vi.fn();
    const investigationSubscribe = vi.fn();
    
    (pb.collection as any).mockImplementation((name: string) => {
        if (name === 'patch_operations') {
            return { subscribe: patchSubscribe, unsubscribe: vi.fn() };
        }
        if (name === 'investigations') {
            return { subscribe: investigationSubscribe, unsubscribe: vi.fn() };
        }
        return { subscribe: vi.fn(), unsubscribe: vi.fn() };
    });

    render(
      <BrowserRouter>
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      </BrowserRouter>
    );

    // Simulate patch completion
    const patchCallback = patchSubscribe.mock.calls[0][1]; // Second arg is callback
    
    act(() => {
        patchCallback({
            action: 'update',
            record: {
                id: 'patch1',
                status: 'completed',
                agent_id: 'agent1',
                expand: { agent_id: { hostname: 'server-01' } }
            }
        });
    });

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Patch Operation Completed',
        description: 'Patch operation for agent agent1 has completed.',
    }));

    expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
    expect(screen.getByText(/Patch Operation Completed/)).toBeInTheDocument();
  });

  it('handles investigation updates', async () => {
    const patchSubscribe = vi.fn();
    const investigationSubscribe = vi.fn();
    
    (pb.collection as any).mockImplementation((name: string) => {
        if (name === 'patch_operations') {
            return { subscribe: patchSubscribe, unsubscribe: vi.fn() };
        }
        if (name === 'investigations') {
            return { subscribe: investigationSubscribe, unsubscribe: vi.fn() };
        }
        return { subscribe: vi.fn(), unsubscribe: vi.fn() };
    });

    render(
      <BrowserRouter>
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      </BrowserRouter>
    );

    // Simulate investigation completion
    const investigationCallback = investigationSubscribe.mock.calls[0][1];
    
    act(() => {
        investigationCallback({
            action: 'update',
            record: {
                id: 'inv1',
                status: 'completed',
                agent_id: 'agent1',
                expand: { agent_id: { hostname: 'server-01' } }
            }
        });
    });

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Investigation Completed',
        description: 'Investigation for agent agent1 has completed.',
    }));

    expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
  });

  it('marks notification as read', async () => {
     const patchSubscribe = vi.fn();
    (pb.collection as any).mockImplementation((name: string) => {
        if (name === 'patch_operations') {
            return { subscribe: patchSubscribe, unsubscribe: vi.fn() };
        }
        return { subscribe: vi.fn(), unsubscribe: vi.fn() };
    });

    render(
      <BrowserRouter>
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      </BrowserRouter>
    );

    const patchCallback = patchSubscribe.mock.calls[0][1];
    act(() => {
        patchCallback({
            action: 'update',
            record: {
                id: 'patch1',
                status: 'completed',
                agent_id: 'agent1',
                expand: { agent_id: { hostname: 'server-01' } }
            }
        });
    });

    expect(screen.getByTestId('unread-count')).toHaveTextContent('1');

    const notification = screen.getByTestId('notification');
    act(() => {
        notification.click();
    });

    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
  });
});
