'use client'

import { ProtectedLayout } from '@/components/protected-layout'
import { useState, useEffect } from 'react'
import { getAllSavedQuestionsForAdmin, SavedQuestion, formatTimestamp } from '@/lib/firebase-saved-questions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import HTMLRenderer from '@/components/html-renderer'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

const ITEMS_PER_PAGE = 10

export default function AdminAllQuestionsPage() {
  const [allQuestions, setAllQuestions] = useState<SavedQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    loadAllQuestions()
  }, [])

  const loadAllQuestions = async () => {
    try {
      setLoading(true)
      const questions = await getAllSavedQuestionsForAdmin()
      setAllQuestions(questions)
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

  if (!mounted) {
    return (
      <ProtectedLayout>
        <main className="min-h-screen bg-background">
          <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <h1 className="text-3xl font-bold">Admin - All Saved Questions</h1>
            </div>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </main>
      </ProtectedLayout>
    )
  }

  // Pagination
  const totalPages = Math.ceil(allQuestions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedQuestions = allQuestions.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

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
            <h1 className="text-3xl font-bold">Admin - All Saved Questions</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Total: {allQuestions.length} questions saved across all users
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
              <p className="text-lg text-muted-foreground mb-4">No saved questions in the system</p>
              <p className="text-sm text-muted-foreground">
                Questions will appear here as users save them.
              </p>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Questions List */}
              <div className="space-y-4">
                {paginatedQuestions.map((q) => (
                  <Card key={q.id} className="p-6">
                    <div className="mb-4">
                      <div className="text-xs text-muted-foreground space-y-1 mb-3">
                        <p>User ID: {q.userId}</p>
                        <p>Coaching: {q.coachingId} | Test: {q.testId}</p>
                        <p>Saved: {formatTimestamp(q.savedAt)}</p>
                        <p>Marks: +{q.positive_marks} / {q.negative_marks}</p>
                      </div>
                      <HTMLRenderer html={q.question} />
                    </div>

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
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </ProtectedLayout>
  )
}
