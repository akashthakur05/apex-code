'use client'

export interface NotificationData {
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: any
  read: boolean
}

/**
 * Add a notification to Firebase for a specific user
 */
export async function addNotificationForUser(
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
) {
  try {
    const { collection, addDoc, Timestamp } = await import('firebase/firestore')
    const { getFirebaseDb } = await import('@/lib/firebase')
    const db = await getFirebaseDb()
    
    if (!db) throw new Error('Firebase not initialized')
    
    const docRef = await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      timestamp: Timestamp.now(),
      read: false,
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding notification:', error)
    throw error
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { updateDoc, doc } = await import('firebase/firestore')
    const { getFirebaseDb } = await import('@/lib/firebase')
    const db = await getFirebaseDb()
    
    if (!db) throw new Error('Firebase not initialized')
    
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

/**
 * Get all unread notifications for a user
 */
export async function getUnreadNotifications(userId: string) {
  try {
    const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')
    const { getFirebaseDb } = await import('@/lib/firebase')
    const db = await getFirebaseDb()
    
    if (!db) throw new Error('Firebase not initialized')
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('timestamp', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error getting unread notifications:', error)
    return []
  }
}

/**
 * Get all notifications for a user
 */
export async function getAllNotifications(userId: string) {
  try {
    const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')
    const { getFirebaseDb } = await import('@/lib/firebase')
    const db = await getFirebaseDb()
    
    if (!db) throw new Error('Firebase not initialized')
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error getting notifications:', error)
    return []
  }
}

/**
 * Add a broadcast notification (for all users)
 */
export async function addBroadcastNotification(
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
) {
  try {
    const { collection, addDoc, Timestamp } = await import('firebase/firestore')
    const { getFirebaseDb } = await import('@/lib/firebase')
    const db = await getFirebaseDb()
    
    if (!db) throw new Error('Firebase not initialized')
    
    const docRef = await addDoc(collection(db, 'notifications'), {
      userId: 'broadcast',
      title,
      message,
      type,
      timestamp: Timestamp.now(),
      read: false,
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding broadcast notification:', error)
    throw error
  }
}
