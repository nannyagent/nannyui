
/**
 * Configuration utility for handling backend URLs and CORS settings
 */

// Get the environment
const getEnvironment = (): string => {
  return import.meta.env.VITE_ENV || 'development';
};

// Get the backend API URL based on environment
export const getBackendURL = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) return apiUrl;
  
  // Fallback values if env vars aren't set
  const env = getEnvironment();
  switch (env) {
    case 'production':
      return 'https://api.nannyai.dev';
    case 'test':
      return 'https://api.nannyai.dev'; // Use the same URL as production
    case 'development':
    default:
      return 'http://localhost:8080';
  }
};

// Get the frontend URL for CORS configuration
export const getFrontendURL = (): string => {
  const env = getEnvironment();
  const hostname = window.location.hostname;
  
  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return window.location.protocol + '//' + hostname + ':' + (window.location.port || '8080');
  }
  
  // Handle production and test domains
  if (env === 'production' || env === 'test') {
    return window.location.origin;
  }
  
  // Default case
  return window.location.origin;
};

// Get Access-Control-Allow-Origin header value
export const getAccessControlAllowOrigin = (): string => {
  return getFrontendURL();
};

// Create fetch headers with proper CORS settings
export const createApiHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Utility to handle API fetching with proper headers
export const fetchApi = async (
  endpoint: string, 
  options: RequestInit = {}, 
  token?: string
): Promise<Response> => {
  const baseUrl = getBackendURL();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = createApiHeaders(token);
  
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    credentials: 'include', // Always include cookies in requests
  };
  
  
  try {
    const response = await fetch(url, fetchOptions);
    return response;
  } catch (error) {
    console.error(`API fetch error for ${endpoint}:`, error);
    throw error;
  }
};
