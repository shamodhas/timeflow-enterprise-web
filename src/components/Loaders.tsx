export const Spinner = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    className={`animate-spin ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-90"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
)

export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`skeleton rounded-md ${className}`} />
)

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div
    role="status"
    aria-label="Loading"
    className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900"
  >
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex items-center gap-3 p-4">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
        <Skeleton className="hidden h-6 w-20 sm:block" />
      </div>
    ))}
  </div>
)

export const PageLoader = ({
  fullScreen = false
}: {
  label?: string
  fullScreen?: boolean
}) => (
  <div
    role="status"
    aria-label="Loading"
    className={`mx-auto w-full max-w-5xl space-y-5 p-4 sm:p-6 ${
      fullScreen ? "min-h-screen bg-slate-100/60 dark:bg-slate-950" : ""
    }`}
  >
    <div className="space-y-2">
      <Skeleton className="h-7 w-1/2 sm:w-1/3" />
      <Skeleton className="h-3.5 w-3/4 sm:w-1/2" />
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-7 w-1/3" />
        </div>
      ))}
    </div>
    <TableSkeleton rows={4} />
  </div>
)
