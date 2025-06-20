// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';

const AuthContext = createContext();

// Create axios instance with base URL
// const API_URL = 'https://app.jaltol.app/api'; // Your Django app URL
const API_URL = 'http://127.0.0.1:8000/api'; // For local development

// Create a stable API instance outside of the component
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Log requests for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.baseURL + config.url);
    
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Log responses for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Received response:', response.status, response.data);
    return response;
  },
  async (error) => {
    console.error('Response error:', error.message);
    
    // Log more details about the error
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received, request was:', error.request);
    }
    
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [googleClientId, setGoogleClientId] = useState(null);

  // Fetch Google OAuth2 client ID on mount
  useEffect(() => {
    const fetchGoogleConfig = async () => {
      try {
        const response = await api.get('/auth/google/config/');
        setGoogleClientId(response.data.client_id);
        console.log('Google OAuth2 client ID loaded');
      } catch (error) {
        console.error('Failed to load Google OAuth2 config:', error);
      }
    };
    
    fetchGoogleConfig();
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
          setUser(JSON.parse(userData));
        } else {
          // Token expired, try to refresh
          refreshToken();
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  // Regular login function
  const login = async (username, password) => {
    console.log('Login attempt with:', username);
    
    try {
      setError(null);
      
      // Test the API connection
      try {
        await axios.get(`${API_URL}/health/`);
        console.log('API connection verified');
      } catch (healthError) {
        console.error('API health check failed:', healthError);
        setError('Cannot connect to API server');
        return { success: false, error: 'Cannot connect to API server' };
      }
      
      console.log('Making login request to:', `${API_URL}/auth/login/`);
      const response = await api.post('/auth/login/', {
        username,
        password,
      });
      
      console.log('Login response:', response.data);
      const { user: userData, tokens } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Login full error:', error);
      
      // Better error handling for field-specific errors
      let errorMessage = 'Login failed';
      
      if (error.response?.data) {
        // Check for field-specific errors
        const errorData = error.response.data;
        
        if (errorData.username) {
          errorMessage = `Username: ${errorData.username[0]}`;
        } else if (errorData.password) {
          errorMessage = `Password: ${errorData.password[0]}`;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage, details: error.response?.data };
    }
  };

  // Google login function
  const googleLogin = async (googleToken) => {
    console.log('Google login attempt');
    
    try {
      setError(null);
      
      const response = await api.post('/auth/google/', {
        id_token: googleToken,
      });
      
      console.log('Google login response:', response.data);
      const { user: userData, tokens } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Google login error:', error);
      
      let errorMessage = 'Google login failed';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    console.log('Register attempt with:', userData.username);
    
    try {
      setError(null);
      
      console.log('Making register request to:', `${API_URL}/auth/register/`);
      const response = await api.post('/auth/register/', userData);
      
      console.log('Register response:', response.data);
      const { user: newUser, tokens } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration full error:', error);
      
      // Better error handling for field-specific errors
      let errorMessage = 'Registration failed';
      
      if (error.response?.data) {
        // Check for field-specific errors
        const errorData = error.response.data;
        
        // Check common fields that might have errors
        if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        } else if (errorData.username) {
          errorMessage = `Username: ${errorData.username[0]}`;
        } else if (errorData.password) {
          errorMessage = `Password: ${errorData.password[0]}`;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        }
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage, details: error.response?.data };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          await api.post('/auth/logout/', { refresh_token: refreshToken });
        } catch (logoutError) {
          // Just log the error but proceed with local logout
          console.error('Backend logout error:', logoutError.response?.data || logoutError.message);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        logout();
        return;
      }

      const response = await api.post('/auth/token/refresh/', {
        refresh: refreshToken,
      });

      const { access } = response.data;
      localStorage.setItem('access_token', access);
      
      // Get updated user data
      const userResponse = await api.get('/auth/profile/');
      const userData = userResponse.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await api.put('/auth/profile/update/', profileData);
      
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (oldPassword, newPassword, newPasswordConfirm) => {
    try {
      setError(null);
      const response = await api.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.old_password?.[0] ||
                          error.response?.data?.new_password?.[0] ||
                          'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    googleLogin,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    clearError: () => setError(null),
    googleClientId,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };