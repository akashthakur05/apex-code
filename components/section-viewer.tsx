'use client'

import Link from "next/link"
import { sectionNameMap, coachingInstitutes } from '@/lib/mock-data'
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import HTMLRenderer from './html-renderer'
import { Card } from './ui/card'
import SolutionModal from './solution-modal'

interface Props {
  coachingId: string
  sectionId: string
  questionlist: any[]
}

export default function SectionViewer({ coachingId, sectionId, questionlist }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize question from query parameter on mount
  useEffect(() => {
    setMounted(true)
    const questionParam = searchParams.get('question')
    if (questionParam) {
      const questionIndex = parseInt(questionParam) - 1 // Convert 1-indexed to 0-indexed
      if (questionIndex >= 0 && questionIndex < questionlist.length) {
        setCurrentIndex(questionIndex)
      }
    }
  }, [searchParams, questionlist.length])

  const totalQuestions = questionlist.length
  const currentQuestion = questionlist[currentIndex]

  const sectionName = sectionNameMap[sectionId] || `Section ${sectionId}`
  const coaching = coachingInstitutes.find(c => c.id === coachingId)

  // Update URL when question index changes
  const updateUrl = (index: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('question', String(index + 1)) // Convert 0-indexed to 1-indexed
    router.push(`?${params.toString()}`)
  }

const handleNext = () => {
  setCurrentIndex(prev => Math.min(prev + 1, totalQuestions - 1))
  setSelectedOption(null)
}

const handlePrev = () => {
  setCurrentIndex(prev => Math.max(prev - 1, 0))
  setSelectedOption(null)
}
useEffect(() => {
  updateUrl(currentIndex)
}, [currentIndex])

useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (["n", "N", "ArrowRight"].includes(e.key)) handleNext()
    if (["p", "P", "ArrowLeft"].includes(e.key)) handlePrev()
  }

  window.addEventListener("keydown", handler)
  return () => window.removeEventListener("keydown", handler)
}, [])


  const handleOptionClick = (opt: number) => {
    if (selectedOption === null) {
      setSelectedOption(opt)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* HEADER */}
      <div className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href={`/coaching/${coachingId}`}
            className="inline-flex items-center gap-2 text-primary hover:underline mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to {coaching?.name} Tests
          </Link>

          <h1 className="text-2xl font-bold">{sectionName}</h1>

          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>
              Question {currentIndex + 1} / {totalQuestions}
            </span>
            <span>{coaching?.name}</span>
          </div>

          {/* TOP NAV (DESKTOP) */}
          <div className="hidden md:flex justify-between mt-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === totalQuestions - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-muted disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QUESTION */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-28 md:pb-8">
        <Card className="p-6 md:p-8">
          {/* QUESTION HEADER WITH SOLUTION BUTTON */}
          <div className="mb-8 flex gap-4 items-start justify-between">
            <div className="flex gap-4 flex-1">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                {currentIndex + 1}
              </div>
              <div className="flex-1">
                <HTMLRenderer html={currentQuestion.question} />
              </div>
            </div>
            {mounted && currentQuestion.solution_text && (
              <button
                onClick={() => setShowSolution(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition whitespace-nowrap ml-4"
              >
                <Lightbulb className="w-4 h-4" />
                Solution
              </button>
            )}
          </div>

          {/* OPTIONS */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map((opt) => {
              const optionKey = `option_${opt}`
              const optionText = currentQuestion[optionKey]
              const isCorrect = currentQuestion.answer === String(opt)
              const isSelected = selectedOption === opt
              const revealCorrect =
                selectedOption !== null && selectedOption !== Number(currentQuestion.answer)

              let borderClass = 'border-border'
              let textClass = ''

              if (selectedOption !== null) {
                if (isSelected && !isCorrect) {
                  borderClass = 'border-red-500 bg-red-50 dark:bg-red-950'
                  textClass = 'text-red-600'
                } else if ((isCorrect && revealCorrect) || (isCorrect && isSelected)) {
                  borderClass = 'border-green-500 bg-green-50 dark:bg-green-950'
                  textClass = 'text-green-600'
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  disabled={selectedOption !== null}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${borderClass}`}
                >
                  <div className="flex gap-3">
                    <div className={`w-6 h-6 rounded border flex items-center justify-center font-semibold ${textClass}`}>
                      {String.fromCharCode(64 + opt)}
                    </div>
                    <div className={`flex-1 ${textClass}`}>
                      <HTMLRenderer html={optionText} />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
            Marks: +{currentQuestion.positive_marks} / {currentQuestion.negative_marks}
          </div>
        </Card>

        {/* BOTTOM NAV (MOBILE + DESKTOP) */}
        <div className="fixed md:static bottom-0 left-0 right-0 bg-card border-t p-4">
          <div className="max-w-4xl mx-auto flex gap-3 justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === totalQuestions - 1}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SOLUTION MODAL */}
      {mounted && (
        <SolutionModal
          question={currentQuestion}
          isOpen={showSolution}
          onClose={() => setShowSolution(false)}
        />
      )}
    </main>
  )
}
