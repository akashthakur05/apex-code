'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { useAuth } from './auth-provider'

/* ---------------------------------------------
   Firestore TYPES ONLY (SSG-safe)
--------------------------------------------- */
import type {
  QuerySnapshot,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore'

/* ---------------------------------------------
   Firebase lazy-loaded bindings
--------------------------------------------- */
let firebaseLoaded = false
let collection: any
let query: any
let orderBy: any
let onSnapshot: any
let Timestamp: any
let db: any

const isBrowser = typeof window !== 'undefined'

/* ---------------------------------------------
   Types
--------------------------------------------- */
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
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  clearAll: () => void
}

/* ---------------------------------------------
   Context
--------------------------------------------- */
const NotificationContext =
  createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error(
      'useNotifications must be used within NotificationsProvider'
    )
  }
  return ctx
}

/* ---------------------------------------------
   Default notifications
--------------------------------------------- */
const DEFAULT_NOTIFICATIONS: Notification[] = [
  // {
  //   id: 'welcome-shortcuts',
  //   title: 'Welcome!',
  //   message:
  //     'Version 12.0.2 — Shortcuts added: N/P navigation, A–D or 1–4 for answers.',
  //   type: 'info',
  //   timestamp: Date.now(),
  //   read: false,
  // },
  // {
  //   id: 'welcome-google-auth',
  //   title: 'Welcome!',
  //   message:
  //     'Version 12.0.2 — Google OAuth is now available for faster login.',
  //   type: 'info',
  //   timestamp: Date.now(),
  //   read: false,
  // },
]

/* ---------------------------------------------
   Provider
--------------------------------------------- */
export function NotificationsProvider({
  children,
}: {
  children: ReactNode
}) {
  const { user } = useAuth()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [viewedNotifications, setViewedNotifications] = useState<Set<string>>(
    new Set<string>()
  )
  const [isClient, setIsClient] = useState(false)

  /* -----------------------------------------
     Init client + defaults
  ----------------------------------------- */
  useEffect(() => {
    if (!isBrowser) return

    setIsClient(true)

    const stored = localStorage.getItem('viewed_notifications')
    const parsed: string[] = stored ? JSON.parse(stored) : []
    const viewed = new Set<string>(parsed)

    setViewedNotifications(viewed)

    setNotifications(
      DEFAULT_NOTIFICATIONS.filter(n => !viewed.has(n.id))
    )
  }, [])

  /* -----------------------------------------
     Firebase listener
  ----------------------------------------- */
  useEffect(() => {
    if (!user || !isClient) return

    let unsubscribe: (() => void) | undefined

    ;(async () => {
      try {
        if (!firebaseLoaded) {
          const firestore = await import('firebase/firestore')
          collection = firestore.collection
          query = firestore.query
          orderBy = firestore.orderBy
          onSnapshot = firestore.onSnapshot
          Timestamp = firestore.Timestamp

          const { getFirebaseDb } = await import('@/lib/firebase')
          db = await getFirebaseDb()
          firebaseLoaded = true
        }

        const q = query(
          collection(db, 'notifications'),
          orderBy('timestamp', 'desc')
        )

        unsubscribe = onSnapshot(
          q,
          (snapshot: QuerySnapshot<DocumentData>) => {
            if (!isBrowser) return

            const stored = localStorage.getItem('viewed_notifications')
            const parsed: string[] = stored ? JSON.parse(stored) : []
            const viewed = new Set<string>(parsed)

            const firebaseNotifications: Notification[] =
              snapshot.docs
                .map(
                  (
                    doc: QueryDocumentSnapshot<DocumentData>
                  ): Notification | null => {
                    const data = doc.data()

                    // if (
                    //   data.userId !== user.uid &&
                    //   data.userId !== 'broadcast'
                    // ) {
                    //   return null
                    // }

                    return {
                      id: doc.id,
                      title: data.title ?? 'Notification',
                      message: data.message ?? '',
                      type:
                        (data.type ??
                          'info') as Notification['type'],
                      timestamp:
                        data.timestamp?.toMillis?.() ??
                        Date.now(),
                      read: viewed.has(doc.id),
                    }
                  }
                )
                .filter(
                  (n): n is Notification => n !== null
                )

            const merged = [
              ...DEFAULT_NOTIFICATIONS,
              ...firebaseNotifications,
            ].filter(n => !viewed.has(n.id))

            setNotifications(merged)
          }
        )
      } catch (err) {
        console.error('Notification listener error:', err)
      }
    })()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user, isClient])

  /* -----------------------------------------
     Helpers
  ----------------------------------------- */
  const persistViewed = (id: string) => {
    if (!isBrowser) return

    const updated = new Set<string>(viewedNotifications)
    updated.add(id)

    setViewedNotifications(updated)
    localStorage.setItem(
      'viewed_notifications',
      JSON.stringify([...updated])
    )
  }

  /* -----------------------------------------
     Actions
  ----------------------------------------- */
  const addNotification = useCallback(
    (
      notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
    ) => {
      const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        read: false,
      }

      setNotifications(prev => [newNotification, ...prev])
    },
    []
  )

  const removeNotification = useCallback(
    (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id))
      persistViewed(id)
    },
    [viewedNotifications]
  )

  const markAsRead = useCallback(
    (id: string) => {
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      )
      persistViewed(id)
    },
    [viewedNotifications]
  )

  const clearAll = useCallback(() => {
    if (!isBrowser) return

    const updated = new Set<string>(viewedNotifications)
    notifications.forEach(n => updated.add(n.id))

    setViewedNotifications(updated)
    localStorage.setItem(
      'viewed_notifications',
      JSON.stringify([...updated])
    )

    setNotifications([])
  }, [notifications, viewedNotifications])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        markAsRead,
        clearAll,
      }}
    >
      {children}
      {isClient && <NotificationCenter />}
    </NotificationContext.Provider>
  )
}

/* ---------------------------------------------
   Notification Center UI
--------------------------------------------- */
function NotificationCenter() {
  const { notifications, removeNotification, markAsRead } =
    useNotifications()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  if (pathname !== '/') return null

  const unreadCount = notifications.filter(n => !n.read).length

  const bgByType: Record<Notification['type'], string> = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="relative p-3 bg-primary text-primary-foreground rounded-full shadow-lg"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 max-h-96 bg-background border rounded-lg shadow-xl overflow-y-auto">
          <div className="sticky top-0 bg-card border-b p-4 flex justify-between">
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
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-4 border-l-4 cursor-pointer ${
                  bgByType[n.type]
                } ${n.read ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-semibold">{n.title}</h4>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {n.message}
                    </p>
                    <p className="text-xs mt-2 text-muted-foreground">
                      {new Date(n.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation()
                      removeNotification(n.id)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
