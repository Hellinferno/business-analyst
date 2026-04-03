'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Copy, Check, Download, X } from 'lucide-react'

interface ResultDisplayProps {
  title?: string
  content: string
  onClear?: () => void
}

export function ResultDisplay({ title = 'Result', content, onClear }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false)

  const wordCount = content.split(/\s+/).filter(Boolean).length

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `meridian-${title.toLowerCase().replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-6">
      {/* Toolbar */}
      <div className="result-bar">
        <span className="result-title-text">{title}</span>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[10px] font-mono text-[--text-3] mr-2">
            {wordCount.toLocaleString()} words
          </span>
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
            className="result-btn result-btn-copy"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            title="Download as text file"
            className="result-btn"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              title="Clear result"
              className="result-btn"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="terminal max-h-[560px] overflow-y-auto">
        <div className="md-prose">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
