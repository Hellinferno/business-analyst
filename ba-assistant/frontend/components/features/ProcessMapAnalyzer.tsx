'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { ResultDisplay } from './ResultDisplay'
import { useProcessMaps } from '@/hooks/useProcessMaps'

const MAX = 10000

export function ProcessMapAnalyzer() {
  const { analysis, analyzeProcess, clearAnalysis } = useProcessMaps()
  const [processName,  setProcessName]  = useState('')
  const [processSteps, setProcessSteps] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await analyzeProcess(processName, processSteps)
  }

  return (
    <div>
      {/* Header */}
      <p className="page-eyebrow anim-rise">Process Intelligence</p>
      <h1 className="page-title anim-rise d1">Process Map Analysis</h1>
      <p className="page-subtitle anim-rise d2">
        Describe your As-Is process steps and Meridian will identify inefficiencies and recommend improvements.
      </p>

      {/* Form */}
      <div className="form-card mt-8 anim-rise d3">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="proc-name" className="form-label mb-1.5 block">Process Name *</Label>
            <Input
              id="proc-name"
              value={processName}
              onChange={e => setProcessName(e.target.value)}
              placeholder="e.g. Employee Onboarding Process"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="proc-steps" className="form-label">Process Steps *</Label>
              <span className={`text-[10px] font-mono tabular-nums ${processSteps.length > MAX * 0.9 ? 'text-amber-400' : 'text-[--text-3]'}`}>
                {processSteps.length.toLocaleString()} / {MAX.toLocaleString()}
              </span>
            </div>
            <Textarea
              id="proc-steps"
              value={processSteps}
              onChange={e => setProcessSteps(e.target.value)}
              placeholder={`Describe each step, e.g.:\n1. HR receives new hire form\n2. IT creates accounts (2–3 days)\n3. Manager assigns buddy\n…`}
              rows={9}
              required
              maxLength={MAX}
            />
          </div>

          {analysis.error && (
            <p className="form-error">{analysis.error}</p>
          )}

          <Button type="submit" disabled={analysis.isLoading}>
            {analysis.isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {analysis.isLoading ? 'Analysing Process…' : 'Analyse Process'}
          </Button>
        </form>
      </div>

      {/* Loading skeleton */}
      {analysis.isLoading && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {/* Output */}
      {analysis.data && !analysis.isLoading && (
        <ResultDisplay
          title={`Process Analysis — ${analysis.data.title || processName}`}
          content={analysis.data.analysis}
          onClear={clearAnalysis}
        />
      )}
    </div>
  )
}
