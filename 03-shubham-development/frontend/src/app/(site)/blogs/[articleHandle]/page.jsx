"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ROUTES } from "config/routes";
import { useQueryBlogsPublic } from "@queries/customer/blogs-public";
import { decodeHtmlSimple } from "utils/htmlDecoder";

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

function BlogDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <section className="bg-[#3a1224] px-6 pb-16 pt-44 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="h-4 w-40 animate-pulse rounded-full bg-[#C0A04C]/25" />
          <div className="mt-8 h-20 animate-pulse rounded-2xl bg-white/10" />
          <div className="mt-5 h-6 max-w-xl animate-pulse rounded-full bg-white/10" />
        </div>
      </section>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="h-96 animate-pulse rounded-[2rem] border border-[#eadfcb] bg-white" />
      </div>
    </main>
  );
}

export default function BlogDetailPage() {
  const params = useParams();
  const articleHandle = params.articleHandle;

  const { data: blogsData = {}, isLoading, isError, error } = useQueryBlogsPublic(
    { blogHandle: "news", first: 100 }
  );

  const articles = Array.isArray(blogsData?.blogs) ? blogsData.blogs : [];
  const article = articles.find((item) => item.handle === articleHandle);
  const related = articles.filter((item) => item.handle !== articleHandle).slice(0, 3);

  if (isLoading) return <BlogDetailSkeleton />;

  if (isError || !article) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FDFCFB] px-6 pt-28">
        <div className="max-w-md rounded-[2rem] border border-[#eadfcb] bg-white p-8 text-center shadow-[0_22px_70px_-45px_rgba(58,18,36,0.45)]">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">Article not found</p>
          <h1 className="mt-3 text-2xl font-black text-[#3a1224]">We could not load this article.</h1>
          <p className="mt-3 text-sm leading-6 text-[#3a1224]/65">
            {error?.message || "The article may have been removed or is not available right now."}
          </p>
          <Link
            href={ROUTES.SITE.BLOGS}
            className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-full bg-[#3a1224] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#4b1830]"
          >
            Back to Blogs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <section className="relative overflow-hidden bg-[#3a1224] px-6 pb-14 pt-44 text-white">
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FDFCFB] to-transparent" />
        <div className="relative mx-auto max-w-4xl">
          <Link
            href={ROUTES.SITE.BLOGS}
            className="inline-flex cursor-pointer items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white/80 transition hover:bg-white/15"
          >
            Back to blogs
          </Link>
          <p className="mt-8 text-[11px] font-black uppercase tracking-[0.32em] text-[#C0A04C]">Planning guide</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-white/72">
            <span>📅 {formatDate(article.publishedAt)}</span>
            {article.author?.name ? <span>Written by {article.author.name}</span> : null}
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-6 pb-16 pt-8 lg:pb-24">
        {article.image?.url ? (
          <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-[2rem] border border-[#eadfcb] bg-[#3a1224] shadow-[0_22px_70px_-45px_rgba(58,18,36,0.45)]">
            <Image
              src={article.image.url}
              alt={article.image.altText || article.title}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 896px, 100vw"
            />
          </div>
        ) : null}

        {article.excerpt ? (
          <p className="mb-8 border-b border-[#eadfcb] pb-8 text-xl font-semibold leading-8 text-[#3a1224]/72">
            {article.excerpt}
          </p>
        ) : null}

        <div
          className="prose max-w-none text-[#3a1224] prose-headings:font-black prose-headings:tracking-tight prose-headings:text-[#3a1224] prose-h2:mt-10 prose-h2:text-3xl prose-h3:text-2xl prose-p:leading-8 prose-p:text-[#3a1224]/72 prose-a:text-[#8b6d22] prose-a:font-bold prose-blockquote:border-l-[#C0A04C] prose-blockquote:text-[#3a1224]/70 prose-strong:text-[#3a1224] prose-li:text-[#3a1224]/72"
          dangerouslySetInnerHTML={{ __html: decodeHtmlSimple(article.contentHtml || "") }}
        />

        <div className="mt-14 rounded-[2rem] border border-[#eadfcb] bg-[#fbf7ef] p-6 sm:p-8">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">Need a venue?</p>
          <h2 className="mt-3 text-2xl font-black text-[#3a1224]">Plan the event after the read.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#3a1224]/65">
            Browse available halls, compare capacity, and start with your preferred date.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ROUTES.SITE.VENUES()}
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#3a1224] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#4b1830]"
            >
              Explore Venues
            </Link>
            <Link
              href={ROUTES.SITE.EVENTS}
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#eadfcb] bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#3a1224] transition hover:border-[#C0A04C]"
            >
              Browse Events
            </Link>
          </div>
        </div>

        {related.length ? (
          <section className="mt-14 border-t border-[#eadfcb] pt-10">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">More articles</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.handle}
                  href={ROUTES.SITE.BLOGS_DETAIL(item.handle)}
                  className="rounded-2xl border border-[#eadfcb] bg-white p-5 transition hover:border-[#C0A04C]"
                >
                  <p className="text-xs font-semibold text-[#3a1224]/50">{formatDate(item.publishedAt)}</p>
                  <h3 className="mt-3 line-clamp-2 text-base font-black leading-snug text-[#3a1224]">{item.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
