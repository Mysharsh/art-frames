import { Search, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
            <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
                    <Search className="w-8 h-8 text-muted-foreground" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight mb-2">404</h1>

                <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>

                <p className="text-muted-foreground mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <Link href="/">
                    <Button className="gap-2">
                        <Home className="w-4 h-4" />
                        Back to Home
                    </Button>
                </Link>
            </div>
        </div>
    )
}
