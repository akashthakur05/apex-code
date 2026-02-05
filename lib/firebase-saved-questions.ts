'use client'

import { getFirebaseDb, getFirebaseAuth } from '@/lib/firebase'
import {
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  doc,
  Timestamp,
} from 'firebase/firestore'

export interface SavedQuestion {
  id: string
  userId: string
  questionId: string
  coachingId: string
  testId: string
  question: string
  option_1: string
  option_2: string
  option_3: string
  option_4: string
  answer: string
  section_id: string
  positive_marks: number
  negative_marks: number
  savedAt: Timestamp
}

const COLLECTION_NAME = 'saved_questions'

export async function saveQuestion(question: any, coachingId: string, testId: string): Promise<void> {
  try {
    const auth = await getFirebaseAuth()
    const db = await getFirebaseDb()

    if (!auth?.currentUser) {
      console.warn('User not authenticated')
      return
    }

    const questionsRef = collection(db, COLLECTION_NAME)

    // Check if already saved
    const q = query(
      questionsRef,
      where('userId', '==', auth.currentUser.uid),
      where('questionId', '==', question.id),
      where('coachingId', '==', coachingId)
    )

    const existingSnap = await getDocs(q)
    if (!existingSnap.empty) {
      console.log('Question already saved')
      return
    }

    // Save new question
    await addDoc(questionsRef, {
      userId: auth.currentUser.uid,
      questionId: question.id,
      coachingId,
      testId,
      question: question.question,
      option_1: question.option_1,
      option_2: question.option_2,
      option_3: question.option_3,
      option_4: question.option_4,
      answer: question.answer,
      section_id: question.section_id,
      positive_marks: question.positive_marks,
      negative_marks: question.negative_marks,
      savedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error saving question:', error)
    throw error
  }
}

export async function getSavedQuestions(): Promise<SavedQuestion[]> {
  try {
    const auth = await getFirebaseAuth()
    const db = await getFirebaseDb()

    if (!auth?.currentUser) {
      return []
    }

    const questionsRef = collection(db, COLLECTION_NAME)
    const q = query(questionsRef, where('userId', '==', auth.currentUser.uid))

    const snapshot = await getDocs(q)
    const saved = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      savedAt: doc.data().savedAt,
    })) as SavedQuestion[]

    return saved.sort((a, b) => b.savedAt.toMillis() - a.savedAt.toMillis())
  } catch (error) {
    console.error('Error fetching saved questions:', error)
    throw error
  }
}

export async function removeSavedQuestion(docId: string): Promise<void> {
  try {
    const db = await getFirebaseDb()
    const docRef = doc(db, COLLECTION_NAME, docId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error removing saved question:', error)
    throw error
  }
}

export async function isSavedQuestion(questionId: string, coachingId: string): Promise<boolean> {
  try {
    const auth = await getFirebaseAuth()
    const db = await getFirebaseDb()

    if (!auth?.currentUser) {
      return false
    }

    const questionsRef = collection(db, COLLECTION_NAME)
    const q = query(
      questionsRef,
      where('userId', '==', auth.currentUser.uid),
      where('questionId', '==', questionId),
      where('coachingId', '==', coachingId)
    )

    const snapshot = await getDocs(q)
    return !snapshot.empty
  } catch (error) {
    console.error('Error checking saved question:', error)
    return false
  }
}
