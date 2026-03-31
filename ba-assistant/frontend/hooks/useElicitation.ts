'use client'

import { useState, useCallback } from 'react'
import { elicitation } from '@/lib/api'
import type {
  GenerateQuestionsResponse,
  ScopeWizardResponse,
  AmbiguityCheckResponse,
} from '@/types/api'

interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

export function useElicitation() {
  const [questions, setQuestions] = useState<AsyncState<GenerateQuestionsResponse>>({
    data: null,
    isLoading: false,
    error: null,
  })
  const [scopeResult, setScopeResult] = useState<AsyncState<ScopeWizardResponse>>({
    data: null,
    isLoading: false,
    error: null,
  })
  const [ambiguityResult, setAmbiguityResult] = useState<AsyncState<AmbiguityCheckResponse>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const generateQuestions = useCallback(
    async (projectName: string, projectDescription: string, stakeholders?: string) => {
      setQuestions({ data: null, isLoading: true, error: null })
      try {
        const data = await elicitation.generateQuestions(
          projectName,
          projectDescription,
          stakeholders
        ) as GenerateQuestionsResponse
        setQuestions({ data, isLoading: false, error: null })
        return data
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to generate questions'
        setQuestions(prev => ({ ...prev, isLoading: false, error: message }))
        throw err
      }
    },
    []
  )

  const runScopeWizard = useCallback(
    async (projectName: string, projectDescription: string, initialScope: string) => {
      setScopeResult({ data: null, isLoading: true, error: null })
      try {
        const data = await elicitation.scopeWizard(
          projectName,
          projectDescription,
          initialScope
        ) as ScopeWizardResponse
        setScopeResult({ data, isLoading: false, error: null })
        return data
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Scope wizard failed'
        setScopeResult(prev => ({ ...prev, isLoading: false, error: message }))
        throw err
      }
    },
    []
  )

  const checkAmbiguity = useCallback(async (requirements: string) => {
    setAmbiguityResult({ data: null, isLoading: true, error: null })
    try {
      const data = await elicitation.checkAmbiguity(requirements) as AmbiguityCheckResponse
      setAmbiguityResult({ data, isLoading: false, error: null })
      return data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ambiguity check failed'
      setAmbiguityResult(prev => ({ ...prev, isLoading: false, error: message }))
      throw err
    }
  }, [])

  return {
    questions,
    scopeResult,
    ambiguityResult,
    generateQuestions,
    runScopeWizard,
    checkAmbiguity,
  }
}
