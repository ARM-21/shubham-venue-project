import React from 'react'

export default function SkeletonLoading() {
  return (
    <main className="max-w-4xl mx-auto p-6">
        <div className="space-y-4">
          <div className="w-full h-64 bg-gray-200 rounded animate-pulse" />
          <div className="p-6 bg-white rounded shadow">
            <div className="h-6 bg-gray-200 rounded w-3/5 mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-4/5 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/5 mb-6 animate-pulse" />

            <div className="space-y-3">
              <div className="h-12 bg-gray-100 rounded animate-pulse" />
              <div className="h-12 bg-gray-100 rounded animate-pulse" />
              <div className="h-12 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </main>
  )
}
