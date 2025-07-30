import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://your-api-domain.com/api';

// Token management
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

// API client with authentication
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getHeaders(includeAuth = true): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = await getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders(includeAuth);

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Generic CRUD methods
  async get<T>(endpoint: string, includeAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  async post<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      includeAuth
    );
  }

  async put<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      includeAuth
    );
  }

  async delete<T>(endpoint: string, includeAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post<any>('/auth/login', { email, password }, false);
    if (response.token) {
      await setAuthToken(response.token);
    }
    return response;
  },

  register: async (userData: {
    email: string;
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
  }) => {
    const response = await apiClient.post<any>('/auth/register', userData, false);
    if (response.token) {
      await setAuthToken(response.token);
    }
    return response;
  },

  logout: async () => {
    await removeAuthToken();
  },

  getProfile: async () => {
    return apiClient.get<any>('/auth/profile');
  },

  updateProfile: async (profileData: any) => {
    return apiClient.put<any>('/auth/profile', profileData);
  },
};

// Periods API
export const periodsAPI = {
  logPeriod: async (data: { period_start_date: string; notes?: string }) => {
    return apiClient.post<any>('/periods/log', data);
  },

  endPeriod: async (cycleId: string, period_end_date: string) => {
    return apiClient.put<any>(`/periods/end/${cycleId}`, { period_end_date });
  },

  getHistory: async (limit = 12, offset = 0) => {
    return apiClient.get<any>(`/periods/history?limit=${limit}&offset=${offset}`);
  },

  getPredictions: async () => {
    return apiClient.get<any>('/periods/predictions');
  },

  logSymptom: async (data: {
    date: string;
    symptom_type: string;
    severity: number;
    notes?: string;
  }) => {
    return apiClient.post<any>('/periods/symptoms', data);
  },

  getSymptoms: async (start_date?: string, end_date?: string) => {
    const params = new URLSearchParams();
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    return apiClient.get<any>(`/periods/symptoms?${params.toString()}`);
  },

  logMood: async (data: {
    date: string;
    mood_type: string;
    intensity: number;
    notes?: string;
  }) => {
    return apiClient.post<any>('/periods/moods', data);
  },

  getMoods: async (start_date?: string, end_date?: string) => {
    const params = new URLSearchParams();
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    return apiClient.get<any>(`/periods/moods?${params.toString()}`);
  },
};

// Community API
export const communityAPI = {
  createPost: async (data: {
    title?: string;
    content: string;
    category?: string;
    is_anonymous?: boolean;
    images?: string[];
  }) => {
    return apiClient.post<any>('/community/posts', data);
  },

  getPosts: async (params: {
    limit?: number;
    offset?: number;
    category?: string;
    user_id?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return apiClient.get<any>(`/community/posts?${searchParams.toString()}`, false);
  },

  getPost: async (postId: string) => {
    return apiClient.get<any>(`/community/posts/${postId}`, false);
  },

  likePost: async (postId: string) => {
    return apiClient.post<any>(`/community/posts/${postId}/like`, {});
  },

  addComment: async (postId: string, data: {
    content: string;
    parent_comment_id?: string;
    is_anonymous?: boolean;
  }) => {
    return apiClient.post<any>(`/community/posts/${postId}/comments`, data);
  },

  getComments: async (postId: string, limit = 50, offset = 0) => {
    return apiClient.get<any>(`/community/posts/${postId}/comments?limit=${limit}&offset=${offset}`, false);
  },

  deletePost: async (postId: string) => {
    return apiClient.delete<any>(`/community/posts/${postId}`);
  },
};

// Remedies API
export const remediesAPI = {
  createRemedy: async (data: {
    title: string;
    description: string;
    ingredients: string[];
    instructions: string;
    category: string;
  }) => {
    return apiClient.post<any>('/remedies', data);
  },

  getRemedies: async (params: {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return apiClient.get<any>(`/remedies?${searchParams.toString()}`, false);
  },

  getRemedy: async (remedyId: string) => {
    return apiClient.get<any>(`/remedies/${remedyId}`, false);
  },

  rateRemedy: async (remedyId: string, data: { rating: number; review?: string }) => {
    return apiClient.post<any>(`/remedies/${remedyId}/rate`, data);
  },

  getCategories: async () => {
    return apiClient.get<any>('/remedies/categories/list', false);
  },

  searchRemedies: async (query: string, limit = 10) => {
    return apiClient.get<any>(`/remedies/search/${encodeURIComponent(query)}?limit=${limit}`, false);
  },

  updateRemedy: async (remedyId: string, data: any) => {
    return apiClient.put<any>(`/remedies/${remedyId}`, data);
  },

  deleteRemedy: async (remedyId: string) => {
    return apiClient.delete<any>(`/remedies/${remedyId}`);
  },
};

// Resources API
export const resourcesAPI = {
  createResource: async (data: {
    title: string;
    description?: string;
    url?: string;
    resource_type: string;
    category: string;
  }) => {
    return apiClient.post<any>('/resources', data);
  },

  getResources: async (params: {
    limit?: number;
    offset?: number;
    category?: string;
    resource_type?: string;
    search?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return apiClient.get<any>(`/resources?${searchParams.toString()}`, false);
  },

  getResource: async (resourceId: string) => {
    return apiClient.get<any>(`/resources/${resourceId}`, false);
  },

  getCategoriesAndTypes: async () => {
    return apiClient.get<any>('/resources/meta/categories-types', false);
  },

  searchResources: async (query: string, limit = 10) => {
    return apiClient.get<any>(`/resources/search/${encodeURIComponent(query)}?limit=${limit}`, false);
  },

  updateResource: async (resourceId: string, data: any) => {
    return apiClient.put<any>(`/resources/${resourceId}`, data);
  },

  deleteResource: async (resourceId: string) => {
    return apiClient.delete<any>(`/resources/${resourceId}`);
  },
};

export { getAuthToken, setAuthToken, removeAuthToken };