'use client'

import { useState, useCallback } from 'react'
import { documents } from '@/lib/api'
import type {
  Document,
  DocumentListResponse,
  GenerateBRDRequest,
  GenerateUserStoriesRequest,
} from '@/types/api'

interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

export function useDocuments() {
  const [list, setList] = useState<AsyncState<DocumentListResponse>>({
    data: null,
    isLoading: false,
    error: null,
  })
  const [generated, setGenerated] = useState<AsyncState<Document>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const fetchDocuments = useCallback(async (docType?: string) => {
    setList(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const data = await documents.list(docType) as DocumentListResponse
      setList({ data, isLoading: false, error: null })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load documents'
      setList(prev => ({ ...prev, isLoading: false, error: message }))
      throw err
    }
  }, [])

  const generateBRD = useCallback(async (req: GenerateBRDRequest) => {
    setGenerated({ data: null, isLoading: true, error: null })
    try {
      const data = await documents.generateBRD(
        req.project_name,
        req.project_description,
        req.requirements,
        req.scope_in,
        req.scope_out
      ) as Document
      setGenerated({ data, isLoading: false, error: null })
      return data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate BRD'
      setGenerated(prev => ({ ...prev, isLoading: false, error: message }))
      throw err
    }
  }, [])

  const generateUserStories = useCallback(async (req: GenerateUserStoriesRequest) => {
    setGenerated({ data: null, isLoading: true, error: null })
    try {
      const data = await documents.generateUserStories(
        req.project_name,
        req.requirements,
        req.user_personas
      ) as Document
      setGenerated({ data, isLoading: false, error: null })
      return data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate user stories'
      setGenerated(prev => ({ ...prev, isLoading: false, error: message }))
      throw err
    }
  }, [])

  const generateAcceptanceCriteria = useCallback(async (userStories: string) => {
    setGenerated({ data: null, isLoading: true, error: null })
    try {
      const data = await documents.generateAcceptanceCriteria(userStories) as Document
      setGenerated({ data, isLoading: false, error: null })
      return data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate acceptance criteria'
      setGenerated(prev => ({ ...prev, isLoading: false, error: message }))
      throw err
    }
  }, [])

  const clearGenerated = useCallback(() => {
    setGenerated({ data: null, isLoading: false, error: null })
  }, [])

  return {
    list,
    generated,
    fetchDocuments,
    generateBRD,
    generateUserStories,
    generateAcceptanceCriteria,
    clearGenerated,
  }
}
