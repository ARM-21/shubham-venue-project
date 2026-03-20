import React from 'react'

export default function FilterSkeleton() {
    return (
        <div className="flex flex-wrap gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
        </div>
    )
}
