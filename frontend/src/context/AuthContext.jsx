import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUserLoggedIn = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.me();
      setUser(data.user);
      setProfile(data.profile);
    } catch (error) {
      console.error('Failed to load user profile:', error.message);
      localStorage.removeItem('token');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('token', data.token);
      await checkUserLoggedIn();
      return data;
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.message || 'Login failed. Please check credentials.';
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem('token', data.token);
      await checkUserLoggedIn();
      return data;
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.message || 'Registration failed.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        refreshUser: checkUserLoggedIn
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
