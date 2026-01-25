import PocketBase from 'pocketbase';

const POCKETBASE_URL = (window as any).env?.VITE_POCKETBASE_URL || import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

export const pb = new PocketBase(POCKETBASE_URL);

// Helper to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return pb.authStore.isValid;
};

// Helper to get current user
export const getCurrentUserPB = () => {
  return pb.authStore.record;
};

// Helper to get auth token
export const getAuthToken = (): string | null => {
  return pb.authStore.token || null;
};
