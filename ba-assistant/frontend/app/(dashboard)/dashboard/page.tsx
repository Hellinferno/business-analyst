import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const FEATURES = [
  {
    href: '/dashboard/documents',
    title: 'BRD Generator',
    description: 'Auto-generate comprehensive Business Requirements Documents with AI.',
    icon: '📄',
  },
  {
    href: '/dashboard/elicitation',
    title: 'Requirements Elicitation',
    description: 'Generate stakeholder interview questions, define scope, and detect ambiguities.',
    icon: '🔍',
  },
  {
    href: '/dashboard/user-stories',
    title: 'User Stories',
    description: 'Generate Agile user stories and Given-When-Then acceptance criteria.',
    icon: '📝',
  },
  {
    href: '/dashboard/process-maps',
    title: 'Process Map Analysis',
    description: 'Analyse As-Is processes to identify inefficiencies and model To-Be flows.',
    icon: '🔄',
  },
  {
    href: '/dashboard/uat',
    title: 'UAT Checklist',
    description: 'Generate comprehensive User Acceptance Testing checklists.',
    icon: '✅',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome to BA Assistant</h1>
        <p className="text-gray-500 mt-2">
          AI-powered tools to accelerate your business analysis work. Select a feature to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(feature => (
          <Link key={feature.href} href={feature.href}>
            <Card className="h-full cursor-pointer hover:shadow-md hover:border-blue-200 transition-all">
              <CardHeader>
                <div className="text-3xl mb-2">{feature.icon}</div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
