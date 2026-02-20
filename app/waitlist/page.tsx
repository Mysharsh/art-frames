import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"
import { WaitlistPageContent } from "@/components/waitlist-page-content"

export const metadata: Metadata = {
  title: "My Waitlist - ArtFrames",
  description: "View and manage your waitlisted poster art items.",
}

export default function WaitlistPage() {
  return (
    <AppShell>
      <WaitlistPageContent />
    </AppShell>
  )
}
