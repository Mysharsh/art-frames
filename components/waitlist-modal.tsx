"use client"

import { useState } from "react"
import { X, CheckCircle2, Loader2 } from "lucide-react"
import { useAppStore } from "@/lib/store"

export function WaitlistModal() {
  const {
    isWaitlistModalOpen,
    selectedProductId,
    selectedProductTitle,
    closeWaitlistModal,
    incrementWaitlistCount,
    addWaitlistItem,
  } = useAppStore()

  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  if (!isWaitlistModalOpen) return null

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

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md rounded-t-2xl border border-border bg-card p-6 sm:rounded-2xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center py-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <h3 className="mt-4 font-display text-xl font-bold text-foreground">
              {"You're on the list!"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {"We'll notify you at "}
              <span className="text-primary">{email}</span>
              {" when "}
              <span className="font-medium text-foreground">
                {selectedProductTitle}
              </span>
              {" launches."}
            </p>
            <button
              onClick={handleClose}
              className="mt-6 rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
            >
              Continue Browsing
            </button>
          </div>
        ) : (
          <>
            <div className="mb-1 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Coming Soon
            </div>
            <h3 className="mt-2 font-display text-xl font-bold text-foreground">
              Join the Waitlist
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {"Be the first to know when "}
              <span className="font-medium text-foreground">
                {selectedProductTitle}
              </span>
              {" is available."}
            </p>

            <form onSubmit={handleSubmit} className="mt-5">
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {error && (
                <p className="mt-2 text-xs text-destructive">{error}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3 flex w-full items-center justify-center rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Join Waitlist for Launch"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
