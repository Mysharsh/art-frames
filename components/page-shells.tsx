import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { siteContent } from "@/lib/site-content"
import { cn } from "@/lib/utils/helpers"

interface PageIntroProps {
  eyebrow?: string
  title: string
  description?: string
  align?: "left" | "center"
  className?: string
}

interface ContentPageShellProps {
  backHref?: string
  backLabel?: string
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
  className?: string
  headerAside?: ReactNode
}

interface AuthPageShellProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  sideTitle: string
  sideDescription: string
  bullets: string[]
  footer?: ReactNode
}

interface StatePageShellProps {
  eyebrow?: string
  title: string
  description: string
  children?: ReactNode
}

export function PageFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[32px] border border-border/70 bg-card/85 shadow-[0_24px_80px_rgba(22,13,7,0.12)] backdrop-blur-sm",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.18),transparent_35%),radial-gradient(circle_at_15%_15%,hsl(var(--foreground)/0.06),transparent_28%)]" />
      <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-foreground/5 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  )
}

export function PageIntro({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: PageIntroProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
      <h1 className="mt-3 font-display text-4xl leading-[0.92] text-foreground sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}

export function ContentPageShell({
  backHref = "/",
  backLabel = "Back to home",
  eyebrow,
  title,
  description,
  children,
  className,
  headerAside,
}: ContentPageShellProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <PageFrame className={cn("p-6 sm:p-8", className)}>
        <div className="space-y-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/75 transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <PageIntro eyebrow={eyebrow} title={title} description={description} className="max-w-2xl" />
            {headerAside ? <div className="lg:max-w-sm">{headerAside}</div> : null}
          </div>

          {children}
        </div>
      </PageFrame>
    </div>
  )
}

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  sideTitle,
  sideDescription,
  bullets,
  footer,
}: AuthPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_32%),radial-gradient(circle_at_bottom_right,hsl(var(--foreground)/0.08),transparent_28%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <PageFrame className="p-6 sm:p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            {siteContent.brand.name}
          </Link>
          <div className="mt-12 space-y-6">
            <p className="section-kicker">{eyebrow}</p>
            <div>
              <h1 className="font-display text-5xl leading-[0.92] text-foreground sm:text-6xl">
                {sideTitle}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
                {sideDescription}
              </p>
            </div>
            <div className="grid gap-3">
              {bullets.map((bullet) => (
                <div key={bullet} className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground/85">
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        </PageFrame>

        <PageFrame className="p-6 sm:p-8">
          <PageIntro eyebrow={eyebrow} title={title} description={description} />
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-8">{footer}</div> : null}
        </PageFrame>
      </div>
    </main>
  )
}

export function StatePageShell({ eyebrow, title, description, children }: StatePageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_30%),radial-gradient(circle_at_bottom_right,hsl(var(--foreground)/0.08),transparent_26%)]" />
      <div className="relative mx-auto max-w-3xl">
        <PageFrame className="px-6 py-10 text-center sm:px-10 sm:py-14">
          {eyebrow ? <p className="section-kicker justify-center">{eyebrow}</p> : null}
          <h1 className="mt-4 font-display text-4xl leading-[0.92] text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            {description}
          </p>
          {children ? <div className="mt-8">{children}</div> : null}
        </PageFrame>
      </div>
    </main>
  )
}
