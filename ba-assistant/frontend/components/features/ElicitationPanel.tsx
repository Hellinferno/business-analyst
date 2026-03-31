'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ResultDisplay } from './ResultDisplay'
import { useElicitation } from '@/hooks/useElicitation'

type ActiveTool = 'questions' | 'scope' | 'ambiguity'

export function ElicitationPanel() {
  const { questions, scopeResult, ambiguityResult, generateQuestions, runScopeWizard, checkAmbiguity } =
    useElicitation()

  const [activeTool, setActiveTool] = useState<ActiveTool>('questions')
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [stakeholders, setStakeholders] = useState('')
  const [initialScope, setInitialScope] = useState('')
  const [requirements, setRequirements] = useState('')

  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault()
    await generateQuestions(projectName, projectDescription, stakeholders || undefined)
  }

  const handleScopeWizard = async (e: React.FormEvent) => {
    e.preventDefault()
    await runScopeWizard(projectName, projectDescription, initialScope)
  }

  const handleAmbiguityCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    await checkAmbiguity(requirements)
  }

  const tabs: { key: ActiveTool; label: string }[] = [
    { key: 'questions', label: 'Interview Questions' },
    { key: 'scope', label: 'Scope Wizard' },
    { key: 'ambiguity', label: 'Ambiguity Check' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Requirements Elicitation</h2>
        <p className="text-gray-500 mt-1">
          Generate interview questions, define scope, and detect ambiguous requirements.
        </p>
      </div>

      <div className="flex gap-2 border-b">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTool === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTool(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTool === 'questions' && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Interview Questions</CardTitle>
            <CardDescription>
              Generate structured stakeholder interview questions tailored to your project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateQuestions} className="space-y-4">
              <div>
                <Label>Project Name *</Label>
                <Input
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="e.g. HR Self-Service Portal"
                  required
                />
              </div>
              <div>
                <Label>Project Description *</Label>
                <Textarea
                  value={projectDescription}
                  onChange={e => setProjectDescription(e.target.value)}
                  placeholder="Brief description of the project..."
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label>Stakeholders (optional)</Label>
                <Input
                  value={stakeholders}
                  onChange={e => setStakeholders(e.target.value)}
                  placeholder="e.g. HR Manager, IT Team, End Users"
                />
              </div>
              {questions.error && <p className="text-red-500 text-sm">{questions.error}</p>}
              <Button type="submit" disabled={questions.isLoading}>
                {questions.isLoading ? 'Generating...' : 'Generate Questions'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTool === 'scope' && (
        <Card>
          <CardHeader>
            <CardTitle>Scope Wizard</CardTitle>
            <CardDescription>
              Define a clear project scope with in-scope and out-of-scope items.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScopeWizard} className="space-y-4">
              <div>
                <Label>Project Name *</Label>
                <Input
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="e.g. Inventory Management System"
                  required
                />
              </div>
              <div>
                <Label>Project Description *</Label>
                <Textarea
                  value={projectDescription}
                  onChange={e => setProjectDescription(e.target.value)}
                  placeholder="Brief description of the project..."
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label>Initial Scope Notes *</Label>
                <Textarea
                  value={initialScope}
                  onChange={e => setInitialScope(e.target.value)}
                  placeholder="What do you think should be in scope? Include rough ideas..."
                  rows={4}
                  required
                />
              </div>
              {scopeResult.error && <p className="text-red-500 text-sm">{scopeResult.error}</p>}
              <Button type="submit" disabled={scopeResult.isLoading}>
                {scopeResult.isLoading ? 'Defining Scope...' : 'Define Scope'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTool === 'ambiguity' && (
        <Card>
          <CardHeader>
            <CardTitle>Ambiguity Check</CardTitle>
            <CardDescription>
              Detect ambiguous terms, gaps, and conflicts in your requirements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAmbiguityCheck} className="space-y-4">
              <div>
                <Label>Requirements *</Label>
                <Textarea
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                  placeholder="Paste your requirements here, one per line..."
                  rows={8}
                  required
                />
              </div>
              {ambiguityResult.error && (
                <p className="text-red-500 text-sm">{ambiguityResult.error}</p>
              )}
              <Button type="submit" disabled={ambiguityResult.isLoading}>
                {ambiguityResult.isLoading ? 'Checking...' : 'Check for Ambiguity'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTool === 'questions' && questions.data && (
        <ResultDisplay
          title="Generated Interview Questions"
          content={JSON.stringify(questions.data.questions, null, 2)}
        />
      )}
      {activeTool === 'scope' && scopeResult.data && (
        <ResultDisplay
          title="Scope Definition"
          content={scopeResult.data.scope_definition}
        />
      )}
      {activeTool === 'ambiguity' && ambiguityResult.data && (
        <ResultDisplay
          title="Ambiguity Analysis"
          content={JSON.stringify(ambiguityResult.data, null, 2)}
        />
      )}
    </div>
  )
}
