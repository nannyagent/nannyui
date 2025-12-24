import PocketBase from 'pocketbase';

// Initialize PocketBase client
// Use environment variable or default to local backend
export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

// Helper to get current auth record
export const getCurrentUser = () => {
  return pb.authStore.record;
};

// Helper to check if user is authenticated
export const isAuthenticated = () => {
  return pb.authStore.isValid;
};
