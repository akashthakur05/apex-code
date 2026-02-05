'use client'

import { useState, useEffect } from 'react'
import { getSavedQuestions, removeSavedQuestion, SavedQuestion } from '@/lib/firebase-saved-questions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import HTMLRenderer from '@/components/html-renderer'
import { X, Trash2, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface SavedQuestionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SavedQuestionsModal({ isOpen, onClose }: SavedQuestionsModalProps) {
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadSavedQuestions()
    }
  }, [isOpen])

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
        description: 'Question removed from saved',
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-background p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            Saved Questions ({savedQuestions.length})
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : savedQuestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No saved questions yet</p>
              <p className="text-xs text-muted-foreground mt-2">
                Save questions while taking tests to view them here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedQuestions.map((q) => (
                <Card key={q.id} className="p-4 relative">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-2">
                        {new Date(q.savedAt.toMillis()).toLocaleDateString()} • Marks: +{q.positive_marks}/{q.negative_marks}
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
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-2 text-sm mt-4">
                    {[1, 2, 3, 4].map((optNum) => {
                      const key = `option_${optNum}` as keyof SavedQuestion
                      const optionText = q[key]
                      const isCorrect = q.answer === String(optNum)
                      return (
                        <div
                          key={optNum}
                          className={`p-2 rounded border ${
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
          )}
        </div>
      </Card>
    </div>
  )
}
