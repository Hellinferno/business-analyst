'use client'

import { useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ResultDisplay } from './ResultDisplay'
import { useDocuments } from '@/hooks/useDocuments'

const MAX = 10000
const POINTS_OPTIONS = [1, 2, 3, 5, 8, 13, 21]

interface ParsedStory {
  title: string
  story: string
  acceptance_criteria: string[]
}

function StoryCard({ story, index }: { story: ParsedStory; index: number }) {
  const [points, setPoints] = useState<number>(3)

  return (
    <div className="form-card mb-3">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="m-idx text-[10px]">{String(index + 1).padStart(2, '0')}</span>
          <h3 className="text-sm font-semibold text-[--text-1]">{story.title}</h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-mono text-[--text-3] uppercase tracking-wider">pts</span>
          <select
            value={points}
            onChange={e => setPoints(Number(e.target.value))}
            aria-label={`Story points for ${story.title}`}
            className="text-xs font-mono bg-[--surf-2] border border-[--bdr-0] text-[--lime] px-1.5 py-0.5 cursor-pointer focus:outline-none focus:border-[--lime]"
          >
            {POINTS_OPTIONS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm italic text-[--text-3] mb-3 pl-6">
        &ldquo;{story.story}&rdquo;
      </p>

      {story.acceptance_criteria?.length > 0 && (
        <ul className="space-y-1 pl-6">
          {story.acceptance_criteria.map((ac, i) => (
            <li key={i} className="flex gap-2 text-[13px] text-[--text-2]">
              <span className="text-[--lime-dim] font-mono text-xs mt-0.5 shrink-0">✓</span>
              <span>{ac}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function UserStoriesPanel() {
  const { generated, generateUserStories, generateAcceptanceCriteria, clearGenerated } = useDocuments()
  const [mode,           setMode]           = useState<'stories' | 'criteria'>('stories')
  const [projectName,    setProjectName]    = useState('')
  const [requirements,   setRequirements]   = useState('')
  const [userPersonas,   setUserPersonas]   = useState('')
  const [userStoriesText, setUserStoriesText] = useState('')

  const handleGenerateStories = async (e: React.FormEvent) => {
    e.preventDefault()
    await generateUserStories({ project_name: projectName, requirements, user_personas: userPersonas || undefined })
  }

  const handleGenerateCriteria = async (e: React.FormEvent) => {
    e.preventDefault()
    await generateAcceptanceCriteria(userStoriesText)
  }

  const parsedStories = useMemo<ParsedStory[] | null>(() => {
    if (!generated.data?.content || mode !== 'stories') return null
    try {
      const parsed = JSON.parse(generated.data.content)
      if (Array.isArray(parsed)) return parsed as ParsedStory[]
    } catch {}
    return null
  }, [generated.data?.content, mode])

  return (
    <div>
      {/* Header */}
      <p className="page-eyebrow anim-rise">Agile Artifacts</p>
      <h1 className="page-title anim-rise d1">User Stories</h1>
      <p className="page-subtitle anim-rise d2">
        Generate Agile user stories and Given-When-Then acceptance criteria from your requirements.
      </p>

      <div className="mt-8 anim-rise d3">
        <Tabs value={mode} onValueChange={v => { setMode(v as typeof mode); clearGenerated() }}>
          <TabsList>
            <TabsTrigger value="stories">01 — User Stories</TabsTrigger>
            <TabsTrigger value="criteria">02 — Acceptance Criteria</TabsTrigger>
          </TabsList>

          {/* User Stories form */}
          <TabsContent value="stories">
            <div className="form-card mt-0 border-t-0">
              <form onSubmit={handleGenerateStories} className="space-y-5">
                <div>
                  <Label className="form-label mb-1.5 block">Project Name *</Label>
                  <Input
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="e.g. Mobile Banking App"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="form-label">Requirements *</Label>
                    <span className="text-[10px] font-mono tabular-nums text-[--text-3]">{requirements.length.toLocaleString()} / {MAX.toLocaleString()}</span>
                  </div>
                  <Textarea
                    value={requirements}
                    onChange={e => setRequirements(e.target.value)}
                    placeholder="List requirements, one per line..."
                    rows={5}
                    required
                    maxLength={MAX}
                  />
                </div>
                <div>
                  <Label className="form-label mb-1.5 block">User Personas <span className="text-[--text-3] normal-case tracking-normal font-normal">(optional)</span></Label>
                  <Input
                    value={userPersonas}
                    onChange={e => setUserPersonas(e.target.value)}
                    placeholder="e.g. Customer, Administrator, Support Agent"
                  />
                </div>
                {generated.error && <p className="form-error">{generated.error}</p>}
                <Button type="submit" disabled={generated.isLoading}>
                  {generated.isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {generated.isLoading ? 'Generating…' : 'Generate User Stories'}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Acceptance Criteria form */}
          <TabsContent value="criteria">
            <div className="form-card mt-0 border-t-0">
              <form onSubmit={handleGenerateCriteria} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="form-label">User Stories *</Label>
                    <span className="text-[10px] font-mono tabular-nums text-[--text-3]">{userStoriesText.length.toLocaleString()} / {MAX.toLocaleString()}</span>
                  </div>
                  <Textarea
                    value={userStoriesText}
                    onChange={e => setUserStoriesText(e.target.value)}
                    placeholder="Paste your user stories here..."
                    rows={8}
                    required
                    maxLength={MAX}
                  />
                </div>
                {generated.error && <p className="form-error">{generated.error}</p>}
                <Button type="submit" disabled={generated.isLoading}>
                  {generated.isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {generated.isLoading ? 'Generating…' : 'Generate Acceptance Criteria'}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Loading skeleton */}
      {generated.isLoading && (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      )}

      {/* Output — story cards or fallback ResultDisplay */}
      {generated.data && !generated.isLoading && (
        <>
          {parsedStories ? (
            <div className="mt-6">
              <div className="result-bar mb-0">
                <span className="result-title-text">
                  {parsedStories.length} User {parsedStories.length === 1 ? 'Story' : 'Stories'} Generated
                </span>
              </div>
              <div className="border border-[--bdr-0] border-t-0 p-4 space-y-0">
                {parsedStories.map((story, i) => (
                  <StoryCard key={i} story={story} index={i} />
                ))}
              </div>
            </div>
          ) : (
            <ResultDisplay
              title={mode === 'stories' ? 'Generated User Stories' : 'Acceptance Criteria'}
              content={generated.data.content}
              onClear={clearGenerated}
            />
          )}
        </>
      )}
    </div>
  )
}
