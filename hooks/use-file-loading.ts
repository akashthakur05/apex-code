'use client'

import { useLoading } from '@/lib/loading-context'
import { useCallback } from 'react'

export function useFileLoading() {
  const { withLoading } = useLoading()

  const loadFile = useCallback(
    async (file: File) => {
      return withLoading(async () => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const content = e.target?.result as string
            resolve(content)
          }
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsText(file)
        })
      }, `Loading ${file.name}...`)
    },
    [withLoading]
  )

  const loadMultipleFiles = useCallback(
    async (files: File[]) => {
      return withLoading(async () => {
        const results = await Promise.all(
          files.map((file) => {
            return new Promise<{ name: string; content: string }>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = (e) => {
                resolve({
                  name: file.name,
                  content: e.target?.result as string,
                })
              }
              reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
              reader.readAsText(file)
            })
          })
        )
        return results
      }, `Loading ${files.length} files...`)
    },
    [withLoading]
  )

  const loadFromURL = useCallback(
    async (url: string, fileName: string = 'file') => {
      return withLoading(async () => {
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to load file')
        return response.text()
      }, `Loading ${fileName}...`)
    },
    [withLoading]
  )

  return { loadFile, loadMultipleFiles, loadFromURL }
}
