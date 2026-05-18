"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "config/routes";
import { useQueryBlogsPublic } from "@queries/customer/blogs-public";

const TOPICS = ["Venue Tips", "Weddings", "Parties", "Meetings", "Menus"];

function formatDate(value) {
  if (!value) return "Recent";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function ArticleThumb({ article }) {
  if (!article?.image?.url) {
    return (
      <div className="flex h-full min-h-32 items-center justify-center bg-[#3a1224] px-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#C0A04C]/80">
        Shubham Venue
      </div>
    );
  }

  return (
    <Image
      src={article.image.url}
      alt={article.image.altText || article.title || "Blog article image"}
      fill
      className="object-cover transition duration-500 group-hover:scale-105"
      sizes="(min-width: 1024px) 220px, 100vw"
    />
  );
}

function BlogsSkeleton() {
  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <section className="border-b border-[#eadfcb] bg-[#3a1224] px-6 pb-12 pt-44 text-white">
        <div className="mx-auto max-w-[1180px]">
          <div className="h-4 w-40 animate-pulse rounded-full bg-[#C0A04C]/25" />
          <div className="mt-6 h-14 max-w-2xl animate-pulse rounded-2xl bg-white/10" />
          <div className="mt-4 h-5 max-w-xl animate-pulse rounded-full bg-white/10" />
        </div>
      </section>
      <section className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-2xl border border-[#eadfcb] bg-white" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl border border-[#eadfcb] bg-white" />
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[#eadfcb] bg-white px-6 py-16 text-center">
      <p className="text-4xl">📝</p>
      <h2 className="mt-5 text-2xl font-black text-[#3a1224]">No articles published yet</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#3a1224]/65">
        Planning guides and venue updates will appear here soon.
      </p>
      <Link
        href={ROUTES.SITE.VENUES()}
        className="mt-7 inline-flex cursor-pointer justify-center rounded-full bg-[#3a1224] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#4b1830]"
      >
        Explore Venues
      </Link>
    </div>
  );
}

function ArticleRow({ article }) {
  return (
    <article className="group rounded-2xl border border-[#eadfcb] bg-white transition hover:border-[#C0A04C]">
      <Link href={ROUTES.SITE.BLOGS_DETAIL(article.handle)} className="grid gap-0 overflow-hidden rounded-2xl sm:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative min-h-44 overflow-hidden bg-[#3a1224]">
          <ArticleThumb article={article} />
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-xs font-bold text-[#3a1224]/50">{formatDate(article.publishedAt)}</p>
          <h2 className="mt-2 text-xl font-black leading-tight text-[#3a1224] sm:text-2xl">
            {article.title}
          </h2>
          {article.excerpt ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#3a1224]/65">{article.excerpt}</p>
          ) : null}
          <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-[#8b6d22]">Read article</p>
        </div>
      </Link>
    </article>
  );
}

export default function BlogsPage() {
  const { data: blogsData = {}, isLoading, isError, error } = useQueryBlogsPublic(
    { blogHandle: "news", first: 20 }
  );

  const articles = Array.isArray(blogsData?.blogs) ? blogsData.blogs : [];
  const latest = articles.slice(0, 5);

  if (isLoading) return <BlogsSkeleton />;

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <section className="border-b border-[#eadfcb] bg-[#3a1224] px-6 pb-12 pt-44 text-white">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[#C0A04C]">Blog</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Shubham Venue Blog
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/76">
            Guides, venue tips, event planning notes, and updates from Shubham Venue.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_310px] lg:py-14">
        <div>
          <div className="mb-6 flex flex-col gap-2 border-b border-[#eadfcb] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#C0A04C]">Latest articles</p>
              <h2 className="mt-2 text-2xl font-black text-[#3a1224]">Event planning reads</h2>
            </div>
            {articles.length ? (
              <p className="text-sm font-semibold text-[#3a1224]/55">{articles.length} articles</p>
            ) : null}
          </div>

          {isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h2 className="font-black text-red-900">Could not load articles</h2>
              <p className="mt-2 text-sm leading-6 text-red-700">
                {error?.message || "Please refresh the page or try again later."}
              </p>
            </div>
          ) : !articles.length ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <ArticleRow key={article.handle} article={article} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-[#eadfcb] bg-white p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#C0A04C]">Latest posts</p>
            <div className="mt-4 space-y-3">
              {latest.length ? (
                latest.map((article) => (
                  <Link
                    key={article.handle}
                    href={ROUTES.SITE.BLOGS_DETAIL(article.handle)}
                    className="block border-b border-[#eadfcb] pb-3 last:border-b-0 last:pb-0"
                  >
                    <p className="text-xs font-semibold text-[#3a1224]/50">{formatDate(article.publishedAt)}</p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-black leading-snug text-[#3a1224]">{article.title}</h3>
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-6 text-[#3a1224]/60">Latest posts will appear here.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#eadfcb] bg-[#fbf7ef] p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#C0A04C]">Topics</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TOPICS.map((topic) => (
                <span key={topic} className="rounded-full border border-[#eadfcb] bg-white px-3 py-2 text-xs font-bold text-[#3a1224]">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[#3a1224] p-5 text-white">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#C0A04C]">Plan your event</p>
            <h2 className="mt-3 text-xl font-black">Need a venue after reading?</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Check halls, dates, guest capacity, and menus in one place.
            </p>
            <Link
              href={ROUTES.SITE.VENUES()}
              className="mt-5 inline-flex w-full cursor-pointer justify-center rounded-full bg-[#C0A04C] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#3a1224] transition hover:bg-[#d8bc64]"
            >
              Browse Venues
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
