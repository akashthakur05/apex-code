'use client'

import { SavedQuestion } from '@/lib/firebase-saved-questions'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useState, useMemo } from 'react'

interface SavedQuestionsFiltersProps {
  questions: SavedQuestion[]
  onFiltersChange: (filtered: SavedQuestion[]) => void
}

export function SavedQuestionsFilters({ questions, onFiltersChange }: SavedQuestionsFiltersProps) {
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null)
  const [coachingFilter, setCoachingFilter] = useState<string | null>(null)
  const [testDateFilter, setTestDateFilter] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Extract unique filter values
  const subjects = useMemo(() => {
    const unique = new Set(questions.map(q => q.subject).filter(Boolean))
    return Array.from(unique)
  }, [questions])

  const coachings = useMemo(() => {
    const unique = new Set(questions.map(q => q.coachingName || q.coachingId).filter(Boolean))
    return Array.from(unique)
  }, [questions])

  const testDates = useMemo(() => {
    const unique = new Set(questions.map(q => q.testDate).filter(Boolean))
    return Array.from(unique)
  }, [questions])

  // Apply filters with AND logic
  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (subjectFilter && q.subject !== subjectFilter) return false
      if (coachingFilter && (q.coachingName || q.coachingId) !== coachingFilter) return false
      if (testDateFilter && q.testDate !== testDateFilter) return false
      return true
    })
  }, [questions, subjectFilter, coachingFilter, testDateFilter])

  // Notify parent of filtered results
  useMemo(() => {
    onFiltersChange(filtered)
  }, [filtered, onFiltersChange])

  const hasActiveFilters = subjectFilter || coachingFilter || testDateFilter

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-muted-foreground">Filters:</span>

        {/* Subject Filter Button */}
        <div className="relative inline-block">
          <Button
            variant={subjectFilter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className={subjectFilter ? 'gap-2' : 'gap-2'}
          >
            Subject: {subjectFilter ? subjectFilter : 'All'}
          </Button>
          {subjectFilter && (
            <button
              onClick={() => setSubjectFilter(null)}
              className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Coaching Filter Button */}
        <div className="relative inline-block">
          <Button
            variant={coachingFilter ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            Coaching: {coachingFilter ? coachingFilter : 'All'}
          </Button>
          {coachingFilter && (
            <button
              onClick={() => setCoachingFilter(null)}
              className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Test Date Filter Button */}
        <div className="relative inline-block">
          <Button
            variant={testDateFilter ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            Date: {testDateFilter ? testDateFilter : 'All'}
          </Button>
          {testDateFilter && (
            <button
              onClick={() => setTestDateFilter(null)}
              className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Reset All Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSubjectFilter(null)
              setCoachingFilter(null)
              setTestDateFilter(null)
            }}
            className="text-red-600 hover:text-red-700"
          >
            Reset
          </Button>
        )}
      </div>

      {/* Filter Summary */}
      <div className="text-sm text-muted-foreground">
        {filtered.length} of {questions.length} questions
        {hasActiveFilters && ` (${questions.length - filtered.length} hidden)`}
      </div>
    </div>
  )
}
