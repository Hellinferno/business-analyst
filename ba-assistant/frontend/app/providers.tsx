'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--surf-0)',
            border: '1px solid var(--bdr-0)',
            color: 'var(--text-1)',
            fontFamily: 'var(--font-ui)',
          },
        }}
      />
    </QueryClientProvider>
  )
}
