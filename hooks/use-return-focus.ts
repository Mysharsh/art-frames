import { useCallback, useRef } from "react"

/**
 * Focus return for Radix dialogs that are opened from app state instead of a
 * Radix `Trigger` (Radix only restores focus to its own trigger). Spread the
 * result onto DialogContent / SheetContent.
 *
 * `onOpenAutoFocus` fires before focus moves into the dialog, so the opener is
 * still `document.activeElement` there.
 */
export function useReturnFocus() {
  const openerRef = useRef<HTMLElement | null>(null)

  const onOpenAutoFocus = useCallback(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }, [])

  const onCloseAutoFocus = useCallback((event: Event) => {
    const opener = openerRef.current
    if (opener && opener.isConnected) {
      event.preventDefault()
      opener.focus()
    }
    openerRef.current = null
  }, [])

  return { onOpenAutoFocus, onCloseAutoFocus }
}
