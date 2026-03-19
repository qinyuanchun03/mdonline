import PocketBase from 'pocketbase';

export const getPocketBase = (url?: string) => {
  const finalUrl = url || import.meta.env.VITE_POCKETBASE_URL || 'https://api-serv.250221.xyz/';
  return new PocketBase(finalUrl);
};

export const pb = getPocketBase();

// Helper to check if user is authenticated
export const isAuthenticated = () => pb.authStore.isValid;

// Helper to get current user
export const getCurrentUser = () => pb.authStore.model;
