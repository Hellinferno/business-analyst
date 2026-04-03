'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, FileText, Search, BookOpen,
  GitBranch, CheckSquare, LogOut, Menu, X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const NAV_ITEMS = [
  { href: '/dashboard',              icon: LayoutDashboard, label: 'Dashboard',     num: '00' },
  { href: '/dashboard/documents',    icon: FileText,        label: 'BRD Generator', num: '01' },
  { href: '/dashboard/elicitation',  icon: Search,          label: 'Elicitation',   num: '02' },
  { href: '/dashboard/user-stories', icon: BookOpen,        label: 'User Stories',  num: '03' },
  { href: '/dashboard/process-maps', icon: GitBranch,       label: 'Process Maps',  num: '04' },
  { href: '/dashboard/uat',          icon: CheckSquare,     label: 'UAT Checklist', num: '05' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading, logout, user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[--void]">
        <aside className="w-[220px] shrink-0 border-r border-[--bdr-0] p-4 flex flex-col gap-2">
          <Skeleton className="h-8 w-32 mb-6" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </aside>
        <main className="flex-1 p-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    )
  }

  if (!isAuthenticated) return null

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname.startsWith(href)

  const currentPage = NAV_ITEMS.find(item => isActive(item.href))

  return (
    <div className="flex h-screen bg-[--void] overflow-hidden">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50 md:z-auto',
          'w-[220px] shrink-0 flex flex-col bg-[--void] border-r border-[--bdr-0]',
          'transition-transform duration-200 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-[--bdr-0]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="auth-logo-mark shrink-0">
              <div className="auth-logo-fill" />
            </div>
            <div>
              <p className="nav-logo-label">Meridian</p>
              <p className="nav-logo-sub">BA Intelligence</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn('nav-link', active && 'active')}
              >
                <span className="m-idx text-[10px] mr-2 hidden sm:inline">{item.num}</span>
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-[--bdr-0]">
          {user && (
            <p className="text-[11px] text-[--text-3] font-mono px-2 mb-2 truncate">
              {user.email}
            </p>
          )}
          <button type="button" onClick={handleLogout} className="nav-signout w-full">
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-xs">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="shrink-0 h-12 flex items-center gap-3 px-6 border-b border-[--bdr-0] bg-[--void]">
          <button
            type="button"
            aria-label="Open navigation"
            className="md:hidden text-[--text-3] hover:text-[--text-1] transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs text-[--text-3] font-mono">
            <span>meridian</span>
            {currentPage && (
              <>
                <span className="text-[--bdr-1]">/</span>
                <span className="text-[--text-2]">{currentPage.label.toLowerCase().replace(/ /g, '-')}</span>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
