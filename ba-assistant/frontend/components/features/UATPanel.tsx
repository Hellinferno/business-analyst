'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ResultDisplay } from './ResultDisplay'
import { useUAT } from '@/hooks/useUAT'

export function UATPanel() {
  const { checklist, generateChecklist, clearChecklist } = useUAT()
  const [requirements, setRequirements] = useState('')
  const [userStories, setUserStories] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await generateChecklist(requirements, userStories)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">UAT Checklist</h2>
        <p className="text-gray-500 mt-1">
          Generate comprehensive User Acceptance Testing checklists from requirements.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate UAT Checklist</CardTitle>
          <CardDescription>
            Provide requirements and user stories to generate a thorough test checklist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Requirements *</Label>
              <Textarea
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                placeholder="List your functional and non-functional requirements..."
                rows={5}
                required
              />
            </div>
            <div>
              <Label>User Stories (optional but recommended)</Label>
              <Textarea
                value={userStories}
                onChange={e => setUserStories(e.target.value)}
                placeholder="Paste user stories to generate more targeted test cases..."
                rows={5}
              />
            </div>
            {checklist.error && <p className="text-red-500 text-sm">{checklist.error}</p>}
            <Button type="submit" disabled={checklist.isLoading}>
              {checklist.isLoading ? 'Generating Checklist...' : 'Generate UAT Checklist'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {checklist.data && (
        <ResultDisplay
          title={`UAT Checklist (${checklist.data.checklist?.length ?? 0} test cases)`}
          content={JSON.stringify(checklist.data.checklist, null, 2)}
          onClear={clearChecklist}
        />
      )}
    </div>
  )
}
