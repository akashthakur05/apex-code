'use client'

import { useLoading } from '@/lib/loading-context'
import { Spinner } from '@/components/ui/spinner'
import { motion, AnimatePresence } from 'framer-motion'

export function LoadingIndicator() {
  const { isLoading, message } = useLoading()

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 flex flex-col items-center gap-4"
          >
            <Spinner className="size-8" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
