export default function Loading() {
    return (
        <div className="container mx-auto p-6 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/3 mb-8"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="h-12 bg-muted rounded mb-6"></div>
                    <div className="h-[400px] bg-muted rounded"></div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <div className="h-[300px] bg-muted rounded"></div>
                    <div className="h-[200px] bg-muted rounded"></div>
                </div>
            </div>
        </div>
    )
}