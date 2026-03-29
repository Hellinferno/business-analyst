'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { auth, documents, elicitation, processMaps, uat } from '@/lib/api'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [requirements, setRequirements] = useState('')
  const [processName, setProcessName] = useState('')
  const [processSteps, setProcessSteps] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginError('')
    try {
      await auth.login(email, password)
      setActiveTab('dashboard')
    } catch (err: any) {
      setLoginError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateBRD = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res: any = await documents.generateBRD(projectName, projectDescription, requirements)
      setResult(res.content)
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQuestions = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res: any = await elicitation.generateQuestions(projectName, projectDescription)
      setResult(JSON.stringify(res.questions, null, 2))
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateUserStories = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res: any = await documents.generateUserStories(projectName, requirements)
      setResult(res.content)
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeProcess = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res: any = await processMaps.analyze(processName, processSteps)
      setResult(res.analysis)
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateUAT = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res: any = await uat.generateChecklist(requirements, '')
      setResult(JSON.stringify(res.checklist, null, 2))
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('access_token')

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>BA Assistant</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BA Assistant</h1>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setActiveTab('dashboard')}>Dashboard</Button>
            <Button variant="ghost" onClick={() => auth.logout()}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Welcome to BA Assistant</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('brd')}>
                <CardHeader>
                  <CardTitle>Generate BRD</CardTitle>
                  <CardDescription>Create Business Requirements Document</CardDescription>
                </CardHeader>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('elicitation')}>
                <CardHeader>
                  <CardTitle>Elicitation</CardTitle>
                  <CardDescription>Generate interview questions</CardDescription>
                </CardHeader>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('user-stories')}>
                <CardHeader>
                  <CardTitle>User Stories</CardTitle>
                  <CardDescription>Generate user stories</CardDescription>
                </CardHeader>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('process')}>
                <CardHeader>
                  <CardTitle>Process Maps</CardTitle>
                  <CardDescription>Analyze process flows</CardDescription>
                </CardHeader>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('uat')}>
                <CardHeader>
                  <CardTitle>UAT Checklist</CardTitle>
                  <CardDescription>Generate test cases</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'brd' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Generate BRD</h2>
              <Button variant="ghost" onClick={() => setActiveTab('dashboard')}>Back</Button>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Project Name</Label>
                  <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Enter project name" />
                </div>
                <div>
                  <Label>Project Description</Label>
                  <Textarea value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} placeholder="Describe the project" />
                </div>
                <div>
                  <Label>Requirements</Label>
                  <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="List requirements" />
                </div>
                <Button onClick={handleGenerateBRD} disabled={loading}>
                  {loading ? 'Generating...' : 'Generate BRD'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'elicitation' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Requirements Elicitation</h2>
              <Button variant="ghost" onClick={() => setActiveTab('dashboard')}>Back</Button>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Project Name</Label>
                  <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Enter project name" />
                </div>
                <div>
                  <Label>Project Description</Label>
                  <Textarea value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} placeholder="Describe the project" />
                </div>
                <Button onClick={handleGenerateQuestions} disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Questions'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'user-stories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Generate User Stories</h2>
              <Button variant="ghost" onClick={() => setActiveTab('dashboard')}>Back</Button>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Project Name</Label>
                  <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Enter project name" />
                </div>
                <div>
                  <Label>Requirements</Label>
                  <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="List requirements" />
                </div>
                <Button onClick={handleGenerateUserStories} disabled={loading}>
                  {loading ? 'Generating...' : 'Generate User Stories'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'process' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Process Map Analysis</h2>
              <Button variant="ghost" onClick={() => setActiveTab('dashboard')}>Back</Button>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Process Name</Label>
                  <Input value={processName} onChange={(e) => setProcessName(e.target.value)} placeholder="Enter process name" />
                </div>
                <div>
                  <Label>Process Steps</Label>
                  <Textarea value={processSteps} onChange={(e) => setProcessSteps(e.target.value)} placeholder="Describe each step" />
                </div>
                <Button onClick={handleAnalyzeProcess} disabled={loading}>
                  {loading ? 'Analyzing...' : 'Analyze Process'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'uat' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">UAT Checklist</h2>
              <Button variant="ghost" onClick={() => setActiveTab('dashboard')}>Back</Button>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Requirements</Label>
                  <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="List requirements" />
                </div>
                <Button onClick={handleGenerateUAT} disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Checklist'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded max-h-96 overflow-auto">
                {result}
              </pre>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
