import Link from "next/link"

export function SiteFooter() {
    return (
        <footer className="border-t border-border bg-background/90 px-4 py-8 mt-8">
            <div className="mx-auto max-w-4xl">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-display text-xl tracking-wide text-foreground">
                            Posterwaala
                        </span>
                    </Link>

                    <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                        <Link href="/privacy" className="transition-colors hover:text-foreground">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="transition-colors hover:text-foreground">
                            Terms of Service
                        </Link>
                        <a href="mailto:contact@posterwaala.com" className="transition-colors hover:text-foreground">
                            Contact
                        </a>
                    </nav>
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} Posterwaala. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
