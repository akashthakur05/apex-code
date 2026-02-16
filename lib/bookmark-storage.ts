'use client'

export interface BookmarkedQuestion {
  id: string
  question: string
  option_1: string
  option_2: string
  option_3: string
  option_4: string
  answer: string
  section_id: string
  coachingId: string
  testId: string
  bookmarkedAt: number
}

const BOOKMARKS_KEY = 'mcq_bookmarks'
const COMPLETED_TESTS_KEY = 'completed_tests'

export function getBookmarks(): BookmarkedQuestion[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addBookmark(question: any, coachingId: string, testId: string): void {
  if (typeof window === 'undefined') return
  try {
    const bookmarks = getBookmarks()
    const exists = bookmarks.some(b => b.id === question.id && b.coachingId === coachingId)
    
    if (!exists) {
      bookmarks.push({
        id: question.id,
        question: question.question,
        option_1: question.option_1,
        option_2: question.option_2,
        option_3: question.option_3,
        option_4: question.option_4,
        answer: question.answer,
        section_id: question.section_id,
        coachingId,
        testId,
        bookmarkedAt: Date.now(),
      })
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))
    }
  } catch (e) {
    console.error('Error saving bookmark:', e)
  }
}

export function removeBookmark(questionId: string, coachingId: string): void {
  if (typeof window === 'undefined') return
  try {
    const bookmarks = getBookmarks()
    const filtered = bookmarks.filter(b => !(b.id === questionId && b.coachingId === coachingId))
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered))
  } catch (e) {
    console.error('Error removing bookmark:', e)
  }
}

export function isBookmarked(questionId: string, coachingId: string): boolean {
  return getBookmarks().some(b => b.id === questionId && b.coachingId === coachingId)
}

export function markTestComplete(coachingId: string, testId: string): void {
  if (typeof window === 'undefined') return
  try {
    const completed = getCompletedTests()
    const key = `${coachingId}-${testId}`
    if (!completed.includes(key)) {
      completed.push(key)
      localStorage.setItem(COMPLETED_TESTS_KEY, JSON.stringify(completed))
    }
  } catch (e) {
    console.error('Error marking test complete:', e)
  }
}

export function unmarkTestComplete(coachingId: string, testId: string): void {
  if (typeof window === 'undefined') return
  try {
    const completed = getCompletedTests()
    const key = `${coachingId}-${testId}`
    const filtered = completed.filter(item => item !== key)
    localStorage.setItem(COMPLETED_TESTS_KEY, JSON.stringify(filtered))
  } catch (e) {
    console.error('Error unmarking test complete:', e)
  }
}

export function getCompletedTests(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(COMPLETED_TESTS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function isTestComplete(coachingId: string, testId: string): boolean {
  return getCompletedTests().includes(`${coachingId}-${testId}`)
}

// Last viewed question tracking
const LAST_VIEWED_QUESTION_KEY = 'last_viewed_questions'

export interface LastViewedQuestion {
  coachingId: string
  sectionId: string
  questionIndex: number
  timestamp: number
}

export function getLastViewedQuestions(): LastViewedQuestion[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(LAST_VIEWED_QUESTION_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveLastViewedQuestion(coachingId: string, sectionId: string, questionIndex: number): void {
  if (typeof window === 'undefined') return
  try {
    const allViewed = getLastViewedQuestions()
    const key = `${coachingId}-${sectionId}`
    
    // Remove existing entry for this section
    const filtered = allViewed.filter(item => `${item.coachingId}-${item.sectionId}` !== key)
    
    // Add new entry with current timestamp
    filtered.push({
      coachingId,
      sectionId,
      questionIndex,
      timestamp: Date.now(),
    })
    
    localStorage.setItem(LAST_VIEWED_QUESTION_KEY, JSON.stringify(filtered))
  } catch (e) {
    console.error('Error saving last viewed question:', e)
  }
}

export function getLastViewedQuestion(coachingId: string, sectionId: string): number | null {
  const allViewed = getLastViewedQuestions()
  const entry = allViewed.find(item => item.coachingId === coachingId && item.sectionId === sectionId)
  return entry ? entry.questionIndex : null
}

export function clearLastViewedQuestion(coachingId: string, sectionId: string): void {
  if (typeof window === 'undefined') return
  try {
    const allViewed = getLastViewedQuestions()
    const key = `${coachingId}-${sectionId}`
    const filtered = allViewed.filter(item => `${item.coachingId}-${item.sectionId}` !== key)
    localStorage.setItem(LAST_VIEWED_QUESTION_KEY, JSON.stringify(filtered))
  } catch (e) {
    console.error('Error clearing last viewed question:', e)
  }
}

// Section completion tracking
const SECTION_COMPLETION_KEY = 'section_completion'

export interface SectionCompletion {
  coachingId: string
  testId: string
  sectionId: string
  isCompleted: boolean
}

export function getSectionCompletion(): SectionCompletion[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(SECTION_COMPLETION_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function toggleSectionCompletion(coachingId: string, testId: string, sectionId: string): void {
  if (typeof window === 'undefined') return
  try {
    const completions = getSectionCompletion()
    const key = `${coachingId}-${testId}-${sectionId}`
    const existing = completions.find(c => `${c.coachingId}-${c.testId}-${c.sectionId}` === key)
    
    if (existing) {
      existing.isCompleted = !existing.isCompleted
    } else {
      completions.push({
        coachingId,
        testId,
        sectionId,
        isCompleted: true,
      })
    }
    localStorage.setItem(SECTION_COMPLETION_KEY, JSON.stringify(completions))
  } catch (e) {
    console.error('Error toggling section completion:', e)
  }
}

export function isSectionCompleted(coachingId: string, testId: string, sectionId: string): boolean {
  const completions = getSectionCompletion()
  const completion = completions.find(
    c => c.coachingId === coachingId && c.testId === testId && c.sectionId === sectionId
  )
  return completion?.isCompleted ?? false
}

export function getTestSectionProgress(coachingId: string, testId: string, totalSections: number): { completed: number; total: number; percentage: number } {
  const completions = getSectionCompletion()
  const completedCount = completions.filter(
    c => c.coachingId === coachingId && c.testId === testId && c.isCompleted
  ).length
  
  const total = totalSections > 0 ? totalSections : 1
  const percentage = Math.round((completedCount / total) * 100)
  
  return {
    completed: completedCount,
    total,
    percentage,
  }
}
