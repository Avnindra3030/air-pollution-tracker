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
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Air Quality API functions
export const fetchAirQualityData = async (lat, lng) => {
  try {
    const response = await api.get(`/air-quality/current?lat=${lat}&lng=${lng}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    throw error;
  }
};

export const fetchForecastData = async (lat, lng) => {
  try {
    const response = await api.get(`/air-quality/forecast?lat=${lat}&lng=${lng}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw error;
  }
};

export const fetchHistoricalData = async (lat, lng, days = 7) => {
  try {
    const response = await api.get(`/air-quality/historical?lat=${lat}&lng=${lng}&days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

// Indian Cities API functions
export const fetchIndianCities = async (state = null, search = null) => {
  try {
    const params = {};
    if (state) params.state = state;
    if (search) params.search = search;
    
    const response = await api.get('/air-quality/indian-cities', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching Indian cities:', error);
    throw error;
  }
};

// Location API functions
export const searchLocations = async (query) => {
  try {
    const response = await api.get(`/locations/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching locations:', error);
    // Return empty array if API is not available
    return [];
  }
};

export const getSavedLocations = async () => {
  try {
    const response = await api.get('/locations/saved');
    return response.data;
  } catch (error) {
    console.error('Error fetching saved locations:', error);
    throw error;
  }
};

export const saveLocation = async (locationData) => {
  try {
    const response = await api.post('/locations/save', locationData);
    return response.data;
  } catch (error) {
    console.error('Error saving location:', error);
    throw error;
  }
};

export const deleteSavedLocation = async (locationId) => {
  try {
    const response = await api.delete(`/locations/saved/${locationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting saved location:', error);
    throw error;
  }
};

// User authentication API functions
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    if (response.data.access_token) {
      localStorage.setItem('authToken', response.data.access_token);
    }
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('authToken', response.data.access_token);
    }
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('authToken');
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/users/me', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// User settings API functions
export const getUserSettings = async () => {
  try {
    const response = await api.get('/users/settings');
    return response.data;
  } catch (error) {
    console.error('Error getting user settings:', error);
    // Return default settings if not authenticated or settings not found
    return {
      aqi_threshold: 100,
      enable_notifications: true,
      notification_frequency: 'daily',
      preferred_units: 'metric',
      theme: 'light',
      language: 'en'
    };
  }
};

export const updateUserSettings = async (settings) => {
  try {
    const response = await api.put('/users/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

// Notifications API functions
export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// User preferences API functions (legacy - keeping for compatibility)
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