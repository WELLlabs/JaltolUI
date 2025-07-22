// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';
import { 
  getAvailablePlans, 
  getUserPlan, 
  selectPlan, 
  changePlan, 
  checkPlanRequirements 
} from '../services/api';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [userPlan, setUserPlan] = useState(null);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [planRequirements, setPlanRequirements] = useState(null);

  const loadPlanData = useCallback(async () => {
    try {
      // Load available plans
      const plansResponse = await getAvailablePlans();
      if (plansResponse.success) {
        setAvailablePlans(plansResponse.plans);
      }

      // Load user's current plan
      try {
        const userPlanResponse = await getUserPlan();
        if (userPlanResponse.success) {
          setUserPlan(userPlanResponse.user_plan);
        }
      } catch (error) {
        // User might not have a plan assigned yet
        console.log('User plan not found:', error);
      }
    } catch (error) {
      console.error('Error loading plan data:', error);
    }
  }, []);

  const checkUserPlanRequirements = useCallback(async () => {
    try {
      const response = await checkPlanRequirements();
      if (response.success) {
        setPlanRequirements(response);
        setShowPlanSelection(response.needs_plan_selection);
      }
    } catch (error) {
      console.error('Error checking plan requirements:', error);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/token/refresh/', {
        refresh: refreshToken
      });

      localStorage.setItem('access_token', response.data.access);
      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Check if token is expired
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          console.log('Token expired, attempting refresh...');
          const refreshed = await refreshToken();
          if (!refreshed) {
            logout();
            return;
          }
        }
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        logout();
        return;
      }

      // Verify token with backend
      try {
        const response = await api.get('/auth/profile/');
        setUser(response.data);
        setIsAuthenticated(true);
        console.log('Auth status verified, user:', response.data.username);
      } catch (error) {
        console.error('Error verifying auth status:', error);
        if (error.response?.status === 401) {
          const refreshed = await refreshToken();
          if (!refreshed) {
            logout();
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [refreshToken]);

  // Initialize authentication state
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Load plan information when user is authenticated (but only once)
  useEffect(() => {
    if (isAuthenticated && user && availablePlans.length === 0) {
      loadPlanData();
      checkUserPlanRequirements();
    }
  }, [isAuthenticated, user, loadPlanData, checkUserPlanRequirements, availablePlans.length]);

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login/', credentials);
      
      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        console.log('Login successful for user:', response.data.user.username);
        
        return { success: true, user: response.data.user };
      }
      
      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register/', userData);
      
      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        console.log('Registration successful for user:', response.data.user.username);
        
        return { success: true, user: response.data.user };
      }
      
      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data || error.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const googleLogin = useCallback(async (idToken) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/google/', {
        id_token: idToken
      });
      
      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        console.log('Google login successful for user:', response.data.user.username);
        
        return { 
          success: true, 
          user: response.data.user,
          isNewUser: response.data.is_new_user || false
        };
      }
      
      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      console.error('Google login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Google login failed' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
    setUserPlan(null);
    setShowPlanSelection(false);
    setPlanRequirements(null);
    setAvailablePlans([]); // Clear plans on logout
    console.log('User logged out');
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await api.put('/auth/profile/update/', profileData);
      
      if (response.data.user) {
        setUser(response.data.user);
        console.log('Profile updated successfully');
        return { success: true, user: response.data.user };
      }
      
      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error.response?.data || error.message || 'Profile update failed' 
      };
    }
  }, []);

  // Plan management functions
  const handleSelectPlan = useCallback(async (planId) => {
    try {
      setLoading(true);
      const response = await selectPlan(planId);
      
      if (response.success) {
        setUser(response.user);
        setShowPlanSelection(false);
        await loadPlanData(); // Reload plan data
        console.log('Plan selected successfully:', response.message);
        return { success: true, message: response.message };
      }
      
      return { success: false, error: response.errors || 'Plan selection failed' };
    } catch (error) {
      console.error('Plan selection error:', error);
      return { 
        success: false, 
        error: error.response?.data?.errors || error.message || 'Plan selection failed' 
      };
    } finally {
      setLoading(false);
    }
  }, [loadPlanData]);

  const handleChangePlan = useCallback(async (planId) => {
    try {
      setLoading(true);
      const response = await changePlan(planId);
      
      if (response.success) {
        setUser(response.user);
        await loadPlanData(); // Reload plan data
        console.log('Plan changed successfully:', response.message);
        return { success: true, message: response.message };
      }
      
      return { success: false, error: response.errors || 'Plan change failed' };
    } catch (error) {
      console.error('Plan change error:', error);
      return { 
        success: false, 
        error: error.response?.data?.errors || error.message || 'Plan change failed' 
      };
    } finally {
      setLoading(false);
    }
  }, [loadPlanData]);

  const dismissPlanSelection = useCallback(() => {
    setShowPlanSelection(false);
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    availablePlans,
    userPlan,
    showPlanSelection,
    planRequirements,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    handleSelectPlan,
    handleChangePlan,
    dismissPlanSelection,
    refreshPlanData: loadPlanData,
    checkUserPlanRequirements
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