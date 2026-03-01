import { CoachingInstitute, SubjectSource, CoachingInstituteWithMiniMock } from './types'

/**
 * Check if a coaching institute is a MiniMock source
 */
export function isMiniMockSource(coaching: CoachingInstitute | CoachingInstituteWithMiniMock): boolean {
  const extended = coaching as CoachingInstituteWithMiniMock
  return extended.type === 'minimock' && Array.isArray(extended.subjectSources) && extended.subjectSources.length > 0
}

/**
 * Get all subject sources for a MiniMock coaching institute
 */
export function getSubjectSources(coaching: CoachingInstitute | CoachingInstituteWithMiniMock): SubjectSource[] {
  if (!isMiniMockSource(coaching)) {
    return []
  }
  const extended = coaching as CoachingInstituteWithMiniMock
  return extended.subjectSources || []
}

/**
 * Get a specific subject source by subject name or id
 */
export function getSubjectSource(
  coaching: CoachingInstitute | CoachingInstituteWithMiniMock,
  subjectIdOrName: string
): SubjectSource | null {
  const sources = getSubjectSources(coaching)
  return sources.find(s => s.subject_id === subjectIdOrName || s.subject === subjectIdOrName) || null
}

/**
 * Get the test series ID for a subject
 */
export function getSubjectTestSeriesId(
  coaching: CoachingInstitute | CoachingInstituteWithMiniMock,
  subject: string
): string | null {
  const source = getSubjectSource(coaching, subject)
  return source ? source.test_series_id : null
}

/**
 * Get all unique subjects from a coaching institute
 */
export function getAllSubjects(coaching: CoachingInstitute | CoachingInstituteWithMiniMock): string[] {
  const sources = getSubjectSources(coaching)
  return sources.map(s => s.subject)
}

/**
 * Check if a coaching institute should show subject selection
 */
export function shouldShowSubjectSelection(coaching: CoachingInstitute | CoachingInstituteWithMiniMock): boolean {
  return isMiniMockSource(coaching)
}

/**
 * Get the test series ID for a coaching institute
 * For normal sources, returns the main test_series_id
 * For MiniMock sources, the test_series_id comes from the selected subject
 */
export function getCoachingTestSeriesId(
  coaching: CoachingInstitute | CoachingInstituteWithMiniMock,
  subject?: string
): string {
  if (isMiniMockSource(coaching) && subject) {
    const seriesId = getSubjectTestSeriesId(coaching, subject)
    if (seriesId) {
      return seriesId
    }
  }
  return coaching.test_series_id
}

/**
 * Filter tests by subject for MiniMock sources
 */
export function getTestsBySubject(
  coaching: CoachingInstitute | CoachingInstituteWithMiniMock,
  subjectIdOrName: string
): typeof coaching.tests {
  if (!isMiniMockSource(coaching)) {
    return coaching.tests
  }

  const subjectSource = getSubjectSource(coaching, subjectIdOrName)
  const exactSubjectName = subjectSource?.subject || subjectIdOrName

  // Filter tests that belong to this subject
  return coaching.tests.filter((test: any) => test.subject === exactSubjectName)
}
