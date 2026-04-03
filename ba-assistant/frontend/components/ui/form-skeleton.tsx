import { Skeleton } from '@/components/ui/skeleton'

export function FormSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="mt-6 space-y-3 anim-fade">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" style={{ width: `${100 - i * 12}%` }} />
      ))}
      <Skeleton className="h-24 w-full mt-4" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}
