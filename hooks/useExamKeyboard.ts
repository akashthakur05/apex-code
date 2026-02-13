import { useEffect, useRef } from "react"

interface UseExamKeyboardProps {
  onNext: () => void
  onPrev: () => void
  onSelectOption: (opt: number) => void
  isOptionLocked: boolean
}

export function useExamKeyboard({
  onNext,
  onPrev,
  onSelectOption,
  isOptionLocked,
}: UseExamKeyboardProps) {
  const optionLockedRef = useRef(isOptionLocked)

  // Keep ref in sync (no re-binding listeners)
  useEffect(() => {
    optionLockedRef.current = isOptionLocked
  }, [isOptionLocked])

  useEffect(() => {
    const keyToOption = (key: string): number | null => {
      switch (key.toLowerCase()) {
        case "a":
        case "1":
          return 1
        case "b":
        case "2":
          return 2
        case "c":
        case "3":
          return 3
        case "d":
        case "4":
          return 4
        default:
          return null
      }
    }

    const handler = (e: KeyboardEvent) => {
      // OPTION SELECTION
      const opt = keyToOption(e.key)
      if (opt && !optionLockedRef.current) {
        onSelectOption(opt)
        return
      }

      // NAVIGATION
      if (["n", "N", "ArrowRight"].includes(e.key)) {
        e.preventDefault()
        onNext()
      }

      if (["p", "P", "ArrowLeft"].includes(e.key)) {
        e.preventDefault()
        onPrev()
      }
    }

    window.addEventListener("keydown", handler)
    return () => {console.log("Removing keydown listener");window.removeEventListener("keydown", handler)}
  }, []) // ✅ FIXED, CONSTANT DEP ARRAY
}
