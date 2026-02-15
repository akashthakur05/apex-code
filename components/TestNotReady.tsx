'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react' // Optional: install lucide-react or use SVG

export const TestNotReadyUI = () => {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] rounded-xl border-2 border-dashed border-muted p-12 text-center bg-card">
      {/* Icon Section */}
      <div className="bg-amber-50 text-amber-600 p-4 rounded-full mb-4 transition-transform hover:scale-105">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
        </svg>
      </div>

      {/* Text Content */}
      <h2 className="text-xl font-semibold tracking-tight text-foreground">Content Under Review</h2>
      <p className="text-muted-foreground mt-2 max-w-[300px] text-sm leading-relaxed">
        The questions for this test are currently being digitized. Please check back later.
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col gap-3">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all active:scale-95"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
        
        <div className="inline-flex items-center justify-center rounded-full bg-amber-100 px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-amber-800">
          Status: Coming Soon
        </div>
      </div>
    </div>
  );
};