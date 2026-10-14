// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create Context for Global Auth State Management
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load persistent authentication data from localStorage on initial render
  useEffect(() => {
    const savedToken = localStorage.getItem('leiguhus_token');
    const savedUser = localStorage.getItem('leiguhus_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse cached user data:', err);
        localStorage.removeItem('leiguhus_token');
        localStorage.removeItem('leiguhus_user');
      }
    }
  }, []);

  // Login handler: Saves JWT token and user profile to state and localStorage
  const login = (authToken: string, userData: User) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('leiguhus_token', authToken);
    localStorage.setItem('leiguhus_user', JSON.stringify(userData));
  };

  // Logout handler: Clears all authentication states and localStorage keys
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('leiguhus_token');
    localStorage.removeItem('leiguhus_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume AuthContext easily across components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};