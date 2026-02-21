import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Skeleton */}
            <div className="h-96 bg-muted animate-pulse mb-12" />

            {/* Featured Section Skeleton */}
            <div className="px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <Skeleton className="h-8 w-48 mb-8" />
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="aspect-video rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Additional sections */}
            <div className="px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <Skeleton className="h-8 w-48 mb-8" />
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="aspect-video rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
