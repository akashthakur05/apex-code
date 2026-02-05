'use client'

import { ProtectedLayout } from '@/components/protected-layout'
import { useState, useEffect } from 'react'
import { getSavedQuestions, removeSavedQuestion, SavedQuestion } from '@/lib/firebase-saved-questions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import HTMLRenderer from '@/components/html-renderer'
import { ChevronLeft, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

export default function SavedQuestionsPage() {
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const { toast } = useToast()

  useEffect(() => {
    loadSavedQuestions()
  }, [])

  const loadSavedQuestions = async () => {
    try {
      setLoading(true)
      const questions = await getSavedQuestions()
      setSavedQuestions(questions)
    } catch (error) {
      console.error('Error loading saved questions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load saved questions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (docId: string) => {
    try {
      setDeleting(docId)
      await removeSavedQuestion(docId)
      setSavedQuestions(prev => prev.filter(q => q.id !== docId))
      toast({
        title: 'Success',
        description: 'Question removed',
      })
    } catch (error) {
      console.error('Error removing question:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove question',
        variant: 'destructive',
      })
    } finally {
      setDeleting(null)
    }
  }

  const groupedByCoaching = new Map<string, SavedQuestion[]>()
  savedQuestions.forEach(q => {
    if (!groupedByCoaching.has(q.coachingId)) {
      groupedByCoaching.set(q.coachingId, [])
    }
    groupedByCoaching.get(q.coachingId)!.push(q)
  })

  const filteredGroups = selectedFilter === 'all'
    ? Array.from(groupedByCoaching.entries())
    : Array.from(groupedByCoaching.entries()).filter(([coachingId]) => coachingId === selectedFilter)

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
            <h1 className="text-3xl font-bold">Saved Questions</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {savedQuestions.length} questions saved across {groupedByCoaching.size} coaching institutes
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : savedQuestions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">No saved questions yet</p>
              <p className="text-sm text-muted-foreground">
                Save questions while taking tests to view them here. Use the save button next to questions.
              </p>
              <Link href="/">
                <Button className="mt-6">Go to Tests</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Filter Dropdown - Optional */}
              {groupedByCoaching.size > 1 && (
                <div className="flex gap-2">
                  <Button
                    variant={selectedFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedFilter('all')}
                    size="sm"
                  >
                    All ({savedQuestions.length})
                  </Button>
                  {Array.from(groupedByCoaching.keys()).map(coachingId => (
                    <Button
                      key={coachingId}
                      variant={selectedFilter === coachingId ? 'default' : 'outline'}
                      onClick={() => setSelectedFilter(coachingId)}
                      size="sm"
                    >
                      {coachingId} ({groupedByCoaching.get(coachingId)?.length})
                    </Button>
                  ))}
                </div>
              )}

              {/* Questions by Coaching */}
              {filteredGroups.map(([coachingId, questions]) => (
                <div key={coachingId}>
                  <h2 className="text-xl font-semibold mb-4">{coachingId}</h2>
                  <div className="space-y-4">
                    {questions.map((q) => (
                      <Card key={q.id} className="p-6 relative">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-3 space-y-1">
                              <p>Saved: {new Date(q.savedAt.toMillis()).toLocaleDateString()}</p>
                              <p>Marks: +{q.positive_marks} / {q.negative_marks}</p>
                            </div>
                            <HTMLRenderer html={q.question} />
                          </div>
                          <button
                            onClick={() => handleRemove(q.id)}
                            disabled={deleting === q.id}
                            className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors disabled:opacity-50"
                            aria-label="Delete question"
                          >
                            {deleting === q.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </ProtectedLayout>
  )
}
