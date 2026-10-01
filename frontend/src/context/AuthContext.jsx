import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'vastraa_boutique_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [loading, setLoading] = useState(true);

  // Load user details on initial render if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await api.getMe();
        setUser(userData);
      } catch (err) {
        console.error('Session expired or invalid token:', err);
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (credentials) => {
    const res = await api.login(credentials);
    if (res.token) {
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (customerData) => {
    const res = await api.register(customerData);
    if (res.token) {
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.logout();
      }
    } catch (err) {
      console.warn('Logout notification error:', err);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const res = await api.updateProfile(profileData);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
