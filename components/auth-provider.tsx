'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { NotificationsProvider } from './notifications-provider';
import { TourProvider } from './tour-provider';

interface AuthContextType {
  user: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupAuth = async () => {
      try {
        const { getFirebaseAuth } = await import('@/lib/firebase')
        const { onAuthStateChanged } = await import('firebase/auth')
        const auth = getFirebaseAuth()
        
        if (!auth) {
          setLoading(false)
          return
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Auth setup error:', error)
        setLoading(false)
      }
    }

    const cleanup = setupAuth()
    return () => {
      cleanup?.then((fn) => fn?.())
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <NotificationsProvider>
        <TourProvider>
          {children}
        </TourProvider>
      </NotificationsProvider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
