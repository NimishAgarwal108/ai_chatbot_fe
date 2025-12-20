const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  picture?: string;
  authProvider: string;
  createdAt: string;
  preferences: {
    notifications: boolean;
    language: string;
  };
}

interface ProfileResponse {
  success: boolean;
  message?: string;
  data?: {
    user?: ProfileData;
    preferences?: {
      notifications: boolean;
      language: string;
    };
    stats?: {
      chats: number;
      messages: number;
      daysSinceJoined: number;
    };
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Custom error class
class ProfileError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ProfileError';
  }
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  let data;
  
  try {
    data = await response.json();
  } catch (error) {
    throw new ProfileError('Invalid response from server', response.status);
  }

  if (!response.ok) {
    throw new ProfileError(
      data.message || 'An error occurred',
      response.status,
      data.errors
    );
  }

  return data;
}

// Helper function to get token
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('authToken');
  if (token) return token;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  
  return null;
}

// Helper function for authenticated requests
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  
  if (!token) {
    throw new ProfileError('Authentication required', 401);
  }

  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
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
    if (error instanceof TypeError) {
      throw new ProfileError('Network error. Please check your connection.');
    }
    throw error;
  }
}

export const profileService = {
  // Get profile
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await fetchWithAuth('/profile');
    return handleResponse<ProfileResponse>(response);
  },

  // Update profile
  updateProfile: async (data: {
    name?: string;
    phone?: string;
    location?: string;
    bio?: string;
  }): Promise<ProfileResponse> => {
    const response = await fetchWithAuth('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    const result = await handleResponse<ProfileResponse>(response);
    
    // Update stored user info
    if (result.success && result.data?.user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({
          ...user,
          ...result.data.user
        }));
      }
    }
    
    return result;
  },

  // Update preferences
  updatePreferences: async (data: {
    notifications?: boolean;
    language?: string;
  }): Promise<ProfileResponse> => {
    const response = await fetchWithAuth('/profile/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    return handleResponse<ProfileResponse>(response);
  },

  // Change password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ProfileResponse> => {
    const response = await fetchWithAuth('/profile/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    return handleResponse<ProfileResponse>(response);
  },

  // Delete account
  deleteAccount: async (): Promise<ProfileResponse> => {
    const response = await fetchWithAuth('/profile', {
      method: 'DELETE',
    });

    const result = await handleResponse<ProfileResponse>(response);
    
    // Clear stored data
    if (result.success) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    
    return result;
  },

  // Get stats
  getStats: async (): Promise<ProfileResponse> => {
    const response = await fetchWithAuth('/profile/stats');
    return handleResponse<ProfileResponse>(response);
  },
};

export { ProfileError };
export type { ProfileData, ProfileResponse };