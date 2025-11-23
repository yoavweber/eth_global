interface EmptyStateProps {
  message: string
  submessage?: string
}

export function EmptyState({ message, submessage }: EmptyStateProps) {
  return (
    <div className="bg-card/10 border border-primary/20 rounded-lg p-8 text-center">
      <p className="text-muted-foreground font-mono">{message}</p>
      {submessage && (
        <p className="text-muted-foreground font-mono text-sm mt-2">
          {submessage}
        </p>
      )}
    </div>
  )
}
