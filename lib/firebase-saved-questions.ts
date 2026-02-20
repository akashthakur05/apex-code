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

// In-memory cache for saved questions
let savedQuestionsCache: SavedQuestion[] | null = null
let cacheInitialized = false

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
  instituteName?: string
  subject?: string
  solution?: string
  sectionName?: string
  testName?: string
  solution_text?: string
}

const COLLECTION_NAME = 'saved_questions'

export async function saveQuestion(
  question: any,
  coachingId: string,
  testId: string,
  metadata?: {
    instituteName?: string
    subject?: string
    sectionName?: string
    testName?: string
  }
): Promise<void> {
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

    // Save new question with metadata
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
      solution_text: question.solution_text || '',
      savedAt: Timestamp.now(),
      // Optional metadata fields
      ...(metadata?.instituteName && { instituteName: metadata.instituteName }),
      ...(metadata?.subject && { subject: metadata.subject }),
      ...(metadata?.sectionName && { sectionName: metadata.sectionName }),
      ...(metadata?.testName && { testName: metadata.testName }),
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
    // Check cache first
    if (cacheInitialized && savedQuestionsCache !== null) {
      return savedQuestionsCache.some(sq => sq.questionId === questionId && sq.coachingId === coachingId)
    }

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

// Cache management functions
export async function initializeSavedQuestionsCache(): Promise<void> {
  try {
    if (cacheInitialized) return

    const saved = await getSavedQuestions()
    savedQuestionsCache = saved
    cacheInitialized = true
    console.log('[v0] Initialized saved questions cache with', saved.length, 'questions')
  } catch (error) {
    console.error('Error initializing cache:', error)
    cacheInitialized = true
    savedQuestionsCache = []
  }
}

export function getSavedQuestionsFromCache(coachingId?: string): SavedQuestion[] {
  if (!cacheInitialized || savedQuestionsCache === null) {
    return []
  }

  if (coachingId) {
    return savedQuestionsCache.filter(sq => sq.coachingId === coachingId)
  }

  return savedQuestionsCache
}

export function addToSavedQuestionsCache(question: SavedQuestion): void {
  if (savedQuestionsCache === null) {
    savedQuestionsCache = []
  }

  // Check if already exists
  const exists = savedQuestionsCache.some(sq => sq.questionId === question.questionId && sq.coachingId === question.coachingId)
  if (!exists) {
    savedQuestionsCache.unshift(question)
  }
}

export function removeFromSavedQuestionsCache(questionId: string, coachingId: string): void {
  if (savedQuestionsCache === null) return

  savedQuestionsCache = savedQuestionsCache.filter(sq => !(sq.questionId === questionId && sq.coachingId === coachingId))
}

export function isSavedQuestionInCache(questionId: string, coachingId: string): boolean {
  if (!cacheInitialized || savedQuestionsCache === null) {
    return false
  }

  return savedQuestionsCache.some(sq => sq.questionId === questionId && sq.coachingId === coachingId)
}

// Get all saved questions across all users (for shared/public page)
export async function getAllSavedQuestions(): Promise<SavedQuestion[]> {
  try {
    const db = await getFirebaseDb()

    const questionsRef = collection(db, COLLECTION_NAME)
    const snapshot = await getDocs(questionsRef)
    const allQuestions = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      savedAt: doc.data().savedAt,
    })) as SavedQuestion[]

    return allQuestions.sort((a, b) => b.savedAt.toMillis() - a.savedAt.toMillis())
  } catch (error) {
    console.error('Error fetching all saved questions:', error)
    return []
  }
}

// Filter helper functions
export function filterBySubject(questions: SavedQuestion[], subject: string): SavedQuestion[] {
  if (!subject) return questions
  return questions.filter(q => q.subject === subject || q.sectionName === subject || q.section_id === subject)
}

export function filterByInstitute(questions: SavedQuestion[], instituteName: string): SavedQuestion[] {
  if (!instituteName) return questions
  return questions.filter(q => q.instituteName === instituteName || q.coachingId === instituteName)
}

export function filterByMarks(questions: SavedQuestion[], marks: number): SavedQuestion[] {
  if (!marks) return questions
  return questions.filter(q => Number(q.positive_marks) === marks)
}

export function searchQuestions(questions: SavedQuestion[], searchTerm: string): SavedQuestion[] {
  if (!searchTerm) return questions
  const term = searchTerm.toLowerCase()
  return questions.filter(q => 
    q.question.toLowerCase().includes(term) ||
    q.testName?.toLowerCase().includes(term) ||
    q.sectionName?.toLowerCase().includes(term)
  )
}

export function getUniqueSubjects(questions: SavedQuestion[]): string[] {
  const subjects = new Set<string>()
  questions.forEach(q => {
    if (q.subject) subjects.add(q.subject)
    if (q.sectionName) subjects.add(q.sectionName)
    if (q.section_id) subjects.add(q.section_id)
  })
  return Array.from(subjects).sort()
}

export function getUniqueInstitutes(questions: SavedQuestion[]): string[] {
  const institutes = new Set<string>()
  questions.forEach(q => {
    if (q.instituteName) institutes.add(q.instituteName)
    if (q.coachingId) institutes.add(q.coachingId)
  })
  return Array.from(institutes).sort()
}

export function getUniqueMarks(questions: SavedQuestion[]): number[] {
  const marks = new Set<number>()
  questions.forEach(q => {
    marks.add(Number(q.positive_marks))
  })
  return Array.from(marks).sort((a, b) => a - b)
}
