'use client'

import { SavedQuestion } from '@/lib/firebase-saved-questions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import HTMLRenderer from '@/components/html-renderer'
import { ChevronLeft, ChevronRight, Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface SavedQuestionsViewerProps {
  questions: SavedQuestion[]
  onRemove: (docId: string) => Promise<void>
  deleting: string | null
}

export function SavedQuestionsViewer({ questions, onRemove, deleting }: SavedQuestionsViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRemoving, setIsRemoving] = useState(false)

  if (questions.length === 0) {
    return null
  }

  const currentQuestion = questions[currentIndex]
  const isAnswerCorrect = currentQuestion.answer

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : questions.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev < questions.length - 1 ? prev + 1 : 0))
  }

  const handleRemoveQuestion = async () => {
    try {
      setIsRemoving(true)
      await onRemove(currentQuestion.id)
      // Move to next question or previous if this was the last one
      if (currentIndex < questions.length - 1) {
        // Stay at same index as array shortened
      } else if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      } else {
        setCurrentIndex(0)
      }
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Viewer Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Question {currentIndex + 1} of {questions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Saved: {new Date(currentQuestion.savedAt.toMillis?.() || currentQuestion.savedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-xs bg-muted px-2 py-1 rounded">
            Marks: +{currentQuestion.positive_marks} / {currentQuestion.negative_marks}
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <Card className="p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <HTMLRenderer html={currentQuestion.question} />
          </div>
          <button
            onClick={handleRemoveQuestion}
            disabled={deleting === currentQuestion.id || isRemoving}
            className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors disabled:opacity-50"
            aria-label="Delete question"
          >
            {deleting === currentQuestion.id || isRemoving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3 mt-6">
          {[1, 2, 3, 4].map((optNum) => {
            const key = `option_${optNum}` as keyof SavedQuestion
            const optionText = currentQuestion[key]
            const isCorrect = currentQuestion.answer === String(optNum)
            return (
              <div
                key={optNum}
                className={`p-4 rounded border ${
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

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="gap-2"
          disabled={questions.length <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary w-6'
                  : 'bg-muted hover:bg-muted-foreground'
              }`}
              aria-label={`Go to question ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          className="gap-2"
          disabled={questions.length <= 1}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
