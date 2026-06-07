import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const response = await authAPI.getProfile();
        if (response.success) {
          const userData = response.data.user || response.data;
          if (response.data.profile) userData.profile = response.data.profile;
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch {
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
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(user);
        setIsAuthenticated(true);
        return { success: true, user, role: user.role };
      }
      return { success: false, error: response.message || 'Login failed' };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'An error occurred' };
    }
  };

  const signup = async (userData, role = 'patient') => {
    try {
      const nameParts = (userData.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName || 'User';
      let cleanPhone = (userData.phone || '').replace(/[\s\-+]/g, '');
      if (cleanPhone.startsWith('91') && cleanPhone.length === 12) cleanPhone = cleanPhone.substring(2);

      const signupData = {
        firstName, lastName,
        email: userData.email,
        password: userData.password,
        phone: cleanPhone,
        dateOfBirth: userData.dateOfBirth || new Date('1990-01-01').toISOString(),
        gender: userData.gender || 'other',
        role,
        address: { street: userData.address || '', city: '', state: '', pincode: '' }
      };

      const response = await authAPI.register(signupData);
      if (response.success) {
        const { accessToken, refreshToken, user } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(user);
        setIsAuthenticated(true);
        return { success: true, user };
      }
      return { success: false, error: response.message || 'Signup failed' };
    } catch (err) {
      const errData = err.response?.data;
      const msg = Array.isArray(errData?.errors)
        ? errData.errors.map(e => e.message).join(', ')
        : errData?.message || err.message || 'An error occurred';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user state in memory
  const updateUser = (userData) => setUser(userData);

  // Refresh user profile from backend — call this after profile updates
  // to ensure the context reflects the latest data persisted on the server
  const refreshProfile = useCallback(async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        const userData = response.data.user || response.data;
        if (response.data.profile) userData.profile = response.data.profile;
        setUser(userData);
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, refreshProfile, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
