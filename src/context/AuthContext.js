import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const result = await authService.getCurrentUser();
        const currentUser = result?.user;

        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = useCallback(async (identifier, password) => {
    const result = await authService.login(identifier, password);

    if (result.success) {
      const userData = result.data?.user;
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    }

    return result;
  }, []);

  const signup = useCallback(async (userData) => {
    const result = await authService.signup(userData);

    if (result.success) {
      const createdUser = result.data?.user;
      setUser(createdUser);
      setIsAuthenticated(true);
      return { success: true, user: createdUser };
    }

    return result;
  }, []);

  const logout = useCallback(() => {
    return authService.logout().finally(() => {
      setUser(null);
      setIsAuthenticated(false);
    });
  }, []);

  const updateUser = useCallback(async (updatedUser) => {
    const result = await authService.updateProfile(updatedUser);

    if (result.success) {
      const nextUser = result.data?.user;
      setUser(nextUser);
      return { success: true, user: nextUser };
    }

    return result;
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
