import { Skeleton } from "@/components/ui/skeleton"

export default function ProductLoading() {
    return (
        <main className="min-h-screen bg-white py-8 sm:py-12">
            <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="aspect-square rounded-lg" />
                        <div className="grid grid-cols-4 gap-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="aspect-square rounded" />
                            ))}
                        </div>
                    </div>

                    {/* Details Skeleton */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                        </div>

                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-6 w-1/3" />
                        </div>

                        <div className="space-y-3">
                            <Skeleton className="h-4 w-1/4" />
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>

                        <div className="space-y-3 pt-4">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            <Skeleton className="h-4 w-1/4" />
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-4 w-full" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
