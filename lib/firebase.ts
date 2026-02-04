'use client'

// Lazy-loaded Firebase initialization to support static export
let firebaseInitialized = false
let cachedApp: any = null
let cachedAuth: any = null
let cachedDb: any = null
let initPromise: Promise<any> | null = null

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase only once on client (async version)
export const initFirebaseAsync = async () => {
  if (firebaseInitialized) return { app: cachedApp, auth: cachedAuth, db: cachedDb }
  if (typeof window === 'undefined') return { app: null, auth: null, db: null }

  // Prevent multiple initializations
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      const { initializeApp } = await import('firebase/app')
      const { getAuth } = await import('firebase/auth')
      const { getFirestore } = await import('firebase/firestore')

      cachedApp = initializeApp(firebaseConfig)
      cachedAuth = getAuth(cachedApp)
      cachedDb = getFirestore(cachedApp)
      firebaseInitialized = true
    } catch (error) {
      console.error('Firebase initialization error:', error)
    }

    return { app: cachedApp, auth: cachedAuth, db: cachedDb }
  })()

  return initPromise
}

// Export async getters
export const getFirebaseApp = async () => {
  const { app } = await initFirebaseAsync()
  return app
}

export const getFirebaseAuth = async () => {
  const { auth } = await initFirebaseAsync()
  return auth
}

export const getFirebaseDb = async () => {
  const { db } = await initFirebaseAsync()
  return db
}

// Direct exports for backward compatibility (will be null during build)
export const app = null
export const auth = null
export const db = null
