'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

// Firebase imports are lazy-loaded to support static export
let firebaseLoaded = false
let collection: any, query: any, where: any, orderBy: any, onSnapshot: any, Timestamp: any, db: any

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }
  return context
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Welcome!',
    message: 'Version 12.0.2 - Shortcuts are now available. N/n-Next, P/p-Previous ,A/1-Option1, B/2-Option2, C/3-Option3, D/4-Option4,',
    type: 'info',
    timestamp: Date.now(),
    read: false,
  },
  {
    id: '2',
    title: 'Welcome!',
    message: 'Version 12.0.2 - Google OAuth is now supported for authentication. You can now sign in using your Google account for a more seamless experience.',
    type: 'info',
    timestamp: Date.now(),
    read: false,
  },
]

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [isClient, setIsClient] = React.useState(false)
  const [viewedNotifications, setViewedNotifications] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<any>(null)

  React.useEffect(() => {
    // Initialize on client only
    setIsClient(true)
    // Load viewed notifications from localStorage
    const stored = localStorage.getItem('viewed_notifications')
    const viewed = stored ? new Set(JSON.parse(stored)) : new Set<string>()
    setViewedNotifications(viewed)

    // Filter out already viewed notifications
    const unviewedNotifications = DEFAULT_NOTIFICATIONS.filter(n => !viewed.has(n.id))
    setNotifications(unviewedNotifications)

    // Try to lazy-load and get user from auth provider
    const loadUser = async () => {
      try {
        const { useAuth: useAuthImport } = await import('./auth-provider')
        const auth = useAuthImport()
        if (auth?.user) {
          setUser(auth.user)
        }
      } catch (error) {
        console.error('Failed to load auth provider:', error)
      }
    }
    loadUser()
  }, [])

  // Fetch notifications from Firebase (lazy-loaded)
  useEffect(() => {
    if (!user || !isClient) return

    const setupFirebaseListener = async () => {
      try {
        // Lazy load Firebase
        if (!firebaseLoaded) {
          const firebaseModule = await import('firebase/firestore')
          collection = firebaseModule.collection
          query = firebaseModule.query
          where = firebaseModule.where
          orderBy = firebaseModule.orderBy
          onSnapshot = firebaseModule.onSnapshot
          Timestamp = firebaseModule.Timestamp
          const { db: firebaseDb } = await import('@/lib/firebase')
          db = firebaseDb
          firebaseLoaded = true
        }

        // Query for user-specific and broadcast notifications
        const q = query(
          collection(db, 'notifications'),
          orderBy('timestamp', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const firebaseNotifications = snapshot.docs
            .map((doc: any) => {
              const data = doc.data()
              // Include if it's for this user or if it's a broadcast
              if (data.userId === user.uid || data.userId === 'broadcast') {
                return {
                  id: doc.id,
                  title: data.title || 'Notification',
                  message: data.message || '',
                  type: (data.type || 'info') as 'info' | 'success' | 'warning' | 'error',
                  timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : Date.now(),
                  read: data.read || false,
                }
              }
              return null
            })
            .filter((n: any): n is Notification => n !== null)
          
          // Combine with default notifications
          const combined = [...DEFAULT_NOTIFICATIONS, ...firebaseNotifications]
          const viewed = new Set(viewedNotifications)
          const filtered = combined.filter(n => !viewed.has(n.id))
          setNotifications(filtered)
        }, (error: any) => {
          console.error('Error fetching notifications from Firebase:', error)
        })

        return () => unsubscribe()
      } catch (error) {
        console.error('Error setting up Firebase notifications listener:', error)
      }
    }

    setupFirebaseListener()
  }, [user, isClient, viewedNotifications])

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
      }
      setNotifications((prev) => [newNotification, ...(prev || [])])
    },
    []
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => (prev || []).filter((n) => n.id !== id))
    // Mark as viewed in localStorage
    const updated = new Set(viewedNotifications)
    updated.add(id)
    setViewedNotifications(updated)
    localStorage.setItem('viewed_notifications', JSON.stringify(Array.from(updated)))
  }, [viewedNotifications])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      (prev || []).map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    // Mark as viewed in localStorage
    const updated = new Set(viewedNotifications)
    updated.add(id)
    setViewedNotifications(updated)
    localStorage.setItem('viewed_notifications', JSON.stringify(Array.from(updated)))
  }, [viewedNotifications])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider
      value={{ notifications: notifications || [], addNotification, removeNotification, markAsRead, clearAll }}
    >
      {children}
      {isClient && <NotificationCenter />}
    </NotificationContext.Provider>
  )
}

function NotificationCenter() {
  const { notifications, removeNotification, markAsRead } = useNotifications()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  // Only show notifications on homepage
  const isHomepage = pathname === '/'
  
  if (!isHomepage) {
    return null
  }
  
  const unreadCount = notifications.filter((n) => !n.read).length

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTypeTextColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'warning':
        return 'text-yellow-800'
      case 'error':
        return 'text-red-800'
      default:
        return 'text-blue-800'
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow"
        data-tour="notification-bell"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 max-h-96 bg-background border rounded-lg shadow-xl overflow-y-auto">
          <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 cursor-pointer hover:bg-muted transition ${getTypeColor(
                    notification.type
                  )} ${notification.read ? 'opacity-60' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${getTypeTextColor(notification.type)}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm mt-1 text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(notification.id)
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
