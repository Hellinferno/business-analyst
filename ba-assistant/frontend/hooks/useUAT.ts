'use client'

import { useState, useCallback } from 'react'
import { uat } from '@/lib/api'
import type { UATChecklistResponse } from '@/types/api'

interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

export function useUAT() {
  const [checklist, setChecklist] = useState<AsyncState<UATChecklistResponse>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const generateChecklist = useCallback(async (requirements: string, userStories: string) => {
    setChecklist({ data: null, isLoading: true, error: null })
    try {
      const data = await uat.generateChecklist(requirements, userStories) as UATChecklistResponse
      setChecklist({ data, isLoading: false, error: null })
      return data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate UAT checklist'
      setChecklist(prev => ({ ...prev, isLoading: false, error: message }))
      throw err
    }
  }, [])

  const clearChecklist = useCallback(() => {
    setChecklist({ data: null, isLoading: false, error: null })
  }, [])

  return { checklist, generateChecklist, clearChecklist }
}
