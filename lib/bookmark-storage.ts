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
