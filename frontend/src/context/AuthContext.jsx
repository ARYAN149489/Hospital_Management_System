import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const response = await authAPI.getProfile();
        if (response.success) {
          // Backend returns { user, profile } in response.data
          // We need to merge them or use the user object with additional profile data
          const userData = response.data.user || response.data;
          
          // Add profile data to user object if available
          if (response.data.profile) {
            userData.profile = response.data.profile;
          }
          
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  };

  const login = async (credentials, role) => {
    try {
      const response = await authAPI.login({ ...credentials, role });
      
      if (response.success) {
        const { accessToken, refreshToken, user } = response.data;
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Set user state
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user, role: user.role };
      } else {
        // Backend returned success: false (this includes 403 from api.js catch)
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      // Extract error message from response
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'An error occurred during login';
      
      // Log unexpected errors (401, 500, network issues)
      // Note: 403 errors are now handled in api.js and won't reach here
      console.error('Login error:', error);
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const signup = async (userData, role = 'patient') => {
    try {
      // Split name into firstName and lastName
      const nameParts = userData.name ? userData.name.trim().split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName || 'User';

      // Clean phone number - remove spaces, dashes, and +91
      let cleanPhone = userData.phone ? userData.phone.replace(/[\s\-+]/g, '') : '';
      if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
        cleanPhone = cleanPhone.substring(2); // Remove country code
      }

      const signupData = {
        firstName,
        lastName,
        email: userData.email,
        password: userData.password,
        phone: cleanPhone,
        dateOfBirth: userData.dateOfBirth || new Date('1990-01-01').toISOString(),
        gender: userData.gender || 'other',
        role: role,
        address: userData.address ? {
          street: userData.address,
          city: '',
          state: '',
          pincode: ''
        } : {
          street: '',
          city: '',
          state: '',
          pincode: ''
        }
      };

      const response = await authAPI.register(signupData);
      
      if (response.success) {
        const { accessToken, refreshToken, user } = response.data;
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Set user state
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      } else {
        return { success: false, error: response.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      // Better error handling
      let errorMessage = 'An error occurred during signup';
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Validation errors from express-validator
        errorMessage = error.response.data.errors.map(err => err.message).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;