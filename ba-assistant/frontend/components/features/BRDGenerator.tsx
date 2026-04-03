'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { ResultDisplay } from './ResultDisplay'
import { useDocuments } from '@/hooks/useDocuments'

const MAX = 10000

function CharCount({ value }: { value: string }) {
  return (
    <span className={`text-[10px] font-mono tabular-nums ${value.length > MAX * 0.9 ? 'text-amber-400' : 'text-[--text-3]'}`}>
      {value.length.toLocaleString()} / {MAX.toLocaleString()}
    </span>
  )
}

export function BRDGenerator() {
  const { generated, generateBRD, clearGenerated } = useDocuments()
  const [projectName,        setProjectName]        = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [requirements,       setRequirements]       = useState('')
  const [scopeIn,            setScopeIn]            = useState('')
  const [scopeOut,           setScopeOut]           = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await generateBRD({
      project_name:        projectName,
      project_description: projectDescription,
      requirements,
      scope_in:  scopeIn  || undefined,
      scope_out: scopeOut || undefined,
    })
  }

  return (
    <div>
      {/* Header */}
      <p className="page-eyebrow anim-rise">Document Generation</p>
      <h1 className="page-title anim-rise d1">BRD Generator</h1>
      <p className="page-subtitle anim-rise d2">
        Provide project context and requirements — Meridian will generate a structured Business Requirements Document.
      </p>

      {/* Form */}
      <div className="form-card mt-8 anim-rise d3">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="brd-name" className="form-label">Project Name *</Label>
            </div>
            <Input
              id="brd-name"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="e.g. Customer Portal Redesign"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="brd-desc" className="form-label">Project Description *</Label>
              <CharCount value={projectDescription} />
            </div>
            <Textarea
              id="brd-desc"
              value={projectDescription}
              onChange={e => setProjectDescription(e.target.value)}
              placeholder="Describe the project goals, context, and background..."
              rows={3}
              required
              maxLength={MAX}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="brd-reqs" className="form-label">Requirements *</Label>
              <CharCount value={requirements} />
            </div>
            <Textarea
              id="brd-reqs"
              value={requirements}
              onChange={e => setRequirements(e.target.value)}
              placeholder="List the main requirements, one per line..."
              rows={6}
              required
              maxLength={MAX}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="brd-in" className="form-label">In Scope <span className="text-[--text-3] normal-case tracking-normal font-normal">(optional)</span></Label>
                <CharCount value={scopeIn} />
              </div>
              <Textarea
                id="brd-in"
                value={scopeIn}
                onChange={e => setScopeIn(e.target.value)}
                placeholder="What is included..."
                rows={3}
                maxLength={MAX}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="brd-out" className="form-label">Out of Scope <span className="text-[--text-3] normal-case tracking-normal font-normal">(optional)</span></Label>
                <CharCount value={scopeOut} />
              </div>
              <Textarea
                id="brd-out"
                value={scopeOut}
                onChange={e => setScopeOut(e.target.value)}
                placeholder="What is excluded..."
                rows={3}
                maxLength={MAX}
              />
            </div>
          </div>

          {generated.error && (
            <p className="form-error">{generated.error}</p>
          )}

          <Button type="submit" disabled={generated.isLoading}>
            {generated.isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {generated.isLoading ? 'Generating BRD…' : 'Generate BRD'}
          </Button>
        </form>
      </div>

      {/* Loading skeleton */}
      {generated.isLoading && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {/* Output */}
      {generated.data && !generated.isLoading && (
        <ResultDisplay
          title="Generated BRD"
          content={generated.data.content}
          onClear={clearGenerated}
        />
      )}
    </div>
  )
}
