'use client'

import HTMLRenderer from './html-renderer'

interface Props {
  question: any
  questionNumber: number
  testName?: string
}

export default function PrintableQuestion({
  question,
  questionNumber,
  testName,
}: Props) {
  const correctOption = Number(question.answer)

  return (
    <div
      style={{
        width: 800,
        padding: 32,
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        color: '#000',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            background: '#111',
            color: '#fff',
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Q{questionNumber}
        </div>

        {testName && (
          <div style={{ marginTop: 6, fontSize: 12, color: '#555' }}>
            {testName}
          </div>
        )}
      </div>

      {/* Question */}
      <div style={{ marginBottom: 24, fontSize: 18 }}>
        <HTMLRenderer html={question.question} />
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3, 4].map((opt) => {
          const isCorrect = opt === correctOption

          return (
            <div
              key={opt}
              style={{
                padding: 12,
                border: `2px solid ${isCorrect ? '#16a34a' : '#ccc'}`,
                borderRadius: 8,
                background: isCorrect ? '#dcfce7' : '#fff',
              }}
            >
              <strong>
                {String.fromCharCode(64 + opt)}.
              </strong>{' '}
              <HTMLRenderer html={question[`option_${opt}`]} />
            </div>
          )
        })}
      </div>

      {/* Solution Box */}
      {question.solution_text && (
        <div
          style={{
            marginTop: 32,
            padding: 16,
            background: '#f3f4f6',
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          <strong>Solution:</strong>
          <div style={{ marginTop: 8 }}>
            <HTMLRenderer html={question.solution_text} />
          </div>
        </div>
      )}
    </div>
  )
}
