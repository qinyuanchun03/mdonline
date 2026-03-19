import PocketBase from 'pocketbase';

const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'https://api-serv.250221.xyz/';
export const pb = new PocketBase(pbUrl);

// Helper to check if user is authenticated
export const isAuthenticated = () => pb.authStore.isValid;

// Helper to get current user
export const getCurrentUser = () => pb.authStore.model;
