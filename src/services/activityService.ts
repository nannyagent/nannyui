import { pb } from '@/lib/pocketbase';

export interface Activity {
  id: string;
  user_id: string;
  agent_id: string | null;
  activity_type: string;
  summary: string;
  metadata: Record<string, any>;
  created_at: string;
  // Legacy fields for backward compatibility
  title?: string;
  description?: string;
  icon?: string;
}

export interface ActivitiesResponse {
  activities: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filter: string;
}

// Activity types
export const ACTIVITY_TYPES = {
  // Agent activities
  AGENT_CREATED: 'agent_created',
  AGENT_DELETED: 'agent_deleted',
  AGENT_CONNECTED: 'agent_connected',
  AGENT_DISCONNECTED: 'agent_disconnected',
  
  // Patch activities
  PATCH_STARTED: 'patch_started',
  PATCH_COMPLETED: 'patch_completed',
  PATCH_FAILED: 'patch_failed',
  PATCH_SCHEDULED: 'patch_scheduled',
  
  // Investigation activities
  INVESTIGATION_STARTED: 'investigation_started',
  INVESTIGATION_COMPLETED: 'investigation_completed',
  INVESTIGATION_FAILED: 'investigation_failed',
  
  // User activities
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTERED: 'user_registered',
};

/**
 * Fetch activities with pagination
 */
export const getActivitiesPaginated = async (
  page: number = 1,
  limit: number = 10,
  filter: string = 'all'
): Promise<ActivitiesResponse> => {
  return getActivities(page, limit, filter);
};

export const getActivities = async (
  page: number = 1,
  limit: number = 10,
  filter: string = 'all'
): Promise<ActivitiesResponse> => {
  try {
    const user = pb.authStore.model;
    if (!user) {
      return {
        activities: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
        filter
      };
    }

    const filterStr = `user_id = "${user.id}"`;
    if (filter !== 'all') {
      // Map filter to activity types if needed, or just use as is
      // Assuming filter is activity_type or similar
    }

    const result = await pb.collection('activities').getList(page, limit, {
      filter: filterStr,
      sort: '-created',
    });

    const activities = result.items.map((record: any) => ({
      ...record,
      created_at: record.created,
    })) as unknown as Activity[];

    return {
      activities,
      pagination: {
        page: result.page,
        limit: result.perPage,
        total: result.totalItems,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1,
      },
      filter
    };
  } catch (error) {
    console.error('Error fetching activities:', error);
    return {
      activities: [],
      pagination: { page: 1, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      filter
    };
  }
};

/**
 * Log an activity
 */
export const logActivity = async (
  activityType: string,
  summary: string,
  metadata: Record<string, any> = {},
  agentId?: string
): Promise<void> => {
  try {
    const user = pb.authStore.model;
    if (!user) return;

    await pb.collection('activities').create({
      user_id: user.id,
      agent_id: agentId,
      activity_type: activityType,
      summary,
      metadata,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

import { Activity as LucideActivity, Server, Shield, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';

/**
 * Get recent activities
 */
export const getRecentActivities = async (limit: number = 5): Promise<Activity[]> => {
  const response = await getActivities(1, limit);
  return response.activities;
};

/**
 * Get icon for activity type
 */
export const getActivityIcon = (type: string) => {
  if (type.includes('agent')) return Server;
  if (type.includes('patch')) return Shield;
  if (type.includes('user')) return User;
  if (type.includes('investigation')) return LucideActivity;
  if (type.includes('error') || type.includes('failed')) return AlertCircle;
  if (type.includes('success') || type.includes('completed')) return CheckCircle;
  return Clock;
};

/**
 * Format activity time
 */
export const formatActivityTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString();
};

export const formatDuration = (seconds: number): string => {
  if (!seconds) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
  
  return parts.join(' ');
};

export const getActivityTypes = () => {
  return Object.values(ACTIVITY_TYPES);
};
