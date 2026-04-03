'use client'

import { useMemo, useState } from 'react'
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useUAT } from '@/hooks/useUAT'
import type { UATTestCase } from '@/types/api'

const MAX = 10000

type Priority = 'High' | 'Medium' | 'Low'
const PRIORITY_VARIANT: Record<Priority, 'high' | 'medium' | 'low'> = {
  High:   'high',
  Medium: 'medium',
  Low:    'low',
}

function TestCaseCard({
  tc,
  checked,
  onToggle,
}: {
  tc: UATTestCase
  checked: boolean
  onToggle: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const priority = (tc.priority as Priority) ?? 'Medium'

  return (
    <div className={`border-b border-[--bdr-0] last:border-b-0 transition-colors ${checked ? 'bg-[--lime-s]/30' : ''}`}>
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Checkbox */}
        <button
          type="button"
          aria-label={`Mark ${tc.test_id} as ${checked ? 'uncomplete' : 'complete'}`}
          onClick={onToggle}
          className={`mt-0.5 w-4 h-4 shrink-0 border flex items-center justify-center transition-colors ${
            checked
              ? 'bg-[--lime] border-[--lime] text-[--void]'
              : 'border-[--bdr-1] hover:border-[--lime-dim]'
          }`}
        >
          {checked && <span className="text-[10px] font-bold leading-none">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="m-idx text-[10px]">{tc.test_id}</span>
            <Badge variant={PRIORITY_VARIANT[priority]}>{priority}</Badge>
            <span className={`text-sm font-medium ${checked ? 'line-through text-[--text-3]' : 'text-[--text-1]'}`}>
              {tc.test_case}
            </span>
          </div>

          {tc.scenario && (
            <p className="text-xs text-[--text-3] italic mb-2">{tc.scenario}</p>
          )}

          {/* Expand steps */}
          {tc.steps?.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-[10px] font-mono text-[--text-3] hover:text-[--text-2] transition-colors uppercase tracking-wider"
            >
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {tc.steps.length} step{tc.steps.length !== 1 ? 's' : ''}
            </button>
          )}

          {expanded && tc.steps?.length > 0 && (
            <ol className="mt-2 space-y-1 pl-4 list-decimal list-outside">
              {tc.steps.map((step, i) => (
                <li key={i} className="text-xs text-[--text-2]">{step}</li>
              ))}
            </ol>
          )}

          {tc.expected_result && expanded && (
            <p className="mt-2 text-xs text-[--lime-dim] font-mono">
              Expected: {tc.expected_result}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function UATPanel() {
  const { checklist, generateChecklist, clearChecklist } = useUAT()
  const [requirements, setRequirements] = useState('')
  const [userStories,  setUserStories]  = useState('')
  const [checkedIds,   setCheckedIds]   = useState<Set<string>>(new Set())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCheckedIds(new Set())
    await generateChecklist(requirements, userStories)
  }

  const toggleChecked = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const grouped = useMemo(() => {
    const map = new Map<string, UATTestCase[]>()
    checklist.data?.checklist?.forEach(tc => {
      const cat = tc.category || 'General'
      map.set(cat, [...(map.get(cat) ?? []), tc])
    })
    return map
  }, [checklist.data])

  const total    = checklist.data?.checklist?.length ?? 0
  const progress = total > 0 ? (checkedIds.size / total) * 100 : 0

  const handleExportCSV = () => {
    if (!checklist.data?.checklist) return
    const header = 'Test ID,Category,Test Case,Scenario,Priority,Expected Result'
    const rows = checklist.data.checklist.map(tc =>
      [tc.test_id, tc.category, tc.test_case, tc.scenario ?? '', tc.priority, tc.expected_result ?? '']
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv  = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'meridian-uat-checklist.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Header */}
      <p className="page-eyebrow anim-rise">Quality Assurance</p>
      <h1 className="page-title anim-rise d1">UAT Checklist</h1>
      <p className="page-subtitle anim-rise d2">
        Generate comprehensive User Acceptance Testing checklists with categorised test cases.
      </p>

      {/* Form */}
      <div className="form-card mt-8 anim-rise d3">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="uat-reqs" className="form-label">Requirements *</Label>
              <span className="text-[10px] font-mono text-[--text-3]">{requirements.length.toLocaleString()} / {MAX.toLocaleString()}</span>
            </div>
            <Textarea
              id="uat-reqs"
              value={requirements}
              onChange={e => setRequirements(e.target.value)}
              placeholder="List your functional and non-functional requirements..."
              rows={5}
              required
              maxLength={MAX}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="uat-stories" className="form-label">User Stories <span className="text-[--text-3] normal-case tracking-normal font-normal">(optional but recommended)</span></Label>
              <span className="text-[10px] font-mono text-[--text-3]">{userStories.length.toLocaleString()} / {MAX.toLocaleString()}</span>
            </div>
            <Textarea
              id="uat-stories"
              value={userStories}
              onChange={e => setUserStories(e.target.value)}
              placeholder="Paste user stories to generate more targeted test cases..."
              rows={4}
              maxLength={MAX}
            />
          </div>
          {checklist.error && <p className="form-error">{checklist.error}</p>}
          <Button type="submit" disabled={checklist.isLoading}>
            {checklist.isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {checklist.isLoading ? 'Generating Checklist…' : 'Generate UAT Checklist'}
          </Button>
        </form>
      </div>

      {/* Loading skeleton */}
      {checklist.isLoading && (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      )}

      {/* Checklist output */}
      {checklist.data && !checklist.isLoading && (
        <div className="mt-6">
          {/* Progress bar */}
          <div className="form-card mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="page-eyebrow">Test Completion</span>
              <span className="text-xs font-mono text-[--text-2]">
                {checkedIds.size} / {total} passed
              </span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Toolbar */}
          <div className="result-bar">
            <span className="result-title-text">{total} Test Cases</span>
            <button type="button" onClick={handleExportCSV} className="result-btn ml-auto">
              Export CSV
            </button>
            <button type="button" onClick={clearChecklist} className="result-btn">
              Clear
            </button>
          </div>

          {/* Grouped test cases */}
          <div className="border border-[--bdr-0] border-t-0">
            {Array.from(grouped.entries()).map(([category, tests]) => (
              <div key={category}>
                <p className="page-eyebrow px-4 py-2 border-b border-[--bdr-0] bg-[--surf-1] flex items-center justify-between">
                  <span>{category}</span>
                  <span className="text-[10px] text-[--text-3]">{tests.length}</span>
                </p>
                {tests.map(tc => (
                  <TestCaseCard
                    key={tc.test_id}
                    tc={tc}
                    checked={checkedIds.has(tc.test_id)}
                    onToggle={() => toggleChecked(tc.test_id)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
