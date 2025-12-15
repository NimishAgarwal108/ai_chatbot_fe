const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    token: string;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Custom error class for auth errors
class AuthError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  let data;
  
  try {
    data = await response.json();
  } catch (error) {
    throw new AuthError('Invalid response from server', response.status);
  }

  if (!response.ok) {
    throw new AuthError(
      data.message || 'An error occurred',
      response.status,
      data.errors
    );
  }

  return data;
}

// Helper function to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
}

// Helper function for making authenticated requests
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = authService.getToken();
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    return response;
  } catch (error) {
    // Network error
    if (error instanceof TypeError) {
      throw new AuthError('Network error. Please check your connection.');
    }
    throw error;
  }
}

export const authService = {
  // Signup
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const result = await handleResponse<AuthResponse>(response);
    
    // Store token if provided
    if (result.success && result.data?.token) {
      localStorage.setItem('authToken', result.data.token);
      
      // Also store user info
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
    
    return result;
  },

  // Login
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const result = await handleResponse<AuthResponse>(response);
    
    // Store token in localStorage if provided
    if (result.success && result.data?.token) {
      localStorage.setItem('authToken', result.data.token);
      
      // Also store user info
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }

    return result;
  },

  // Logout
  logout: async (): Promise<AuthResponse> => {
    const response = await fetchWithAuth('/auth/logout', {
      method: 'POST',
    });

    const result = await handleResponse<AuthResponse>(response);
    
    // Clear stored token and user info
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    return result;
  },

  // Get current user
  getMe: async (): Promise<AuthResponse> => {
    const response = await fetchWithAuth('/auth/me', {
      method: 'GET',
    });

    return handleResponse<AuthResponse>(response);
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<AuthResponse> => {
    const response = await fetchWithAuth('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return handleResponse<AuthResponse>(response);
  },

  // Reset password
  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<AuthResponse> => {
    const response = await fetchWithAuth('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });

    return handleResponse<AuthResponse>(response);
  },

  // Verify email
  verifyEmail: async (token: string): Promise<AuthResponse> => {
    const response = await fetchWithAuth('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    return handleResponse<AuthResponse>(response);
  },

  // Refresh token (if using JWT with refresh tokens)
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await fetchWithAuth('/auth/refresh', {
      method: 'POST',
    });

    const result = await handleResponse<AuthResponse>(response);
    
    if (result.success && result.data?.token) {
      localStorage.setItem('authToken', result.data.token);
    }

    return result;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    // Check localStorage first
    const token = localStorage.getItem('authToken');
    if (token) return true;
    
    // Check cookie as fallback
    const cookieToken = getCookie('token');
    return !!cookieToken && cookieToken !== 'none';
  },

  // Get stored token - FIXED to check both localStorage and cookies
  getToken: (): string | null => {
    // First check localStorage
    const localToken = localStorage.getItem('authToken');
    if (localToken) return localToken;
    
    // Then check cookie
    const cookieToken = getCookie('token');
    if (cookieToken && cookieToken !== 'none') {
      return cookieToken;
    }
    
    return null;
  },

  // Get stored user info
  getUser: (): any | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },
};

// Export the AuthError class for use in components
export { AuthError };
export type { SignupData, LoginData, AuthResponse };