'use client'

import { useEffect } from 'react'

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  ctrlKey = true,
  shiftKey = false
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        e.ctrlKey === ctrlKey &&
        e.shiftKey === shiftKey
      ) {
        e.preventDefault()
        callback()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, callback, ctrlKey, shiftKey])
}
