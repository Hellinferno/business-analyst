'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { FileText, Search, BookOpen, GitBranch, CheckSquare, Clock, ArrowRight } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { useDocuments } from '@/hooks/useDocuments'
import { Skeleton } from '@/components/ui/skeleton'

const FEATURES = [
  {
    href: '/dashboard/documents',
    icon: FileText,
    num: '01',
    title: 'BRD Generator',
    description: 'Auto-generate comprehensive Business Requirements Documents with AI-structured sections.',
  },
  {
    href: '/dashboard/elicitation',
    icon: Search,
    num: '02',
    title: 'Requirements Elicitation',
    description: 'Generate stakeholder interview questions, define scope, and detect ambiguities.',
  },
  {
    href: '/dashboard/user-stories',
    icon: BookOpen,
    num: '03',
    title: 'User Stories',
    description: 'Generate Agile user stories and Given-When-Then acceptance criteria.',
  },
  {
    href: '/dashboard/process-maps',
    icon: GitBranch,
    num: '04',
    title: 'Process Map Analysis',
    description: 'Analyse As-Is processes to identify inefficiencies and model To-Be flows.',
  },
  {
    href: '/dashboard/uat',
    icon: CheckSquare,
    num: '05',
    title: 'UAT Checklist',
    description: 'Generate comprehensive User Acceptance Testing checklists and test cases.',
  },
]

export default function DashboardPage() {
  const { list, fetchDocuments } = useDocuments()

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const recentDocs = list.data?.documents?.slice(0, 5) ?? []

  return (
    <div>
      {/* Header */}
      <div className="mb-12">
        <p className="dash-eyebrow anim-rise">Meridian — BA Intelligence Platform</p>
        <h1 className="dash-headline anim-rise d1">
          AI-powered<br />business analysis.
        </h1>
        <p className="dash-subtitle anim-rise d2">
          Select a tool to get started. Each feature is powered by Gemini AI and your project context.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[--bdr-0] border border-[--bdr-0]">
        {FEATURES.map((feature, i) => (
          <Link
            key={feature.href}
            href={feature.href}
            className={cn('dash-card f-card anim-rise', `d${i + 1}`)}
          >
            <div className="f-scan" aria-hidden="true" />
            <p className="dash-card-num m-idx">{feature.num}</p>
            <feature.icon className="w-4 h-4 text-[--lime-dim] mb-4" aria-hidden="true" />
            <h2 className="dash-card-title">{feature.title}</h2>
            <p className="dash-card-desc">{feature.description}</p>
            <span className="dash-card-arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>

      {/* Recent documents */}
      <div className="mt-12 anim-rise d6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-[--lime-dim]" />
          <p className="page-eyebrow">Recent Documents</p>
        </div>

        {list.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : recentDocs.length > 0 ? (
          <div className="border border-[--bdr-0]">
            {recentDocs.map((doc, i) => (
              <Link
                key={doc.id}
                href={`/dashboard/documents`}
                className="flex items-center justify-between px-4 py-3 border-b border-[--bdr-0] last:border-b-0 hover:bg-[--surf-1] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[--lime-dim] shrink-0" />
                  <div>
                    <p className="text-sm text-[--text-1] group-hover:text-[--lime] transition-colors">
                      {doc.title}
                    </p>
                    <p className="text-xs text-[--text-3] font-mono">
                      {doc.document_type?.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[--text-3] font-mono">
                    {formatDate(doc.created_at)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[--text-3] group-hover:text-[--lime] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-[--bdr-0] p-8 text-center">
            <FileText className="w-8 h-8 text-[--text-3] mx-auto mb-3" />
            <p className="text-sm text-[--text-2] mb-1">No documents yet</p>
            <p className="text-xs text-[--text-3]">
              Generate your first BRD, user story, or checklist to see it here.
            </p>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-8 anim-rise d7">
        <div className="flex items-center gap-4 text-xs text-[--text-3] font-mono">
          <span>Shortcuts:</span>
          <kbd className="px-1.5 py-0.5 bg-[--surf-2] border border-[--bdr-0] text-[--text-2]">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-[--surf-2] border border-[--bdr-0] text-[--text-2]">
            Enter
          </kbd>
          <span>to submit forms</span>
        </div>
      </div>
    </div>
  )
}
