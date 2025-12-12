
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getActivityIcon,
  formatActivityTime,
  getRecentActivities,
  getActivitiesPaginated,
  getUserActivities,
  getActivitiesByType,
  createActivity,
  Activity,
  ActivitiesResponse,
} from './activityService';
import * as authService from './authService';
import { supabase } from '@/lib/supabase';

vi.mock('./authService');
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn(),
  },
}));

const mockSession = { access_token: 'test-token' };
const mockActivities: Activity[] = [
  { id: '1', summary: 'Test Activity 1', activity_type: 'test', created_at: new Date().toISOString(), user_id: 'user-1', metadata: { status: 'success', ip_address: '127.0.0.1', user_agent: 'test-agent', device_type: 'desktop', duration_ms: 100 } },
  { id: '2', summary: 'Test Activity 2', activity_type: 'test', created_at: new Date().toISOString(), user_id: 'user-2', metadata: { status: 'success', ip_address: '127.0.0.1', user_agent: 'test-agent', device_type: 'desktop', duration_ms: 100 } },
];
const mockActivitiesResponse: ActivitiesResponse = {
  activities: mockActivities,
  pagination: { page: 1, limit: 2, total: 2, totalPages: 1, hasNext: false, hasPrev: false },
  filter: 'all',
};

describe('activityService', () => {
  beforeEach(() => {
    vi.spyOn(authService, 'getCurrentSession').mockResolvedValue(mockSession as any);
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('import.meta.env', { VITE_SUPABASE_URL: 'http://localhost:54321' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getRecentActivities', () => {
    it('should return an empty array if there is no session', async () => {
      vi.spyOn(authService, 'getCurrentSession').mockResolvedValue(null);
      const activities = await getRecentActivities();
      expect(activities).toEqual([]);
    });

    it('should return an empty array if the fetch fails', async () => {
      (fetch as any).mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error' });
      const activities = await getRecentActivities();
      expect(activities).toEqual([]);
    });

    it('should return a list of activities if the fetch is successful', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockActivitiesResponse),
      });
      const activities = await getRecentActivities(2);
      expect(activities).toHaveLength(2);
      expect(activities[0].summary).toBe('Test Activity 1');
    });

    it('should transform activities to include title and description', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockActivitiesResponse),
      });
      const activities = await getRecentActivities(2);
      expect(activities[0].title).toBe('Test Activity 1');
      expect(activities[0].description).toBe('test - success');
    });
  });

  describe('getActivitiesPaginated', () => {
    it('should return an empty response if there is no session', async () => {
      vi.spyOn(authService, 'getCurrentSession').mockResolvedValue(null);
      const response = await getActivitiesPaginated();
      expect(response.activities).toEqual([]);
      expect(response.pagination.total).toBe(0);
    });

    it('should throw an error if the fetch fails', async () => {
      (fetch as any).mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error' });
      await expect(getActivitiesPaginated()).rejects.toThrow('Failed to fetch activities: 500');
    });

    it('should return a paginated list of activities if the fetch is successful', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockActivitiesResponse),
      });
      const response = await getActivitiesPaginated(1, 2);
      expect(response.activities).toHaveLength(2);
      expect(response.pagination.total).toBe(2);
    });
  });

  describe('getUserActivities', () => {
    it('should return an empty array on error', async () => {
      (fetch as any).mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error' });
      const activities = await getUserActivities('user-1');
      expect(activities).toEqual([]);
    });

    it('should return filtered activities for a specific user', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockActivitiesResponse),
      });
      const activities = await getUserActivities('user-1', 2);
      expect(activities).toHaveLength(1);
      expect(activities[0].user_id).toBe('user-1');
    });
  });

  describe('getActivitiesByType', () => {
    it('should return an empty array on error', async () => {
        (fetch as any).mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error' });
        const activities = await getActivitiesByType('test');
        expect(activities).toEqual([]);
    });

    it('should return filtered activities for a specific type', async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockActivitiesResponse),
        });
        const activities = await getActivitiesByType('test', 2);
        expect(activities).toHaveLength(2);
        expect(activities[0].activity_type).toBe('test');
    });
  });

  describe('createActivity', () => {
    const newActivity: Omit<Activity, 'id' | 'created_at'> = {
      user_id: 'user-3',
      agent_id: 'agent-3',
      activity_type: 'new_activity',
      summary: 'A new activity',
      metadata: { status: 'info', ip_address: '127.0.0.1', user_agent: 'test-agent', device_type: 'desktop', duration_ms: 50 },
    };

    it('should return data on successful creation', async () => {
      const mockCreatedActivity = { ...newActivity, id: '3', created_at: new Date().toISOString() };
      (supabase.single as vi.Mock).mockResolvedValue({ data: mockCreatedActivity, error: null });

      const { data, error } = await createActivity(newActivity);
      expect(error).toBeNull();
      expect(data).toEqual(mockCreatedActivity);
      expect(supabase.from).toHaveBeenCalledWith('activities');
      expect(supabase.insert).toHaveBeenCalledWith([newActivity]);
    });

    it('should return an error when creation fails', async () => {
      const mockError = { message: 'Insert failed' };
      (supabase.single as vi.Mock).mockResolvedValue({ data: null, error: mockError });

      const { data, error } = await createActivity(newActivity);
      expect(data).toBeNull();
      expect(error).toEqual(new Error(mockError.message));
    });

    it('should return an error on exception', async () => {
        const exception = new Error('Something went wrong');
        (supabase.single as vi.Mock).mockRejectedValue(exception);
  
        const { data, error } = await createActivity(newActivity);
        expect(data).toBeNull();
        expect(error).toBe(exception);
      });
  });

  describe('getActivityIcon', () => {
    it('should return the correct icon for each activity type', () => {
      expect(getActivityIcon('data_sync')).toBe('Server');
      expect(getActivityIcon('token_generated')).toBe('Key');
      expect(getActivityIcon('session_started')).toBe('Activity');
      expect(getActivityIcon('websocket_connected')).toBe('Activity');
      expect(getActivityIcon('agent')).toBe('Server');
      expect(getActivityIcon('user')).toBe('Users');
      expect(getActivityIcon('session')).toBe('Activity');
      expect(getActivityIcon('token')).toBe('Key');
      expect(getActivityIcon('system')).toBe('Activity');
      expect(getActivityIcon('other')).toBe('Activity');
      expect(getActivityIcon('unknown_type')).toBe('Activity');
    });
  });

  describe('formatActivityTime', () => {
    it('should return "just now" for times less than a minute ago', () => {
      const date = new Date();
      expect(formatActivityTime(date.toISOString())).toBe('just now');
    });

    it('should return "X min(s) ago" for times less than an hour ago', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatActivityTime(date.toISOString())).toBe('5 mins ago');
    });

    it('should return "1 min ago" for 1 minute ago', () => {
      const date = new Date(Date.now() - 1 * 60 * 1000);
      expect(formatActivityTime(date.toISOString())).toBe('1 min ago');
    });

    it('should return "X hour(s) ago" for times less than a day ago', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(formatActivityTime(date.toISOString())).toBe('3 hours ago');
    });

    it('should return "1 hour ago" for 1 hour ago', () => {
        const date = new Date(Date.now() - 1 * 60 * 60 * 1000);
        expect(formatActivityTime(date.toISOString())).toBe('1 hour ago');
    });

    it('should return "X day(s) ago" for times less than 7 days ago', () => {
      const date = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
      expect(formatActivityTime(date.toISOString())).toBe('4 days ago');
    });

    it('should return "1 day ago" for 1 day ago', () => {
        const date = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
        expect(formatActivityTime(date.toISOString())).toBe('1 day ago');
    });

    it('should return the date for times more than 7 days ago', () => {
      const date = new Date('2023-01-01T12:00:00.000Z');
      const expected = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      expect(formatActivityTime(date.toISOString())).toBe(expected);
    });

    it('should return the date without year if it is the same year', () => {
        const now = new Date();
        const date = new Date();
        date.setFullYear(now.getFullYear());
        date.setDate(now.getDate() - 8); // 8 days ago, but in the same year
        const expected = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric'
        });
        // This test might be flaky depending on when it's run (e.g., start of a year)
        // but for most of the year it's fine.
        if (now.getFullYear() === new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).getFullYear()) {
            expect(formatActivityTime(date.toISOString())).toBe(expected);
        }
    });
  });
});
