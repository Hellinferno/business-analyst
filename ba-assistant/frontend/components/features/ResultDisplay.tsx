'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ResultDisplayProps {
  title?: string
  content: string
  onClear?: () => void
}

export function ResultDisplay({ title = 'Result', content, onClear }: ResultDisplayProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            Copy
          </Button>
          {onClear && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md max-h-[500px] overflow-auto border">
          {content}
        </pre>
      </CardContent>
    </Card>
  )
}
