'use client'

import { useState, useEffect } from 'react'
import { getBookmarks, removeBookmark, BookmarkedQuestion } from '@/lib/bookmark-storage'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import HTMLRenderer from '@/components/html-renderer'
import { X, BookMarked as BookmarkOpen } from 'lucide-react'

export default function BookmarksModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<BookmarkedQuestion[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setBookmarkedQuestions(getBookmarks())
  }, [])

  if (!mounted) return null

  const handleRemoveBookmark = (id: string, coachingId: string) => {
    removeBookmark(id, coachingId)
    setBookmarkedQuestions(prev =>
      prev.filter(q => !(q.id === id && q.coachingId === coachingId))
    )
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <BookmarkOpen className="w-4 h-4" />
        Bookmarked ({bookmarkedQuestions.length})
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Bookmarked Questions ({bookmarkedQuestions.length})
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {bookmarkedQuestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No bookmarked questions yet
                </p>
              ) : (
                bookmarkedQuestions.map((q) => (
                  <Card key={`${q.id}-${q.coachingId}`} className="p-4 relative">
                    <button
                      onClick={() => handleRemoveBookmark(q.id, q.coachingId)}
                      className="absolute top-2 right-2 p-1 hover:bg-muted rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="mb-3 pr-8">
                      <HTMLRenderer html={q.question} />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>A) <HTMLRenderer html={q.option_1} /></div>
                      <div>B) <HTMLRenderer html={q.option_2} /></div>
                      <div>C) <HTMLRenderer html={q.option_3} /></div>
                      <div>D) <HTMLRenderer html={q.option_4} /></div>
                    </div>

                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      Correct: {String.fromCharCode(64 + parseInt(q.answer))}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
