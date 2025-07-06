import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Air Quality API functions
export const fetchAirQualityData = async (lat, lng) => {
  try {
    const response = await api.get('/api/air-quality/current', {
      params: { lat, lng }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    throw error;
  }
};

export const fetchForecastData = async (lat, lng) => {
  try {
    const response = await api.get('/api/air-quality/forecast', {
      params: { lat, lng }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw error;
  }
};

export const fetchHistoricalData = async (lat, lng, days = 7) => {
  try {
    const response = await api.get('/api/air-quality/historical', {
      params: { lat, lng, days }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

export const fetchIndianCities = async (state = null, search = null) => {
  try {
    const params = {};
    if (state) params.state = state;
    if (search) params.search = search;
    
    const response = await api.get('/api/air-quality/indian-cities', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching Indian cities:', error);
    throw error;
  }
};

// Location API functions
export const searchLocations = async (query) => {
  try {
    const response = await api.get(`/api/locations/search`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
};

export const getLocationInfo = async (lat, lng) => {
  try {
    const response = await api.get(`/api/locations/info`, {
      params: { lat, lng }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting location info:', error);
    return null;
  }
};

// User preferences API functions
export const saveUserPreferences = async (preferences) => {
  try {
    const response = await api.post('/api/user/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw error;
  }
};

export const getUserPreferences = async () => {
  try {
    const response = await api.get('/api/user/preferences');
    return response.data;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
};

// Alerts API functions
export const getAlerts = async () => {
  try {
    const response = await api.get('/api/alerts');
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
};

export const createAlert = async (alertData) => {
  try {
    const response = await api.post('/api/alerts', alertData);
    return response.data;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

export default api; 