'use client'

import { ProtectedLayout } from '@/components/protected-layout'
import { useState, useEffect } from 'react'
import {
  getAllSavedQuestions,
  SavedQuestion,
  filterBySubject,
  filterByInstitute,
  filterByMarks,
  searchQuestions,
  getUniqueSubjects,
  getUniqueInstitutes,
  getUniqueMarks,
} from '@/lib/firebase-saved-questions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import HTMLRenderer from '@/components/html-renderer'
import { ChevronLeft, Loader2, Search, Filter, X } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

export default function SharedQuestionsPage() {
  const [allQuestions, setAllQuestions] = useState<SavedQuestion[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<SavedQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedInstitute, setSelectedInstitute] = useState('all')
  const [selectedMarks, setSelectedMarks] = useState('all')
  const [subjects, setSubjects] = useState<string[]>([])
  const [institutes, setInstitutes] = useState<string[]>([])
  const [marks, setMarks] = useState<number[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadAllQuestions()
  }, [])

  // Apply filters whenever any filter changes
  useEffect(() => {
    let result = [...allQuestions]

    // Apply search
    if (searchTerm) {
      result = searchQuestions(result, searchTerm)
    }

    // Apply subject filter
    if (selectedSubject !== 'all') {
      result = filterBySubject(result, selectedSubject)
    }

    // Apply institute filter
    if (selectedInstitute !== 'all') {
      result = filterByInstitute(result, selectedInstitute)
    }

    // Apply marks filter
    if (selectedMarks !== 'all') {
      result = filterByMarks(result, Number(selectedMarks))
    }

    setFilteredQuestions(result)
  }, [allQuestions, searchTerm, selectedSubject, selectedInstitute, selectedMarks])

  const loadAllQuestions = async () => {
    try {
      setLoading(true)
      const questions = await getAllSavedQuestions()
      setAllQuestions(questions)

      // Extract filter options
      setSubjects(getUniqueSubjects(questions))
      setInstitutes(getUniqueInstitutes(questions))
      setMarks(getUniqueMarks(questions))
    } catch (error) {
      console.error('Error loading all questions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load questions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedSubject('all')
    setSelectedInstitute('all')
    setSelectedMarks('all')
  }

  const hasActiveFilters = searchTerm || selectedSubject !== 'all' || selectedInstitute !== 'all' || selectedMarks !== 'all'

  return (
    <ProtectedLayout>
      <main className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
              <ChevronLeft className="w-4 h-4" />
              Back Home
            </Link>
            <h1 className="text-3xl font-bold">Shared Questions</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Browse questions saved by all users in the community
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : allQuestions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">No shared questions yet</p>
              <p className="text-sm text-muted-foreground">
                Questions will appear here as users save them.
              </p>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Filter Section */}
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4" />
                  <h3 className="font-semibold">Filters</h3>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="ml-auto"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Subject Filter */}
                  {subjects.length > 0 && (
                    <div>
                      <label className="text-sm font-medium block mb-2">Subject</label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">All Subjects ({subjects.length})</option>
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Institute Filter */}
                  {institutes.length > 0 && (
                    <div>
                      <label className="text-sm font-medium block mb-2">Institute</label>
                      <select
                        value={selectedInstitute}
                        onChange={(e) => setSelectedInstitute(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">All Institutes ({institutes.length})</option>
                        {institutes.map(institute => (
                          <option key={institute} value={institute}>{institute}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Marks Filter */}
                  {marks.length > 0 && (
                    <div>
                      <label className="text-sm font-medium block mb-2">Marks</label>
                      <select
                        value={selectedMarks}
                        onChange={(e) => setSelectedMarks(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">All Marks ({marks.length})</option>
                        {marks.map(mark => (
                          <option key={mark} value={mark}>+{mark}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                Showing {filteredQuestions.length} of {allQuestions.length} questions
              </div>

              {/* Questions List */}
              {filteredQuestions.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No questions match your filters</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredQuestions.map((q) => (
                    <Card key={q.id} className="p-6">
                      <div className="flex-1 min-w-0">
                        {/* Metadata Section */}
                        <div className="text-xs text-muted-foreground mb-3 space-y-1">
                          {q.instituteName && <p><strong>Institute:</strong> {q.instituteName}</p>}
                          {q.testName && <p><strong>Test:</strong> {q.testName}</p>}
                          {q.sectionName && <p><strong>Subject:</strong> {q.sectionName}</p>}
                          <p><strong>Marks:</strong> +{q.positive_marks} / {q.negative_marks}</p>
                          <p><strong>Shared:</strong> {new Date(q.savedAt.toMillis()).toLocaleDateString()}</p>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <HTMLRenderer html={q.question} />
                        </div>
                      </div>

                      {/* Options */}
                      <div className="space-y-2 mt-4">
                        {[1, 2, 3, 4].map((optNum) => {
                          const key = `option_${optNum}` as keyof SavedQuestion
                          const optionText = q[key]
                          const isCorrect = q.answer === String(optNum)
                          return (
                            <div
                              key={optNum}
                              className={`p-3 rounded border ${
                                isCorrect
                                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                                  : 'border-border'
                              }`}
                            >
                              <span className="font-medium">{String.fromCharCode(64 + optNum)})</span>{' '}
                              <HTMLRenderer html={optionText as string} />
                              {isCorrect && <span className="ml-2 text-green-600 dark:text-green-400">✓ Correct</span>}
                            </div>
                          )
                        })}
                      </div>

                      {/* Solution Section */}
                      {q.solution_text && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Solution:</p>
                          <div className="text-sm text-blue-900 dark:text-blue-100">
                            <HTMLRenderer html={q.solution_text} />
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </ProtectedLayout>
  )
}
