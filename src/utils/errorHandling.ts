
import { toast } from "@/hooks/use-toast";

/**
 * Error types for API responses
 */
export enum ErrorType {
  NETWORK = "network",
  AUTH = "auth",
  SERVER = "server",
  UNKNOWN = "unknown"
}

/**
 * Generic API error class
 */
export class ApiError extends Error {
  type: ErrorType;
  statusCode?: number;

  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
  }
}

/**
 * Create appropriate error object based on fetch error
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createApiError = (error: any, defaultMessage = "An error occurred while connecting to the server"): ApiError => {
  // Network error (offline, connection refused, etc)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new ApiError(
      "Unable to connect to the server. Please check your internet connection.",
      ErrorType.NETWORK
    );
  }
  
  // Handle error with status code
  if (error.statusCode) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return new ApiError(
        "Authentication error. Please log in again.",
        ErrorType.AUTH,
        error.statusCode
      );
    }
    
    if (error.statusCode >= 500) {
      return new ApiError(
        "Server error. Please try again later.",
        ErrorType.SERVER,
        error.statusCode
      );
    }
  }
  
  return new ApiError(defaultMessage, ErrorType.UNKNOWN);
};

/**
 * Show user-friendly error message as toast
 */
export const showErrorToast = (error: Error | ApiError): void => {
  if (error instanceof ApiError) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  } else {
    toast({
      title: "Error",
      description: "Something went wrong. Please try again later.",
      variant: "destructive",
    });
  }
};

/**
 * Wrapper for fetch API calls with error handling
 */
export const safeFetch = async <T>(
  fetchPromise: Promise<Response>,
  fallbackData?: T,
  suppressToast?: boolean
): Promise<{ data: T | null; error: ApiError | null }> => {
  try {
    const response = await fetchPromise;
    
    if (!response.ok) {
      throw new ApiError(
        response.statusText || "Server error",
        response.status === 401 || response.status === 403 
          ? ErrorType.AUTH 
          : response.status >= 500 
            ? ErrorType.SERVER 
            : ErrorType.UNKNOWN,
        response.status
      );
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    const apiError = error instanceof ApiError 
      ? error 
      : createApiError(error);
      
    if (!suppressToast) {
      showErrorToast(apiError);
    }
    
    return { 
      data: fallbackData || null, 
      error: apiError 
    };
  }
};
