import * as React from 'react'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

interface FieldProps {
  /** Must match the control's `id`; label, hint and error are wired to it. */
  id: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
  className?: string
  /** A single form control (Input, Textarea, select…). */
  children: React.ReactElement<{
    id?: string
    'aria-invalid'?: boolean
    'aria-describedby'?: string
  }>
}

/**
 * Label + control + hint/error, with the accessibility wiring done once:
 * `htmlFor`, `aria-invalid` and `aria-describedby` on the child control.
 */
export function Field({ id, label, hint, error, optional, className, children }: FieldProps) {
  // The hint is replaced by the error, so only reference what is rendered.
  const hintId = hint && !error ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id} className="text-xs font-semibold text-foreground">
        {label}
        {optional ? <span className="ml-1 font-normal text-muted-foreground">(optional)</span> : null}
      </Label>
      {React.cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}
      {hintId ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
