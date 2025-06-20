// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';

const AuthContext = createContext();

// Create axios instance with base URL
const API_URL = 'https://app.jaltol.app/api'; // Your Django app URL
// const API_URL = 'http://127.0.0.1:8000/api'; // For local development

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

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/token/refresh/', {
        refresh: refreshToken,
      });

      const { access } = response.data;
      localStorage.setItem('access_token', access);
      
      console.log('Token refreshed successfully');
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  // Login function
  const login = async (username, password) => {
    console.log('Login attempt for:', username);
    
    try {
      setError(null);
      
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

  // Register function
  const register = async (userData) => {
    console.log('Registration attempt for:', userData.username);
    
    try {
      setError(null);
      
      const response = await api.post('/auth/register/', userData);
      
      console.log('Registration response:', response.data);
      const { user: newUser, tokens } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage, details: error.response?.data };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    googleLogin,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};