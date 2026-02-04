'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { NotificationsProvider } from './notifications-provider';
import { TourProvider } from './tour-provider';

interface User {
  uid: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const user: User = {
      uid: Date.now().toString(),
      email,
      name: email.split('@')[0],
    };
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('viewed_notifications');
    setUser(null);
  };

  const signup = async (email: string, password: string, name: string) => {
    const user: User = {
      uid: Date.now().toString(),
      email,
      name,
    };
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      <NotificationsProvider>
        <TourProvider>
          {children}
        </TourProvider>
      </NotificationsProvider>
    </AuthContext.Provider>
  );
}
