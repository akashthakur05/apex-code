'use client'

import { getFirebaseDb, getFirebaseAuth } from '@/lib/firebase'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'

export interface UserProgress {
  userId: string
  coachingId: string
  testId: string
  sectionId: string
  isCompleted: boolean
  completedAt?: Timestamp
  updatedAt: Timestamp
}

export interface TestProgress {
  userId: string
  coachingId: string
  testId: string
  isComplete: boolean
  completedAt?: Timestamp
  updatedAt: Timestamp
}

const SECTION_PROGRESS_COLLECTION = 'section_progress'
const TEST_PROGRESS_COLLECTION = 'test_progress'

export async function saveSectionProgress(
  coachingId: string,
  testId: string,
  sectionId: string,
  isCompleted: boolean
): Promise<void> {
  try {
    const auth = await getFirebaseAuth()
    const db = await getFirebaseDb()

    if (!auth?.currentUser) {
      console.warn('User not authenticated')
      return
    }

    const userId = auth.currentUser.uid
    const docId = `${userId}-${coachingId}-${testId}-${sectionId}`
    const docRef = doc(db, SECTION_PROGRESS_COLLECTION, docId)

    const now = Timestamp.now()
    const progressData: UserProgress = {
      userId,
      coachingId,
      testId,
      sectionId,
      isCompleted,
      completedAt: isCompleted ? now : undefined,
      updatedAt: now,
    }

    await setDoc(docRef, progressData, { merge: true })
  } catch (error) {
    console.error('Error saving section progress:', error)
    throw error
  }
}

export async function getSectionProgress(
  coachingId: string,
  testId: string,
  sectionId: string
): Promise<boolean> {
  try {
    const auth = await getFirebaseAuth()
    const db = await getFirebaseDb()

    if (!auth?.currentUser) {
      return false
    }

    const userId = auth.currentUser.uid
    const docId = `${userId}-${coachingId}-${testId}-${sectionId}`
    const docRef = doc(db, SECTION_PROGRESS_COLLECTION, docId)
    const snapshot = await getDoc(docRef)

    if (snapshot.exists()) {
      return snapshot.data().isCompleted ?? false
    }
    return false
  } catch (error) {
    console.error('Error getting section progress:', error)
    return false
  }
}

export async function getTestProgress(
  coachingId: string,
  testId: string
): Promise<{ completed: number; total: number; percentage: number }> {
  try {
    const auth = await getFirebaseAuth()
    const db = await getFirebaseDb()

    if (!auth?.currentUser) {
      return { completed: 0, total: 0, percentage: 0 }
    }

    const userId = auth.currentUser.uid
    const q = query(
      collection(db, SECTION_PROGRESS_COLLECTION),
      where('userId', '==', userId),
      where('coachingId', '==', coachingId),
      where('testId', '==', testId)
    )

    const snapshot = await getDocs(q)
    const completed = snapshot.docs.filter(doc => doc.data().isCompleted).length
    const total = snapshot.docs.length

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, total, percentage }
  } catch (error) {
    console.error('Error getting test progress:', error)
    return { completed: 0, total: 0, percentage: 0 }
  }
}

export async function saveTestComplete(coachingId: string, testId: string): Promise<void> {
  try {
    const auth = await getFirebaseAuth()
    const db = await getFirebaseDb()

    if (!auth?.currentUser) {
      console.warn('User not authenticated')
      return
    }

    const userId = auth.currentUser.uid
    const docId = `${userId}-${coachingId}-${testId}`
    const docRef = doc(db, TEST_PROGRESS_COLLECTION, docId)

    const now = Timestamp.now()
    const progressData: TestProgress = {
      userId,
      coachingId,
      testId,
      isComplete: true,
      completedAt: now,
      updatedAt: now,
    }

    await setDoc(docRef, progressData, { merge: true })
  } catch (error) {
    console.error('Error saving test completion:', error)
    throw error
  }
}

export async function unmarkTestComplete(coachingId: string, testId: string): Promise<void> {
  try {
    const auth = await getFirebaseAuth()
    const db = await getFirebaseDb()

    if (!auth?.currentUser) {
      console.warn('User not authenticated')
      return
    }

    const userId = auth.currentUser.uid
    const docId = `${userId}-${coachingId}-${testId}`
    const docRef = doc(db, TEST_PROGRESS_COLLECTION, docId)

    await updateDoc(docRef, {
      isComplete: false,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error unmarking test complete:', error)
    throw error
  }
}

export async function isTestComplete(coachingId: string, testId: string): Promise<boolean> {
  try {
    const auth = await getFirebaseAuth()
    const db = await getFirebaseDb()

    if (!auth?.currentUser) {
      return false
    }

    const userId = auth.currentUser.uid
    const docId = `${userId}-${coachingId}-${testId}`
    const docRef = doc(db, TEST_PROGRESS_COLLECTION, docId)
    const snapshot = await getDoc(docRef)

    if (snapshot.exists()) {
      return snapshot.data().isComplete ?? false
    }
    return false
  } catch (error) {
    console.error('Error checking test completion:', error)
    return false
  }
}

export async function getAllUserProgress(): Promise<{
  sectionProgress: UserProgress[]
  testProgress: TestProgress[]
}> {
  try {
    const auth = await getFirebaseAuth()
    const db = await getFirebaseDb()

    if (!auth?.currentUser) {
      return { sectionProgress: [], testProgress: [] }
    }

    const userId = auth.currentUser.uid

    // Get section progress
    const sectionQuery = query(
      collection(db, SECTION_PROGRESS_COLLECTION),
      where('userId', '==', userId)
    )
    const sectionSnapshot = await getDocs(sectionQuery)
    const sectionProgress = sectionSnapshot.docs.map(doc => doc.data() as UserProgress)

    // Get test progress
    const testQuery = query(
      collection(db, TEST_PROGRESS_COLLECTION),
      where('userId', '==', userId)
    )
    const testSnapshot = await getDocs(testQuery)
    const testProgress = testSnapshot.docs.map(doc => doc.data() as TestProgress)

    return { sectionProgress, testProgress }
  } catch (error) {
    console.error('Error getting all user progress:', error)
    return { sectionProgress: [], testProgress: [] }
  }
}

export async function syncProgressToFirebase(): Promise<void> {
  try {
    // Get local progress from localStorage
    if (typeof window === 'undefined') return

    const localSectionProgress = localStorage.getItem('section_completion')
    const localTestProgress = localStorage.getItem('completed_tests')

    if (!localSectionProgress && !localTestProgress) return

    const auth = await getFirebaseAuth()
    const db = await getFirebaseDb()

    if (!auth?.currentUser) {
      console.warn('User not authenticated')
      return
    }

    const userId = auth.currentUser.uid

    // Sync section progress
    if (localSectionProgress) {
      try {
        const sections = JSON.parse(localSectionProgress)
        for (const section of sections) {
          if (section.isCompleted) {
            await saveSectionProgress(
              section.coachingId,
              section.testId,
              section.sectionId,
              true
            )
          }
        }
      } catch (e) {
        console.error('Error syncing section progress:', e)
      }
    }

    // Sync test progress
    if (localTestProgress) {
      try {
        const tests = JSON.parse(localTestProgress)
        for (const testKey of tests) {
          const [coachingId, testId] = testKey.split('-')
          await saveTestComplete(coachingId, testId)
        }
      } catch (e) {
        console.error('Error syncing test progress:', e)
      }
    }

    console.log('Progress synced to Firebase')
  } catch (error) {
    console.error('Error syncing progress to Firebase:', error)
    throw error
  }
}
