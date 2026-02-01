'use client'

import { useState } from 'react'
import { useLoading } from '@/lib/loading-context'
import { useFileLoading } from '@/hooks/use-file-loading'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function LoadingDemo() {
  const { withLoading } = useLoading()
  const { loadFile, loadMultipleFiles, loadFromURL } = useFileLoading()
  const [result, setResult] = useState<string>('')

  const handleSimpleLoad = async () => {
    try {
      await withLoading(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }, 'Processing data...')
      setResult('Data loaded successfully!')
    } catch (error) {
      setResult('Error loading data')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (file) {
        const content = await loadFile(file)
        setResult(`Loaded file: ${file.name} (${content.length} characters)`)
      }
    } catch (error) {
      setResult('Error loading file')
    }
  }

  const handleMultipleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        const results = await loadMultipleFiles(files)
        setResult(`Loaded ${results.length} files successfully`)
      }
    } catch (error) {
      setResult('Error loading files')
    }
  }

  const handleURLLoad = async () => {
    try {
      // Example: load a text file from URL
      const content = await loadFromURL(
        'https://example.com/sample.txt',
        'sample.txt'
      )
      setResult(`Loaded from URL: ${content.substring(0, 100)}...`)
    } catch (error) {
      setResult('Error loading from URL')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">Loading Indicator Demo</h2>

      <div className="space-y-2">
        <Button
          onClick={handleSimpleLoad}
          className="w-full"
        >
          Simulate Loading
        </Button>

        <div>
          <label className="text-sm font-medium">Load Single File</label>
          <input
            type="file"
            onChange={handleFileUpload}
            className="block w-full text-sm mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Load Multiple Files</label>
          <input
            type="file"
            multiple
            onChange={handleMultipleFiles}
            className="block w-full text-sm mt-1"
          />
        </div>

        <Button
          onClick={handleURLLoad}
          variant="outline"
          className="w-full"
        >
          Load from URL
        </Button>
      </div>

      {result && (
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded text-sm">
          {result}
        </div>
      )}
    </Card>
  )
}
