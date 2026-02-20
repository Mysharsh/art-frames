import { Suspense } from "react"
import { AppShell } from "@/components/app-shell"
import { Homepage } from "@/components/homepage"

export default function Page() {
  return (
    <AppShell>
      <Suspense>
        <Homepage />
      </Suspense>
    </AppShell>
  )
}
