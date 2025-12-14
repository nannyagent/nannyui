
import { getBackendURL, fetchApi } from './config';

// Get the stored access token
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Set the access token in localStorage
export const setAccessToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

// Get the stored username
export const getUsername = (): string => {
  return localStorage.getItem('username') || 'Nanny User';
};

// Set the username in localStorage
export const setUsername = (name: string): void => {
  localStorage.setItem('username', name);
};

// Validate the access token with the backend
export const validateAccessToken = async (): Promise<boolean> => {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    return false;
  }
  
  try {
    const response = await fetchApi('api/user-auth-token', {
      method: 'GET',
    }, accessToken);
    
    return response.ok;
  } catch (error) {
    console.error('Error validating access token:', error);
    return false;
  }
};

// Refresh the tokens using the refresh token cookie
export const refreshTokens = async (): Promise<boolean> => {
  try {
    const response = await fetchApi('api/refresh-token', {
      method: 'POST',
      credentials: 'include', // Ensure cookies are sent with the request
    });
    
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    
    // Store the new access token and username if received
    if (data.access_token) {
      setAccessToken(data.access_token);
      if (data.user && data.user.name) {
        setUsername(data.user.name);
      }
      return true;
    } else {
      console.warn('No access token received in refresh response');
      return false;
    }
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    return false;
  }
};

// Direct call to GitHub profile to get tokens in cross-domain scenarios
export const fetchGitHubProfile = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${getBackendURL()}/github/profile`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    
    if (data.access_token) {
      setAccessToken(data.access_token);
      if (data.user && data.user.name) {
        setUsername(data.user.name);
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error fetching GitHub profile:', error);
    return false;
  }
};

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// Handle redirection to dashboard after authentication
export const redirectToDashboard = (): void => {
  window.location.href = '/dashboard';
};

// Log out the user by clearing tokens
export const logoutUser = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('username');
  // Note: refresh_token is an HttpOnly cookie that can't be removed from client-side
  // The backend should handle invalidating it
  
  // Attempt to log out on the server side as well
  fetch(`${getBackendURL()}/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(error => {
    console.error('Error during server-side logout:', error);
  }).finally(() => {
    window.location.href = '/';
  });
};
