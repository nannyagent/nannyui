import PocketBase from 'pocketbase';

// Initialize PocketBase client
// Use runtime env (docker) or build env or default
const url = window.env?.VITE_POCKETBASE_URL || import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
export const pb = new PocketBase(url);

// Helper to get current auth record
export const getCurrentUser = () => {
  return pb.authStore.record;
};

// Helper to check if user is authenticated
export const isAuthenticated = () => {
  return pb.authStore.isValid;
};
