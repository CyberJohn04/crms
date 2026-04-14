// API Base Configuration
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : '/api');

// Default headers for API requests
const getHeaders = () => ({ 'Content-Type': 'application/json' });

// Generic fetch wrapper
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      credentials: 'include',
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    console.log(`API Request: ${url} - Status: ${response.status}`);
    
    // Handle unauthorized errors first
    if (response.status === 401) {
      throw new Error('Session expired. Please login again.');
    }
    
    // Check if response is ok
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        if (errorText.trim()) {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        }
      } catch (e) {
        // Non-JSON error response
      }
      throw new Error(errorMessage);
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Non-JSON response:', contentType);
      return []; // or {} based on expected data
    }
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('Invalid JSON response from server');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// HTTP Methods
export const api = {
  get: (endpoint) => fetchAPI(endpoint, { method: 'GET' }),
  post: (endpoint, body) => fetchAPI(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => fetchAPI(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) => fetchAPI(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => fetchAPI(endpoint, { method: 'DELETE' }),
};

export default api;

