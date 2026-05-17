"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { useQueryBlogsPublic } from "@queries/customer/blogs-public";
import { decodeHtmlSimple } from "utils/htmlDecoder";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleHandle = params.articleHandle;

  // Fetch all articles from the news blog
  const { data: blogsData = {}, isLoading, isError } = useQueryBlogsPublic(
    { blogHandle: 'news', first: 100 }
  );

  const articles = blogsData?.blogs || [];
  
  // Find the current article
  const article = articles.find(a => a.handle === articleHandle);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#fdfaf6]">
        <div className="bg-gradient-to-br from-[#3a1224] to-[#3a1224]/90 text-white py-12 sm:py-16 lg:py-20">
          <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-4xl">
            <div className="h-16 w-96 bg-white/10 rounded-lg animate-pulse mb-4"></div>
            <div className="h-8 w-64 bg-white/10 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-[#fdfaf6]">
        <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-4xl py-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#C0A04C] hover:text-[#C0A04C]/80 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-900">Article Not Found</h2>
            <p className="text-red-700 mt-2">The article you're looking for doesn't exist.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fdfaf6]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#3a1224] to-[#3a1224]/90 text-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-4xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#C0A04C] hover:text-[#C0A04C]/80 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </button>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black mb-6 leading-tight">
            {article.title}
          </h1>
          
          {/* Meta Info */}
          <div className="flex flex-wrap gap-6 text-white/80">
            {article.publishedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{article.publishedAt}</span>
              </div>
            )}
            {article.author && (
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{article.author.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {article.image && (
        <div className="relative w-full h-96 sm:h-[500px] lg:h-[600px] overflow-hidden">
          <Image
            src={article.image.url}
            alt={article.image.altText || article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-4xl py-12 lg:py-16">
        {/* Excerpt - Plain text summary */}
        {article.excerpt && (
          <p className="text-lg text-gray-700 font-light mb-8 pb-8 border-b border-gray-200">
            {article.excerpt}
          </p>
        )}

        {/* Article Body - Full HTML content */}
        <div
          className="text-gray-800 leading-relaxed space-y-6 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-3 [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:text-gray-800 [&_h4]:mt-4 [&_h4]:mb-2 [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-gray-700 [&_strong]:font-bold [&_strong]:text-gray-900 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_blockquote]:border-l-4 [&_blockquote]:border-[#C0A04C] [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_a]:text-[#C0A04C] [&_a]:hover:text-[#C0A04C]/80 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: decodeHtmlSimple(article.contentHtml) }}
        />

        {/* Author Info Card */}
        {article.author && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-br from-[#3a1224]/10 to-[#C0A04C]/10 rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">About the Author</h3>
              <p className="text-gray-700">{article.author.name}</p>
              {article.author.email && (
                <p className="text-gray-600 text-sm mt-2">{article.author.email}</p>
              )}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {articles.length > 1 && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">More Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles
                .filter(a => a.handle !== articleHandle)
                .slice(0, 3)
                .map((relatedArticle) => (
                  <button
                    key={relatedArticle.handle}
                    onClick={() => router.push(`/blogs/${relatedArticle.handle}`)}
                    className="group text-left bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#C0A04C]/30"
                  >
                    {relatedArticle.image && (
                      <div className="aspect-video overflow-hidden bg-gray-200 relative">
                        <Image
                          src={relatedArticle.image.url}
                          alt={relatedArticle.image.altText || relatedArticle.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 group-hover:text-[#C0A04C] transition-colors line-clamp-2 mb-2">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedArticle.excerpt}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
