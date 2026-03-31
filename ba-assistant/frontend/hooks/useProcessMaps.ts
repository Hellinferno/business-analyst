'use client'

import { useState, useCallback } from 'react'
import { processMaps } from '@/lib/api'
import type { ProcessAnalysisResponse } from '@/types/api'

interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

export function useProcessMaps() {
  const [analysis, setAnalysis] = useState<AsyncState<ProcessAnalysisResponse>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const analyzeProcess = useCallback(async (processName: string, processSteps: string) => {
    setAnalysis({ data: null, isLoading: true, error: null })
    try {
      const data = await processMaps.analyze(processName, processSteps) as ProcessAnalysisResponse
      setAnalysis({ data, isLoading: false, error: null })
      return data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Process analysis failed'
      setAnalysis(prev => ({ ...prev, isLoading: false, error: message }))
      throw err
    }
  }, [])

  const clearAnalysis = useCallback(() => {
    setAnalysis({ data: null, isLoading: false, error: null })
  }, [])

  return { analysis, analyzeProcess, clearAnalysis }
}
