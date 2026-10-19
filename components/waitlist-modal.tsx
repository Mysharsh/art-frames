"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useReturnFocus } from "@/hooks/use-return-focus"

export function WaitlistModal() {
  const {
    isWaitlistModalOpen,
    selectedProductId,
    selectedProductTitle,
    closeWaitlistModal,
    incrementWaitlistCount,
    addWaitlistItem,
  } = useAppStore()

  const returnFocus = useReturnFocus()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !selectedProductId) return

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          productId: selectedProductId,
          productTitle: selectedProductTitle,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Something went wrong")
      }

      incrementWaitlistCount()
      addWaitlistItem({
        productId: selectedProductId,
        productTitle: selectedProductTitle || "",
        email,
      })
      setIsSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join waitlist")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setEmail("")
    setIsSuccess(false)
    setError("")
    closeWaitlistModal()
  }

  // Radix Dialog provides role="dialog", aria-modal, focus trap, Escape to close,
  // scroll lock and focus return to the "Notify Me" button.
  return (
    <Dialog open={isWaitlistModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        {...returnFocus}
        closeLabel="Close modal"
        className="bottom-0 top-auto max-w-md translate-y-0 rounded-t-2xl sm:bottom-auto sm:top-[50%] sm:translate-y-[-50%]"
      >
        {isSuccess ? (
          <div className="flex flex-col items-center py-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary-ink" aria-hidden="true" />
            <DialogTitle className="mt-4 font-display text-xl font-bold text-foreground">
              {"You're on the list!"}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-muted-foreground">
              {"We'll notify you at "}
              <span className="text-primary-ink">{email}</span>
              {" when "}
              <span className="font-medium text-foreground">{selectedProductTitle}</span>
              {" launches."}
            </DialogDescription>
            <Button size="pill" className="mt-6" onClick={handleClose}>
              Continue Browsing
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-1 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-ink">
              Coming Soon
            </div>
            <DialogTitle className="mt-2 font-display text-xl font-bold text-foreground">
              Join the Waitlist
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              {"Be the first to know when "}
              <span className="font-medium text-foreground">{selectedProductTitle}</span>
              {" is available."}
            </DialogDescription>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
              <Field id="waitlist-email" label="Email address" error={error || undefined}>
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
              <Button type="submit" size="block" className="h-12" disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    Joining…
                  </>
                ) : (
                  "Join Waitlist for Launch"
                )}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
