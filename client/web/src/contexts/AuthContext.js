import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      console.log('Checking auth status...');
      const isLoggedIn = authService.isLoggedIn();
      console.log('Is logged in:', isLoggedIn);
      
      if (isLoggedIn) {
        const storedUser = authService.getStoredUser();
        console.log('Stored user:', storedUser);
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        console.log('No valid auth, clearing state');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrEmployeeCode, password, rememberMe) => {
    try {
      const response = await authService.login(emailOrEmployeeCode, password, rememberMe);
      console.log('Login response:', response);
      console.log('User roles:', response.user?.roles);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logout: Setting logging out flag...');
      setIsLoggingOut(true);
      
      console.log('Logout: Clearing localStorage and state...');
      // Clear localStorage first to prevent checkAuthStatus from restoring user
      authService.clearAuthData();
      
      // Clear state immediately 
      setUser(null);
      setIsAuthenticated(false);
      
      // Call logout API (but localStorage is already cleared)
      await authService.logout();
      
      // Add small delay to ensure state has propagated
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear everything
      authService.clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      await new Promise(resolve => setTimeout(resolve, 100));
    } finally {
      // Reset the logging out flag after a longer delay to prevent race condition
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 500);
    }
  };

  const isAdmin = () => {
    return user && user.roles && (user.roles.includes('Quản trị viên') || user.roles.includes('QUANTRI'));
  };

  const hasRole = (role) => {
    return user && user.roles && user.roles.includes(role);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    isLoggingOut,
    isAdmin,
    hasRole,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};