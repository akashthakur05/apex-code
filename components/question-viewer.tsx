'use client'

import { TestTitle, CoachingInstitute, Question } from '@/lib/types'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Menu, X, Printer, Share2, Bookmark } from 'lucide-react'
import { Card } from '@/components/ui/card'
import SolutionModal from './solution-modal'
import HTMLRenderer from './html-renderer'
import { getSectionName } from '@/lib/mock-data'
import { useState, useEffect } from 'react'
import { isBookmarked,addBookmark, removeBookmark, markTestComplete, unmarkTestComplete, isTestComplete as checkTestComplete } from '@/lib/bookmark-storage'
// import { addBookmark, removeBookmark, isBookmarked, markTestComplete, unmarkTestComplete, isTestComplete as checkTestComplete } from '@/lib/bookmark-storage'

interface Props {
  test: TestTitle
  coaching: CoachingInstitute
  preloadedQuestions?: Question[]
}

export default function QuestionViewer({ test, coaching, preloadedQuestions }: Props) {
  const questions = preloadedQuestions || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set())
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isTestComplete, setIsTestComplete] = useState(false)

  const currentQuestion = questions[currentIndex]
  const currentSection = currentQuestion.section_id || 'general'

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setHeaderVisible(false)
      } else {
        // Scrolling up
        setHeaderVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  useEffect(() => {
    // Load bookmarks on mount
    const bookmarks = new Set()
    preloadedQuestions?.forEach(q => {
      if (isBookmarked(q.id, coaching.id)) {
        bookmarks.add(q.id)
      }
    })
    setBookmarkedQuestions(bookmarks as any)
  }, [preloadedQuestions, coaching.id])

  useEffect(() => {
    setIsTestComplete(checkTestComplete(coaching.id, test.id))
  }, [coaching.id, test.id])

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedOption(null)
      setShowSolution(false)
    }
  }

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedOption(null)
      setShowSolution(false)
    }
  }

  const handleOptionClick = (optionNum: number) => {
    setSelectedOption(optionNum)
  }

  const handlePrint = () => {
    if (selectedSections.length === 0) {
      setSelectedSections(Array.from(groupedBySection.keys()))
    }
    setPrintModalOpen(true)
  }

  const handlePrintConfirm = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    const questionsToPrint = questions.filter(q => {
      const sectionId = q.section_id || 'general'
      return selectedSections.includes(sectionId)
    })

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${test.title} - Questions</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: white; }
          .container { max-width: 900px; margin: 0 auto; padding: 20px; }
          .header { margin-bottom: 30px; border-bottom: 3px solid #007bff; padding-bottom: 20px; }
          .header h1 { font-size: 28px; margin-bottom: 5px; }
          .header p { color: #666; font-size: 14px; }
          .section-title { font-size: 20px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; padding: 10px; background: #f0f0f0; border-left: 4px solid #007bff; }
          .question-block { margin-bottom: 25px; page-break-inside: avoid; }
          .question-num { font-weight: bold; font-size: 16px; margin-bottom: 8px; }
          .question-text { margin-bottom: 12px; line-height: 1.5; }
          .options { margin-left: 20px; }
          .option { margin-bottom: 8px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
          .option-label { font-weight: bold; margin-right: 8px; }
          .marks { font-size: 12px; color: #666; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; }
          @media print {
            body { margin: 0; padding: 0; }
            .container { padding: 10px; }
            .question-block { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${test.title}</h1>
            <p>${coaching.name}</p>
            <p>Total Questions: ${questionsToPrint.length}</p>
          </div>
    `

    // Group questions by section in print output
    const printGroupedBySection = new Map<string, Question[]>()
    questionsToPrint.forEach((q) => {
      const sectionId = q.section_id || 'general'
      if (!printGroupedBySection.has(sectionId)) {
        printGroupedBySection.set(sectionId, [])
      }
      printGroupedBySection.get(sectionId)!.push(q)
    })

    Array.from(printGroupedBySection.entries()).forEach(([sectionId, sectionQuestions]) => {
      html += `<div class="section-title">${getSectionName(sectionId)}</div>`
      
      sectionQuestions.forEach((q, idx) => {
        html += `
          <div class="question-block">
            <div class="question-num">Q${idx + 1}. ${q.question}</div>
            <div class="options">
              ${[1, 2, 3, 4].map((optNum) => {
                const optionKey = `option_${optNum}` as keyof Question
                const optionText = q[optionKey] as string
                const isCorrect = q.answer === String(optNum)
                return `<div class="option"><span class="option-label">${String.fromCharCode(64 + optNum)})</span> ${optionText} ${isCorrect ? '✓' : ''}</div>`
              }).join('')}
            </div>
            <div class="marks">Marks: +${q.positive_marks} / ${q.negative_marks}</div>
          </div>
        `
      })
    })

    html += `
        </div>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
    setPrintModalOpen(false)
  }

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleBookmark = () => {
    const isCurrentlyBookmarked = bookmarkedQuestions.has(currentQuestion.id)
    
    if (isCurrentlyBookmarked) {
      removeBookmark(currentQuestion.id, coaching.id)
      setBookmarkedQuestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(currentQuestion.id)
        return newSet
      })
    } else {
      addBookmark(currentQuestion, coaching.id, test.id)
      setBookmarkedQuestions(prev => new Set(prev).add(currentQuestion.id))
    }
  }

  const handleShare = () => {
    const shareText = `${currentQuestion.question}\n\nA) ${currentQuestion.option_1}\nB) ${currentQuestion.option_2}\nC) ${currentQuestion.option_3}\nD) ${currentQuestion.option_4}`
    
    if (navigator.share) {
      navigator.share({
        title: test.title,
        text: shareText,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Question copied to clipboard!')
    }
    setShowShareMenu(false)
  }

  const handleCompleteTest = () => {
    if (isTestComplete) {
      // Unmark complete
      unmarkTestComplete(coaching.id, test.id)
      setIsTestComplete(false)
      alert('Test marked as incomplete!')
    } else {
      // Mark complete
      markTestComplete(coaching.id, test.id)
      setIsTestComplete(true)
      alert('Test marked as complete!')
    }
  }

  // Group questions by section
  const groupedBySection = new Map<string, Question[]>()
  questions.forEach((q: Question) => {
    const sectionId = q.section_id || 'general'
    if (!groupedBySection.has(sectionId)) {
      groupedBySection.set(sectionId, [])
    }
    groupedBySection.get(sectionId)!.push(q)
  })

  const sectionArray = Array.from(groupedBySection.keys())

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90"
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={`fixed md:static inset-0 z-50 md:z-auto w-full md:w-64 bg-card border-r transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>

        <div className="h-full md:h-screen overflow-y-auto p-4 flex flex-col pt-20 md:pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Questions ({questions.length})</h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 hover:bg-muted rounded"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 mb-4 space-y-4 overflow-y-auto">
            {sectionArray.map((section) => {
              const sectionQuestions = groupedBySection.get(section) || []
              const sectionName = getSectionName(section)
              
              return (
                <div key={section}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2">
                    {sectionName}
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {sectionQuestions.map((q, idx) => {
                      const globalIdx = questions.indexOf(q)
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentIndex(globalIdx)
                            setSelectedOption(null)
                            setShowSolution(false)
                            setSidebarOpen(false)
                          }}
                          className={`aspect-square rounded text-xs font-medium transition-all flex items-center justify-center ${
                            currentIndex === globalIdx
                              ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                              : 'bg-muted hover:bg-muted/80 text-foreground'
                          }`}
                        >
                          {globalIdx + 1}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={handlePrint}
            className="w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 flex-shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-black/30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className={`sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-all duration-300 ${
          headerVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href={`/coaching/${coaching.id}`} className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
              <ChevronLeft className="w-4 h-4" />
              Back to Tests
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
              {test.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {coaching.name} • {questions.length} Total Questions
            </p>
          </div>
        </div>

        <div className={`sticky z-40 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 overflow-x-auto transition-all duration-300 ${
          headerVisible ? 'top-16' : 'top-0'
        }`}>
          <div className="max-w-4xl mx-auto px-4 flex gap-2">
            {sectionArray.map((section) => {
              const sectionQCount = groupedBySection.get(section)?.length || 0
              const sectionName = getSectionName(section)
              const isActive = section === currentSection
              return (
                <button
                  key={section}
                  onClick={() => {
                    // Find first question in this section and navigate to it
                    const sectionQuestions = groupedBySection.get(section) || []
                    if (sectionQuestions.length > 0) {
                      const firstQIndex = questions.indexOf(sectionQuestions[0])
                      setCurrentIndex(firstQIndex)
                      setSelectedOption(null)
                      setShowSolution(false)
                    }
                  }}
                  className={`px-4 py-3 font-medium whitespace-nowrap text-sm border-b-2 transition-colors cursor-pointer hover:text-foreground ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground'
                  }`}
                >
                  {sectionName} ({sectionQCount})
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
            {/* Question Counter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground mb-6">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="font-medium text-foreground">
                {getSectionName(currentSection)}
              </span>
            </div>

            {/* Question Card */}
            <Card className="p-6 md:p-8 mb-8">
              {/* Question Text */}
              <div className="mb-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {currentIndex + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <HTMLRenderer html={currentQuestion.question} />
                  </div>
                </div>
              </div>

              {/* Options - Only highlight correct answer after user clicks wrong option */}
              <div className="space-y-3 mb-8">
                {[1, 2, 3, 4].map((optionNum) => {
                  const optionKey = `option_${optionNum}` as keyof Question
                  const optionText = currentQuestion[optionKey] as string
                  const isCorrect = currentQuestion.answer === String(optionNum)
                  const isSelected = selectedOption === optionNum
                  const showCorrectAnswer = selectedOption !== null && selectedOption !== parseInt(currentQuestion.answer)
                  
                  // Determine styling
                  let bgClass = 'border-border hover:border-primary'
                  let textClass = ''
                  
                  if (selectedOption === null) {
                    // No interaction yet - normal state
                    bgClass = 'border-border hover:border-primary'
                  } else if (isSelected && !isCorrect) {
                    // User clicked this wrong option
                    bgClass = 'border-red-500 bg-red-50 dark:bg-red-950'
                    textClass = 'text-red-600'
                  } else if (showCorrectAnswer && isCorrect) {
                    // Show correct answer after wrong selection
                    bgClass = 'border-green-500 bg-green-50 dark:bg-green-950'
                    textClass = 'text-green-600'
                  } else if (selectedOption !== null && isSelected && isCorrect) {
                    // User clicked correct answer
                    bgClass = 'border-green-500 bg-green-50 dark:bg-green-950'
                    textClass = 'text-green-600'
                  }

                  return (
                    <button
                      key={optionNum}
                      onClick={() => handleOptionClick(optionNum)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${bgClass}`}
                      disabled={selectedOption !== null}
                    >
                      <div className="flex gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center font-semibold ${
                          selectedOption === null
                            ? 'border-border'
                            : isSelected && !isCorrect
                            ? 'border-red-500 text-red-600'
                            : showCorrectAnswer && isCorrect
                            ? 'border-green-500 text-green-600'
                            : isSelected && isCorrect
                            ? 'border-green-500 text-green-600'
                            : 'border-border'
                        }`}>
                          {String.fromCharCode(64 + optionNum)}
                        </div>
                        <div className={`flex-1 min-w-0 ${textClass}`}>
                          <HTMLRenderer html={optionText} />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Solution Button */}
              <button
                onClick={() => setShowSolution(true)}
                className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                View Solution
              </button>
            </Card>

            {/* Bookmark and Share Buttons */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                {/* existing question content */}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-colors ${
                    bookmarkedQuestions.has(currentQuestion.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                  title="Bookmark question"
                >
                  <Bookmark className="w-5 h-5" fill={bookmarkedQuestions.has(currentQuestion.id) ? 'currentColor' : 'none'} />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
                    title="Share question"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  {showShareMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-card border rounded-lg shadow-lg z-50">
                      <button
                        onClick={handleShare}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                      >
                        Share/Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Complete Test Button - Toggle */}
            <button
              onClick={handleCompleteTest}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isTestComplete
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
              }`}
            >
              {isTestComplete ? 'Unmark Test as Complete' : 'Mark Test as Complete'}
            </button>
          </div>
        </div>
      </div>

      {/* Solution Modal */}
      <SolutionModal 
        question={currentQuestion}
        isOpen={showSolution}
        onClose={() => setShowSolution(false)}
      />

      {/* Print Modal */}
      {printModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-foreground">Select Sections to Print</h2>
            </div>
            <div className="p-6 space-y-3 max-h-64 overflow-y-auto">
              {sectionArray.map((section) => (
                <label key={section} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-muted rounded">
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(section)}
                    onChange={() => toggleSection(section)}
                    className="w-4 h-4"
                  />
                  <span className="text-foreground">
                    {getSectionName(section)} ({groupedBySection.get(section)?.length || 0} questions)
                  </span>
                </label>
              ))}
            </div>
            <div className="border-t p-4 flex gap-3 justify-end">
              <button
                onClick={() => setPrintModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePrintConfirm}
                disabled={selectedSections.length === 0}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Print PDF
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}