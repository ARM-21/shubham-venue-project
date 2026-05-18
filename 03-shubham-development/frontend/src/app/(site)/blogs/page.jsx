"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "config/routes";
import { useQueryBlogsPublic } from "@queries/customer/blogs-public";

const TOPICS = ["Venue Tips", "Weddings", "Parties", "Meetings", "Menus"];

function formatDate(value) {
  if (!value) return "Recent";
  try {
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}

function ArticleThumb({ article }) {
  if (!article?.image?.url) {
    return (
      <div className="flex h-full min-h-32 items-center justify-center bg-[#3a1224] text-[10px] font-bold uppercase tracking-[0.2em] text-[#C0A04C]/70">
        Shubham Venue
      </div>
    );
  }
  return (
    <Image
      src={article.image.url}
      alt={article.image.altText || article.title || "Blog article"}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      sizes="(min-width: 1024px) 200px, 100vw"
    />
  );
}

function BlogsSkeleton() {
  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <section className="bg-[#3a1224] px-6 pb-12 pt-44 text-white">
        <div className="mx-auto max-w-[1180px]">
          <div className="h-3 w-32 animate-pulse rounded bg-[#C0A04C]/20" />
          <div className="mt-5 h-12 max-w-2xl animate-pulse rounded bg-white/10" />
        </div>
      </section>
      <section className="mx-auto max-w-[1180px] px-6 py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-36 animate-pulse rounded-lg border border-[#eadfcb] bg-white" />
          ))}
        </div>
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-md border border-dashed border-[#eadfcb] bg-white px-6 py-16 text-center">
      <h2 className="text-xl font-black text-[#3a1224]">No articles published yet</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#3a1224]/60">
        Planning guides and venue updates will appear here soon.
      </p>
      <Link
        href={ROUTES.SITE.VENUES()}
        className="mt-6 inline-flex items-center rounded-md bg-[#3a1224] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#4b1830]"
      >
        Explore Venues
      </Link>
    </div>
  );
}

function ArticleRow({ article, featured = false }) {
  if (featured) {
    return (
      <article className="group mb-8 border-b border-[#eadfcb] pb-8">
        <Link href={ROUTES.SITE.BLOGS_DETAIL(article.handle)} className="grid gap-0 overflow-hidden rounded-lg sm:grid-cols-[280px_minmax(0,1fr)]">
          <div className="relative min-h-52 overflow-hidden bg-[#3a1224]">
            <ArticleThumb article={article} />
            <span className="absolute left-3 top-3 rounded bg-[#C0A04C] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#3a1224]">
              Featured
            </span>
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-xs text-[#3a1224]/45">{formatDate(article.publishedAt)}</p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-[#3a1224] transition group-hover:text-[#8b6d22]">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#3a1224]/60">{article.excerpt}</p>
            )}
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#8b6d22]">Read article</p>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group">
      <Link
        href={ROUTES.SITE.BLOGS_DETAIL(article.handle)}
        className="flex gap-4 border-b border-[#eadfcb] py-4 last:border-0"
      >
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded bg-[#3a1224]">
          <ArticleThumb article={article} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-[#3a1224]/45">{formatDate(article.publishedAt)}</p>
          <h2 className="mt-1 line-clamp-2 text-sm font-black leading-snug text-[#3a1224] transition group-hover:text-[#8b6d22]">
            {article.title}
          </h2>
        </div>
      </Link>
    </article>
  );
}

export default function BlogsPage() {
  const { data: blogsData = {}, isLoading, isError, error } = useQueryBlogsPublic({ blogHandle: "news", first: 20 });
  const articles = Array.isArray(blogsData?.blogs) ? blogsData.blogs : [];
  const [featuredArticle, ...restArticles] = articles;
  const latest = articles.slice(0, 5);

  if (isLoading) return <BlogsSkeleton />;

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      {/* ── Header ─────────────────────────────────────────── */}
      <section className="border-b border-[#eadfcb] bg-[#3a1224] px-6 pb-12 pt-44 text-white">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#C0A04C]">Blog</p>
          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.06] tracking-tight sm:text-5xl">
            Shubham Venue Blog
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/60">
            Guides, venue tips, event planning notes, and updates.
          </p>
        </div>
      </section>

      {/* ── Content ────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1180px] px-6 py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Articles */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#C0A04C]">
                Latest articles
              </p>
              {articles.length > 0 && (
                <p className="text-sm text-[#3a1224]/45">{articles.length} articles</p>
              )}
            </div>

            {isError ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-5">
                <p className="font-bold text-red-900">Could not load articles</p>
                <p className="mt-1 text-sm text-red-700">
                  {error?.message || "Please refresh or try again later."}
                </p>
              </div>
            ) : !articles.length ? (
              <EmptyState />
            ) : (
              <div>
                {featuredArticle && <ArticleRow article={featuredArticle} featured />}
                <div>
                  {restArticles.map((article) => (
                    <ArticleRow key={article.handle} article={article} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            {/* Recent posts */}
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[#C0A04C]">
                Recent posts
              </p>
              <div className="divide-y divide-[#eadfcb]">
                {latest.length ? (
                  latest.map((article) => (
                    <Link
                      key={article.handle}
                      href={ROUTES.SITE.BLOGS_DETAIL(article.handle)}
                      className="block py-3 first:pt-0 last:pb-0"
                    >
                      <p className="text-[10px] text-[#3a1224]/45">{formatDate(article.publishedAt)}</p>
                      <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-[#3a1224] transition hover:text-[#8b6d22]">
                        {article.title}
                      </h3>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-[#3a1224]/55">Articles will appear here.</p>
                )}
              </div>
            </div>

            {/* Topics */}
            <div className="border-t border-[#eadfcb] pt-8">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[#C0A04C]">Topics</p>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((topic) => (
                  <span
                    key={topic}
                    className="rounded border border-[#eadfcb] bg-white px-3 py-1.5 text-xs font-medium text-[#3a1224]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="border-t border-[#eadfcb] pt-8">
              <p className="text-sm font-black text-[#3a1224]">Need a venue after reading?</p>
              <p className="mt-2 text-sm leading-6 text-[#3a1224]/55">
                Browse halls, dates, guest capacity, and menus in one place.
              </p>
              <Link
                href={ROUTES.SITE.VENUES()}
                className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-[#3a1224] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#4b1830]"
              >
                Browse Venues
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
