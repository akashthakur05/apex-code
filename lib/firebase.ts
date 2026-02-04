'use client'

// Lazy-loaded Firebase initialization to support static export
let firebaseInitialized = false
let cachedApp: any = null
let cachedAuth: any = null
let cachedDb: any = null

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase only once on client
const initFirebase = () => {
  if (firebaseInitialized || typeof window === 'undefined') return { app: cachedApp, auth: cachedAuth, db: cachedDb }

  try {
    const { initializeApp } = require('firebase/app')
    const { getAuth } = require('firebase/auth')
    const { getFirestore } = require('firebase/firestore')

    cachedApp = initializeApp(firebaseConfig)
    cachedAuth = getAuth(cachedApp)
    cachedDb = getFirestore(cachedApp)
    firebaseInitialized = true
  } catch (error) {
    console.error('Firebase initialization error:', error)
  }

  return { app: cachedApp, auth: cachedAuth, db: cachedDb }
}

// Export lazy getters
export const getFirebaseApp = () => {
  const { app } = initFirebase()
  return app
}

export const getFirebaseAuth = () => {
  const { auth } = initFirebase()
  return auth
}

export const getFirebaseDb = () => {
  const { db } = initFirebase()
  return db
}

// Direct exports for backward compatibility (will be undefined during build)
export const app = typeof window !== 'undefined' ? getFirebaseApp() : null
export const auth = typeof window !== 'undefined' ? getFirebaseAuth() : null
export const db = typeof window !== 'undefined' ? getFirebaseDb() : null
