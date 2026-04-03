'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
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
      const toastId = toast.loading('Generating interview questions…')
      try {
        const data = await elicitation.generateQuestions(
          projectName,
          projectDescription,
          stakeholders
        ) as GenerateQuestionsResponse
        setQuestions({ data, isLoading: false, error: null })
        toast.success(`${data.questions.length} questions generated`, { id: toastId })
        return data
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to generate questions'
        setQuestions(prev => ({ ...prev, isLoading: false, error: message }))
        toast.error('Failed to generate questions', { id: toastId, description: message })
        throw err
      }
    },
    []
  )

  const runScopeWizard = useCallback(
    async (projectName: string, projectDescription: string, initialScope: string) => {
      setScopeResult({ data: null, isLoading: true, error: null })
      const toastId = toast.loading('Analyzing project scope…')
      try {
        const data = await elicitation.scopeWizard(
          projectName,
          projectDescription,
          initialScope
        ) as ScopeWizardResponse
        setScopeResult({ data, isLoading: false, error: null })
        toast.success('Scope defined successfully', { id: toastId })
        return data
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Scope wizard failed'
        setScopeResult(prev => ({ ...prev, isLoading: false, error: message }))
        toast.error('Scope wizard failed', { id: toastId, description: message })
        throw err
      }
    },
    []
  )

  const checkAmbiguity = useCallback(async (requirements: string) => {
    setAmbiguityResult({ data: null, isLoading: true, error: null })
    const toastId = toast.loading('Checking for ambiguities…')
    try {
      const data = await elicitation.checkAmbiguity(requirements) as AmbiguityCheckResponse
      setAmbiguityResult({ data, isLoading: false, error: null })
      const issueCount = (data.ambiguous_terms?.length || 0) + (data.gaps?.length || 0) + (data.conflicts?.length || 0)
      if (issueCount === 0) {
        toast.success('Requirements look clear!', { id: toastId })
      } else {
        toast.warning(`${issueCount} issues found`, { id: toastId, description: `${data.ambiguous_terms?.length || 0} ambiguous, ${data.gaps?.length || 0} gaps, ${data.conflicts?.length || 0} conflicts` })
      }
      return data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ambiguity check failed'
      setAmbiguityResult(prev => ({ ...prev, isLoading: false, error: message }))
      toast.error('Ambiguity check failed', { id: toastId, description: message })
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
