"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, AlertCircle } from "lucide-react";
import { useQueryBlogsPublic } from "@queries/customer/blogs-public";

export default function BlogsPage() {
  const { data: blogsData = {}, isLoading, isError, error } = useQueryBlogsPublic(
    { blogHandle: 'news', first: 20 }
  );

  const articles = blogsData?.blogs || [];
  const blogTitle = blogsData?.blogTitle || 'Blog';

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#fdfaf6]">
        <div className="bg-gradient-to-br from-[#3a1224] to-[#3a1224]/90 text-white py-12 sm:py-16 lg:py-20">
          <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
            <div className="h-16 w-96 bg-white/10 rounded-lg animate-pulse mb-4"></div>
            <div className="h-8 w-64 bg-white/10 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse h-80"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fdfaf6]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#3a1224] to-[#3a1224]/90 text-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-[#C0A04C]" />
            <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Insights & Stories</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black mb-4 leading-tight">
            {blogTitle}
          </h1>
          <p className="text-white/80 text-lg font-medium max-w-2xl">
            Discover tips, stories, and insights from our team. Learn everything about event planning, decorations, and creating unforgettable moments.
            {articles.length > 0 && (
              <span className="block mt-2 text-[#C0A04C] font-black text-xl">{articles.length} articles available</span>
            )}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl py-12 lg:py-16">
        {isError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900 mb-2">Failed to Load Articles</h3>
              <p className="text-red-700">{error?.message || "Unable to load articles at this time. Please try again later."}</p>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Articles Available</h2>
            <p className="text-gray-600">Check back soon for stories and insights from our team.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <button
                key={article.handle}
                onClick={() => {
                  window.location.href = `/blogs/${article.handle}`;
                }}
                className="group text-left bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#C0A04C]/30 flex flex-col h-full cursor-pointer"
              >
                {/* Article Image */}
                {article.image ? (
                  <div className="aspect-video overflow-hidden bg-gray-200 relative">
                    <Image
                      src={article.image.url}
                      alt={article.image.altText || article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-[#3a1224] to-[#C0A04C]/20 flex items-center justify-center">
                    <span className="text-white/40 font-bold">No Image</span>
                  </div>
                )}

                {/* Article Content */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Meta Info */}
                  {article.publishedAt && (
                    <div className="text-sm text-gray-600 mb-4">
                      Published: {article.publishedAt}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#C0A04C] transition-colors line-clamp-2 mb-3">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                    {article.excerpt}
                  </p>

                  {/* Read More Link */}
                  <div className="inline-flex text-[#C0A04C] font-semibold group-hover:text-[#C0A04C]/80 transition-colors text-sm">
                    Read More →
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
