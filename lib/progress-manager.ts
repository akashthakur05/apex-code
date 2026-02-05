'use client'

import {
  saveSectionProgress,
  getSectionProgress,
  saveTestComplete as firebaseSaveTestComplete,
  isTestComplete as firebaseIsTestComplete,
  unmarkTestComplete as firebaseUnmarkTestComplete,
  syncProgressToFirebase,
} from '@/lib/firebase-progress'
import {
  toggleSectionCompletion as localToggleSectionCompletion,
  isSectionCompleted as localIsSectionCompleted,
  markTestComplete as localMarkTestComplete,
  unmarkTestComplete as localUnmarkTestComplete,
  isTestComplete as localIsTestComplete,
} from '@/lib/bookmark-storage'

// This module provides hybrid local + Firebase persistence
// It saves to localStorage first (for SSG/offline support) and syncs to Firebase when user is authenticated

export async function toggleSectionCompletionHybrid(
  coachingId: string,
  testId: string,
  sectionId: string
): Promise<void> {
  try {
    // Always save to localStorage
    localToggleSectionCompletion(coachingId, testId, sectionId)

    // Try to sync to Firebase if authenticated
    try {
      const isCompleted = localIsSectionCompleted(coachingId, testId, sectionId)
      await saveSectionProgress(coachingId, testId, sectionId, isCompleted)
    } catch (firebaseError) {
      console.warn('Firebase sync failed, continuing with localStorage:', firebaseError)
      // Silently fail - localStorage is primary
    }
  } catch (error) {
    console.error('Error toggling section completion:', error)
    throw error
  }
}

export async function markTestCompleteHybrid(
  coachingId: string,
  testId: string
): Promise<void> {
  try {
    // Always save to localStorage
    localMarkTestComplete(coachingId, testId)

    // Try to sync to Firebase
    try {
      await firebaseSaveTestComplete(coachingId, testId)
    } catch (firebaseError) {
      console.warn('Firebase sync failed, continuing with localStorage:', firebaseError)
    }
  } catch (error) {
    console.error('Error marking test complete:', error)
    throw error
  }
}

export async function unmarkTestCompleteHybrid(
  coachingId: string,
  testId: string
): Promise<void> {
  try {
    // Always update localStorage
    localUnmarkTestComplete(coachingId, testId)

    // Try to sync to Firebase
    try {
      await firebaseUnmarkTestComplete(coachingId, testId)
    } catch (firebaseError) {
      console.warn('Firebase sync failed, continuing with localStorage:', firebaseError)
    }
  } catch (error) {
    console.error('Error unmarking test complete:', error)
    throw error
  }
}

export async function isTestCompleteHybrid(
  coachingId: string,
  testId: string
): Promise<boolean> {
  // Try Firebase first if user is authenticated
  try {
    return await firebaseIsTestComplete(coachingId, testId)
  } catch (firebaseError) {
    console.warn('Firebase fetch failed, using localStorage:', firebaseError)
    // Fall back to localStorage
    return localIsTestComplete(coachingId, testId)
  }
}

export async function isSectionCompletedHybrid(
  coachingId: string,
  testId: string,
  sectionId: string
): Promise<boolean> {
  // Try Firebase first if user is authenticated
  try {
    return await getSectionProgress(coachingId, testId, sectionId)
  } catch (firebaseError) {
    console.warn('Firebase fetch failed, using localStorage:', firebaseError)
    // Fall back to localStorage
    return localIsSectionCompleted(coachingId, testId, sectionId)
  }
}

// On app startup, sync localStorage to Firebase
export async function initializeProgressSync(): Promise<void> {
  try {
    await syncProgressToFirebase()
  } catch (error) {
    console.warn('Initial sync to Firebase failed:', error)
    // This is non-critical, app continues
  }
}
