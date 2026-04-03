'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
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
    const toastId = toast.loading('Generating UAT checklist…')
    try {
      const data = await uat.generateChecklist(requirements, userStories) as UATChecklistResponse
      setChecklist({ data, isLoading: false, error: null })
      toast.success('UAT checklist generated', { id: toastId })
      return data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate UAT checklist'
      setChecklist(prev => ({ ...prev, isLoading: false, error: message }))
      toast.error('Failed to generate UAT checklist', { id: toastId, description: message })
      throw err
    }
  }, [])

  const clearChecklist = useCallback(() => {
    setChecklist({ data: null, isLoading: false, error: null })
  }, [])

  return { checklist, generateChecklist, clearChecklist }
}
