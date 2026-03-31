'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ResultDisplay } from './ResultDisplay'
import { useDocuments } from '@/hooks/useDocuments'

export function BRDGenerator() {
  const { generated, generateBRD, clearGenerated } = useDocuments()
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [requirements, setRequirements] = useState('')
  const [scopeIn, setScopeIn] = useState('')
  const [scopeOut, setScopeOut] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await generateBRD({ project_name: projectName, project_description: projectDescription, requirements, scope_in: scopeIn, scope_out: scopeOut })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Generate BRD</h2>
        <p className="text-gray-500 mt-1">Create a comprehensive Business Requirements Document using AI.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Fill in the details to generate your BRD.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="e.g. Customer Portal Redesign"
                required
              />
            </div>
            <div>
              <Label htmlFor="project-desc">Project Description *</Label>
              <Textarea
                id="project-desc"
                value={projectDescription}
                onChange={e => setProjectDescription(e.target.value)}
                placeholder="Describe the project goals, context, and background..."
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="requirements">Requirements *</Label>
              <Textarea
                id="requirements"
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                placeholder="List the main requirements, one per line..."
                rows={5}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scope-in">In Scope (optional)</Label>
                <Textarea
                  id="scope-in"
                  value={scopeIn}
                  onChange={e => setScopeIn(e.target.value)}
                  placeholder="What is included..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="scope-out">Out of Scope (optional)</Label>
                <Textarea
                  id="scope-out"
                  value={scopeOut}
                  onChange={e => setScopeOut(e.target.value)}
                  placeholder="What is excluded..."
                  rows={3}
                />
              </div>
            </div>
            {generated.error && (
              <p className="text-red-500 text-sm">{generated.error}</p>
            )}
            <Button type="submit" disabled={generated.isLoading}>
              {generated.isLoading ? 'Generating BRD...' : 'Generate BRD'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generated.data && (
        <ResultDisplay
          title="Generated BRD"
          content={generated.data.content}
          onClear={clearGenerated}
        />
      )}
    </div>
  )
}
