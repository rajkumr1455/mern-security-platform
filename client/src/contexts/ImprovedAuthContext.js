import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';


const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Verify token with backend
          const response = await api.get('/auth/verify');
          if (response.data.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // Invalid token, remove it
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          // Token verification failed
          localStorage.removeItem('authToken');
          // logger.error('Token verification failed:', error); // TODO: Implement client-side logging
        }
      }

      // For development mode, auto-login if no token exists
      if (process.env.NODE_ENV === 'development' && !token) {
        const devUser = {
          id: 'dev-user-1',
          username: 'admin',
          email: 'admin@platform.com',
          role: 'admin'
        };
        setUser(devUser);
        setIsAuthenticated(true);
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', credentials);

      if (response.data.success) {
        const { user, token } = response.data

        // Store token
        localStorage.setItem('authToken', token);

        // Update state
        setUser(user);
        setIsAuthenticated(true);

        return { success: true, user };
      } else {
        return {
          success: false,
          error: response.data.error || 'Login failed'
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Network error occurred';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await api.post('/auth/logout');
    } catch (error) {
      // logger.error('Logout error:', error); // TODO: Implement client-side logging
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh');
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        return true
      }
      return false
    } catch (error) {
      // logger.error('Token refresh failed:', error); // TODO: Implement client-side logging
      return false
    }
  };

  const updateUser = (updatedUser) => {
    setUser(prevUser => ({ ...prevUser, ...updatedUser })
  };

  const value = {
    user,
    login,
    logout,
    refreshToken,
    updateUser,
    loading,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;