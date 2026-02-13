'use client'

import { useMemo, useEffect, useRef } from 'react'
import renderMathInElement from 'katex/contrib/auto-render'
import 'katex/dist/katex.min.css'

interface Props {
  html: string
}

export default function HTMLRenderer({ html }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const cleanHtml = useMemo(() => {
    if (!html) return ''

    let cleaned = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    cleaned = cleaned.replace(/style="[^"]*"/gi, '')
    cleaned = cleaned.replace(/onclick="[^"]*"/gi, '')

    return cleaned
  }, [html])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // 🔥 RESET content to raw HTML before KaTeX
    el.innerHTML = cleanHtml

    // 🔥 Run KaTeX AFTER reset
    renderMathInElement(el, {
      delimiters: [
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ],
      throwOnError: false
    })

  }, [cleanHtml])

  return (
<div
  ref={ref}
  className="question-container text-foreground [&_img]:inline-block [&_img]:align-middle [&_p]:m-0"
/>

  )
}
