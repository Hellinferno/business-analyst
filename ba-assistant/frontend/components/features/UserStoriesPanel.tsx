'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ResultDisplay } from './ResultDisplay'
import { useDocuments } from '@/hooks/useDocuments'

export function UserStoriesPanel() {
  const { generated, generateUserStories, generateAcceptanceCriteria, clearGenerated } = useDocuments()
  const [mode, setMode] = useState<'stories' | 'criteria'>('stories')

  const [projectName, setProjectName] = useState('')
  const [requirements, setRequirements] = useState('')
  const [userPersonas, setUserPersonas] = useState('')
  const [userStoriesText, setUserStoriesText] = useState('')

  const handleGenerateStories = async (e: React.FormEvent) => {
    e.preventDefault()
    await generateUserStories({ project_name: projectName, requirements, user_personas: userPersonas || undefined })
  }

  const handleGenerateCriteria = async (e: React.FormEvent) => {
    e.preventDefault()
    await generateAcceptanceCriteria(userStoriesText)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Stories</h2>
        <p className="text-gray-500 mt-1">Generate user stories and acceptance criteria from requirements.</p>
      </div>

      <div className="flex gap-2 border-b">
        {[
          { key: 'stories' as const, label: 'User Stories' },
          { key: 'criteria' as const, label: 'Acceptance Criteria' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              mode === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => { setMode(tab.key); clearGenerated() }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === 'stories' && (
        <Card>
          <CardHeader>
            <CardTitle>Generate User Stories</CardTitle>
            <CardDescription>Create Agile user stories from your requirements.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateStories} className="space-y-4">
              <div>
                <Label>Project Name *</Label>
                <Input
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="e.g. Mobile Banking App"
                  required
                />
              </div>
              <div>
                <Label>Requirements *</Label>
                <Textarea
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                  placeholder="List requirements, one per line..."
                  rows={5}
                  required
                />
              </div>
              <div>
                <Label>User Personas (optional)</Label>
                <Input
                  value={userPersonas}
                  onChange={e => setUserPersonas(e.target.value)}
                  placeholder="e.g. Customer, Administrator, Support Agent"
                />
              </div>
              {generated.error && <p className="text-red-500 text-sm">{generated.error}</p>}
              <Button type="submit" disabled={generated.isLoading}>
                {generated.isLoading ? 'Generating...' : 'Generate User Stories'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {mode === 'criteria' && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Acceptance Criteria</CardTitle>
            <CardDescription>
              Create detailed Given-When-Then acceptance criteria for your user stories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateCriteria} className="space-y-4">
              <div>
                <Label>User Stories *</Label>
                <Textarea
                  value={userStoriesText}
                  onChange={e => setUserStoriesText(e.target.value)}
                  placeholder="Paste your user stories here..."
                  rows={8}
                  required
                />
              </div>
              {generated.error && <p className="text-red-500 text-sm">{generated.error}</p>}
              <Button type="submit" disabled={generated.isLoading}>
                {generated.isLoading ? 'Generating...' : 'Generate Acceptance Criteria'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {generated.data && (
        <ResultDisplay
          title={mode === 'stories' ? 'Generated User Stories' : 'Acceptance Criteria'}
          content={generated.data.content}
          onClear={clearGenerated}
        />
      )}
    </div>
  )
}
