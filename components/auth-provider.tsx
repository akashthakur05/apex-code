'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import { NotificationsProvider } from './notifications-provider'
import { TourProvider } from './tour-provider'
import { auth, getFirebaseAuth } from '@/lib/firebase'
import { initializeSavedQuestionsCache } from '@/lib/firebase-saved-questions'
import { onAuthStateChanged } from 'firebase/auth'

interface User {
  uid: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: any | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    ;(async () => {
      try {
        const { getFirebaseAuth } = await import('@/lib/firebase')
        const { onAuthStateChanged } = await import('firebase/auth')
        const auth = await getFirebaseAuth()

        if (!auth) {
          setLoading(false)
          return
        }

        unsubscribe = onAuthStateChanged(auth, currentUser => {
          setUser(currentUser)
          setLoading(false)
        })
      } catch (e) {
        console.error('Auth setup error:', e)
        setLoading(false)
      }
    })()

    return () => unsubscribe?.()
  }, [])

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
 useEffect(() => {
  getFirebaseAuth().then(auth => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) await initializeSavedQuestionsCache()
    })
  })
}, [])


  return (
    <AuthContext.Provider value={{ user, loading }}>
      <NotificationsProvider>
        <TourProvider>
          {children}
        </TourProvider>
      </NotificationsProvider>
    </AuthContext.Provider>
  )
}
