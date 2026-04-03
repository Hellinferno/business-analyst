'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ResultDisplay } from './ResultDisplay'
import { useElicitation } from '@/hooks/useElicitation'

const MAX = 10000

type ActiveTool = 'questions' | 'scope' | 'ambiguity'

export function ElicitationPanel() {
  const { questions, scopeResult, ambiguityResult, generateQuestions, runScopeWizard, checkAmbiguity } =
    useElicitation()

  const [activeTool,          setActiveTool]          = useState<ActiveTool>('questions')
  const [projectName,         setProjectName]         = useState('')
  const [projectDescription,  setProjectDescription]  = useState('')
  const [stakeholders,        setStakeholders]        = useState('')
  const [initialScope,        setInitialScope]        = useState('')
  const [requirements,        setRequirements]        = useState('')

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


  return (
    <div>
      {/* Header */}
      <p className="page-eyebrow anim-rise">Discovery & Scoping</p>
      <h1 className="page-title anim-rise d1">Requirements Elicitation</h1>
      <p className="page-subtitle anim-rise d2">
        Generate interview questions, define project scope, and detect ambiguities in requirements.
      </p>

      <div className="mt-8 anim-rise d3">
        <Tabs value={activeTool} onValueChange={v => setActiveTool(v as ActiveTool)}>
          <TabsList>
            <TabsTrigger value="questions">01 — Interview Questions</TabsTrigger>
            <TabsTrigger value="scope">02 — Scope Wizard</TabsTrigger>
            <TabsTrigger value="ambiguity">03 — Ambiguity Check</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Interview Questions ── */}
          <TabsContent value="questions">
            <div className="form-card mt-0 border-t-0">
              <form onSubmit={handleGenerateQuestions} className="space-y-5">
                <div>
                  <Label className="form-label mb-1.5 block">Project Name *</Label>
                  <Input
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="e.g. HR Self-Service Portal"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="form-label">Project Description *</Label>
                    <span className="text-[10px] font-mono text-[--text-3]">{projectDescription.length.toLocaleString()} / {MAX.toLocaleString()}</span>
                  </div>
                  <Textarea
                    value={projectDescription}
                    onChange={e => setProjectDescription(e.target.value)}
                    placeholder="Brief description of the project..."
                    rows={3}
                    required
                    maxLength={MAX}
                  />
                </div>
                <div>
                  <Label className="form-label mb-1.5 block">Stakeholders <span className="text-[--text-3] normal-case tracking-normal font-normal">(optional)</span></Label>
                  <Input
                    value={stakeholders}
                    onChange={e => setStakeholders(e.target.value)}
                    placeholder="e.g. HR Manager, IT Team, End Users"
                  />
                </div>
                {questions.error && <p className="form-error">{questions.error}</p>}
                <Button type="submit" disabled={questions.isLoading}>
                  {questions.isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {questions.isLoading ? 'Generating…' : 'Generate Questions'}
                </Button>
              </form>
            </div>

            {/* Questions output */}
            {questions.isLoading && (
              <div className="mt-6 space-y-2">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            )}
            {questions.data && !questions.isLoading && (
              <div className="mt-6">
                <div className="result-bar">
                  <span className="result-title-text">
                    {questions.data.questions.length} Interview Questions
                  </span>
                </div>
                <div className="border border-[--bdr-0] border-t-0">
                  {Object.entries(
                    questions.data.questions.reduce<Record<string, typeof questions.data.questions>>((acc, q) => {
                      const cat = q.category || 'General'
                      acc[cat] = [...(acc[cat] ?? []), q]
                      return acc
                    }, {})
                  ).map(([category, qs]) => (
                    <div key={category}>
                      <p className="page-eyebrow px-4 py-2 border-b border-[--bdr-0] bg-[--surf-1]">{category}</p>
                      {qs.map((q, i) => (
                        <div key={i} className="px-4 py-3 border-b border-[--bdr-0] last:border-b-0">
                          <p className="text-sm text-[--text-1] flex gap-2">
                            <span className="m-idx text-[10px] mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                            {q.question}
                          </p>
                          {q.rationale && (
                            <p className="text-xs text-[--text-3] mt-1 pl-6 italic">{q.rationale}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Tab 2: Scope Wizard ── */}
          <TabsContent value="scope">
            <div className="form-card mt-0 border-t-0">
              <form onSubmit={handleScopeWizard} className="space-y-5">
                <div>
                  <Label className="form-label mb-1.5 block">Project Name *</Label>
                  <Input
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="e.g. Inventory Management System"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="form-label">Project Description *</Label>
                    <span className="text-[10px] font-mono text-[--text-3]">{projectDescription.length.toLocaleString()} / {MAX.toLocaleString()}</span>
                  </div>
                  <Textarea
                    value={projectDescription}
                    onChange={e => setProjectDescription(e.target.value)}
                    placeholder="Brief description of the project..."
                    rows={3}
                    required
                    maxLength={MAX}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="form-label">Initial Scope Notes *</Label>
                    <span className="text-[10px] font-mono text-[--text-3]">{initialScope.length.toLocaleString()} / {MAX.toLocaleString()}</span>
                  </div>
                  <Textarea
                    value={initialScope}
                    onChange={e => setInitialScope(e.target.value)}
                    placeholder="What do you think should be in scope? Include rough ideas..."
                    rows={4}
                    required
                    maxLength={MAX}
                  />
                </div>
                {scopeResult.error && <p className="form-error">{scopeResult.error}</p>}
                <Button type="submit" disabled={scopeResult.isLoading}>
                  {scopeResult.isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {scopeResult.isLoading ? 'Defining Scope…' : 'Define Scope'}
                </Button>
              </form>
            </div>

            {scopeResult.isLoading && (
              <div className="mt-6 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            )}
            {scopeResult.data && !scopeResult.isLoading && (
              <ResultDisplay title="Scope Definition" content={scopeResult.data.scope_definition} />
            )}
          </TabsContent>

          {/* ── Tab 3: Ambiguity Check ── */}
          <TabsContent value="ambiguity">
            <div className="form-card mt-0 border-t-0">
              <form onSubmit={handleAmbiguityCheck} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="form-label">Requirements *</Label>
                    <span className="text-[10px] font-mono text-[--text-3]">{requirements.length.toLocaleString()} / {MAX.toLocaleString()}</span>
                  </div>
                  <Textarea
                    value={requirements}
                    onChange={e => setRequirements(e.target.value)}
                    placeholder="Paste your requirements here, one per line..."
                    rows={8}
                    required
                    maxLength={MAX}
                  />
                </div>
                {ambiguityResult.error && <p className="form-error">{ambiguityResult.error}</p>}
                <Button type="submit" disabled={ambiguityResult.isLoading}>
                  {ambiguityResult.isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {ambiguityResult.isLoading ? 'Checking…' : 'Check for Ambiguity'}
                </Button>
              </form>
            </div>

            {ambiguityResult.isLoading && (
              <div className="mt-6 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}
            {ambiguityResult.data && !ambiguityResult.isLoading && (
              <div className="mt-6 space-y-4">
                {/* Quality score */}
                <div className="form-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="page-eyebrow">Quality Score</span>
                    <span className="text-2xl font-mono font-bold text-[--text-1]">
                      {ambiguityResult.data.overall_quality_score}<span className="text-sm text-[--text-3]">/100</span>
                    </span>
                  </div>
                  <Progress
                    value={ambiguityResult.data.overall_quality_score}
                    className={cn('[&>div]:transition-all [&>div]:duration-700', {
                      '[&>div]:bg-[--lime]':   ambiguityResult.data.overall_quality_score >= 70,
                      '[&>div]:bg-amber-400':  ambiguityResult.data.overall_quality_score >= 40 && ambiguityResult.data.overall_quality_score < 70,
                      '[&>div]:bg-red-500':    ambiguityResult.data.overall_quality_score < 40,
                    })}
                  />
                  {ambiguityResult.data.summary && (
                    <p className="text-sm text-[--text-2] mt-3">{ambiguityResult.data.summary}</p>
                  )}
                </div>

                {/* Ambiguous terms */}
                {ambiguityResult.data.ambiguous_terms?.length > 0 && (
                  <div className="border border-amber-800/40 bg-amber-950/20">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-amber-800/40">
                      <Badge variant="medium">AMBIGUOUS</Badge>
                      <span className="text-xs text-[--text-2]">Terms requiring clarification</span>
                    </div>
                    {ambiguityResult.data.ambiguous_terms.map((term, i) => (
                      <p key={i} className="px-4 py-2 text-sm text-[--text-2] border-b border-amber-800/20 last:border-b-0">
                        — {term.term}: {term.issue} → {term.suggestion}
                      </p>
                    ))}
                  </div>
                )}

                {/* Gaps */}
                {ambiguityResult.data.gaps?.length > 0 && (
                  <div className="border border-amber-700/40 bg-amber-950/10">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-amber-700/40">
                      <Badge variant="medium">GAP</Badge>
                      <span className="text-xs text-[--text-2]">Missing information</span>
                    </div>
                    {ambiguityResult.data.gaps.map((gap, i) => (
                      <p key={i} className="px-4 py-2 text-sm text-[--text-2] border-b border-amber-700/20 last:border-b-0">
                        — {gap.area}: {gap.missing_info}
                      </p>
                    ))}
                  </div>
                )}

                {/* Conflicts */}
                {ambiguityResult.data.conflicts?.length > 0 && (
                  <div className="border border-red-800/40 bg-red-950/20">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-red-800/40">
                      <Badge variant="high">CONFLICT</Badge>
                      <span className="text-xs text-[--text-2]">Contradictory requirements</span>
                    </div>
                    {ambiguityResult.data.conflicts.map((conflict, i) => (
                      <p key={i} className="px-4 py-2 text-sm text-[--text-2] border-b border-red-800/20 last:border-b-0">
                        — {conflict.requirement_a} vs {conflict.requirement_b}: {conflict.conflict_description}
                      </p>
                    ))}
                  </div>
                )}

                {/* Testability issues */}
                {ambiguityResult.data.testability_issues?.length > 0 && (
                  <div className="border border-[--bdr-0]">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-[--bdr-0]">
                      <Badge variant="low">TESTABILITY</Badge>
                      <span className="text-xs text-[--text-2]">Hard to verify</span>
                    </div>
                    {ambiguityResult.data.testability_issues.map((issue, i) => (
                      <p key={i} className="px-4 py-2 text-sm text-[--text-2] border-b border-[--bdr-0] last:border-b-0">
                        — {issue.requirement}: {issue.issue} → {issue.suggestion}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
