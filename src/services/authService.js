import api from './api';

const AUTH_API_BASE_URL =
  process.env.REACT_APP_AUTH_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : '/api');

const requestAuth = async (endpoint, options = {}) => {
  const response = await fetch(`${AUTH_API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (error) {
      // Ignore non-JSON error bodies.
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

const authService = {
  login: async (identifier, password) => {
    try {
      const response = await requestAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  signup: async (userData) => {
    try {
      const response = await requestAuth('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  logout: () => {
    return requestAuth('/auth/logout', { method: 'POST', body: JSON.stringify({}) })
      .then(() => ({ success: true }))
      .catch((error) => ({ success: false, error: error.message }));
  },

  getCurrentUser: async () => {
    try {
      return await requestAuth('/auth/me', { method: 'GET' });
    } catch (error) {
      return { user: null };
    }
  },

  isAuthenticated: async () => {
    try {
      await requestAuth('/auth/me', { method: 'GET' });
      return true;
    } catch (error) {
      return false;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await requestAuth('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await requestAuth('/users/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordData),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await requestAuth('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default authService;
