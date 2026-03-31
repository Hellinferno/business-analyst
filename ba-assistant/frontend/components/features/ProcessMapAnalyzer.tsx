'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ResultDisplay } from './ResultDisplay'
import { useProcessMaps } from '@/hooks/useProcessMaps'

export function ProcessMapAnalyzer() {
  const { analysis, analyzeProcess, clearAnalysis } = useProcessMaps()
  const [processName, setProcessName] = useState('')
  const [processSteps, setProcessSteps] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await analyzeProcess(processName, processSteps)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Process Map Analysis</h2>
        <p className="text-gray-500 mt-1">
          Analyse your As-Is process for inefficiencies and get To-Be recommendations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Process Details</CardTitle>
          <CardDescription>
            Describe your current process steps and get AI-powered analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Process Name *</Label>
              <Input
                value={processName}
                onChange={e => setProcessName(e.target.value)}
                placeholder="e.g. Employee Onboarding Process"
                required
              />
            </div>
            <div>
              <Label>Process Steps *</Label>
              <Textarea
                value={processSteps}
                onChange={e => setProcessSteps(e.target.value)}
                placeholder={`Describe each step, e.g.:\n1. HR receives new hire form\n2. IT creates accounts (2-3 days)\n3. Manager assigns buddy\n...`}
                rows={8}
                required
              />
            </div>
            {analysis.error && <p className="text-red-500 text-sm">{analysis.error}</p>}
            <Button type="submit" disabled={analysis.isLoading}>
              {analysis.isLoading ? 'Analysing Process...' : 'Analyse Process'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {analysis.data && (
        <ResultDisplay
          title="Process Analysis"
          content={analysis.data.analysis}
          onClear={clearAnalysis}
        />
      )}
    </div>
  )
}
