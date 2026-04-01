'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const FEATURE_LIST = [
  'Business Requirements Documents',
  'Requirements Elicitation',
  'User Stories & Acceptance Criteria',
  'Process Map Analysis',
  'UAT Checklists',
]

export function AuthForm() {
  const router = useRouter()
  const { login, register, isLoading } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register(email, username, password, fullName || undefined)
      await login(email, password)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex bg-void">

      {/* ── Left decorative panel ─────────────────────────── */}
      <div className="auth-left-panel hidden lg:flex flex-col justify-between w-[48%] relative overflow-hidden p-12">
        <div className="auth-ambient-top" />
        <div className="auth-ambient-bottom" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="auth-logo-mark">
            <div className="auth-logo-fill" />
          </div>
          <span className="auth-logo-text">Meridian</span>
        </div>

        {/* Editorial hero */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="dash-eyebrow mb-4">Intelligence Platform</p>
            <h1 className="auth-display-heading">
              Business<br />
              <em>analysis,</em><br />
              elevated.
            </h1>
          </div>

          <div className="m-rule w-48" />

          <ul className="space-y-3">
            {FEATURE_LIST.map((feature, i) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="m-idx w-6 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-ink-secondary">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Version */}
        <div className="relative z-10">
          <p className="auth-version-tag">v0.1.0 — Powered by Google Gemini</p>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">

        {/* Mobile logo */}
        <div className="lg:hidden mb-12 text-center">
          <p className="auth-logo-text mb-2">Meridian</p>
          <h1 className="auth-display-heading text-3xl">BA Intelligence Platform</h1>
        </div>

        <div className="w-full max-w-[380px] anim-rise">
          <div className="mb-8">
            <p className="dash-eyebrow mb-2">
              {mode === 'login' ? 'Authentication' : 'New Account'}
            </p>
            <h2 className="auth-form-heading">
              {mode === 'login' ? 'Welcome back.' : 'Get started.'}
            </h2>
          </div>

          <div className="m-rule mb-8" />

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="auth-label" htmlFor="login-email">Email</label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="analyst@firm.com"
                  required
                />
              </div>
              <div>
                <label className="auth-label" htmlFor="login-password">Password</label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <Button type="submit" className="w-full h-10" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-void border-t-transparent animate-spin" />
                    Authenticating…
                  </span>
                ) : 'Sign In →'}
              </Button>

              <p className="auth-footer-text">
                No account?{' '}
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => { setMode('register'); setError('') }}
                >
                  Create account
                </button>
              </p>
            </form>

          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="auth-label" htmlFor="reg-email">Email</label>
                <Input id="reg-email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="analyst@firm.com" required />
              </div>
              <div>
                <label className="auth-label" htmlFor="reg-username">Username</label>
                <Input id="reg-username" type="text" value={username}
                  onChange={e => setUsername(e.target.value)} placeholder="jsmith" required />
              </div>
              <div>
                <label className="auth-label" htmlFor="reg-fullname">
                  Full Name
                  <span className="auth-label-optional">optional</span>
                </label>
                <Input id="reg-fullname" type="text" value={fullName}
                  onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" />
              </div>
              <div>
                <label className="auth-label" htmlFor="reg-password">Password</label>
                <Input id="reg-password" type="password" value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <Button type="submit" className="w-full h-10" disabled={isLoading}>
                {isLoading ? 'Creating account…' : 'Create Account →'}
              </Button>

              <p className="auth-footer-text">
                Already registered?{' '}
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => { setMode('login'); setError('') }}
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
