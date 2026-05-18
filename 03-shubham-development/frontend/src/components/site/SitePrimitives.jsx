"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function resolveImage(src, fallback = "/assets/business-images/business-images-carousel/hall2.jpg") {
  if (!src || typeof src !== "string") return fallback;
  const value = src.trim();
  if (!value) return fallback;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("data:image/")) return value;
  if (value.startsWith("/assets/")) return value;
  if (value.startsWith("assets/")) return `/${value}`;
  return fallback;
}

export function SiteButton({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon = ArrowRight,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-champagne)] disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-[var(--color-wine)] text-white shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:bg-[var(--color-wine-hover)]",
    gold: "bg-[var(--color-champagne)] text-[var(--color-wine)] shadow-[0_18px_40px_-24px_rgba(192,160,76,0.9)] hover:-translate-y-0.5 hover:bg-[var(--color-champagne-light)]",
    secondary:
      "border border-[var(--color-sand)] bg-white text-[var(--color-wine)] hover:-translate-y-0.5 hover:border-[var(--color-champagne)] hover:bg-[var(--color-ivory)]",
    ghost: "text-[var(--color-wine)] hover:bg-[var(--color-pearl)]",
  };
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-7 py-3.5 text-sm",
  };
  const content = (
    <>
      <span>{children}</span>
      {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
    </>
  );
  const classes = cn(base, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}

export function SitePageHeader({ eyebrow, title, description, children, align = "left" }) {
  return (
    <section className="relative overflow-hidden bg-[var(--color-wine)] pb-16 pt-36 lg:pt-40 text-white">
      <div
        className={cn(
          "relative z-10 mx-auto max-w-7xl px-6 lg:px-8",
          align === "center" && "text-center"
        )}
      >
        {eyebrow ? <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[var(--color-champagne)] mb-4">{eyebrow}</p> : null}
        <h1 className="text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl text-white max-w-4xl">{title}</h1>
        {description ? (
          <p
            className={cn(
              "mt-5 max-w-2xl text-base leading-7 text-white/80",
              align === "center" && "mx-auto"
            )}
          >
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

export function SiteSectionHeader({ eyebrow, title, description, action, className = "" }) {
  return (
    <div className={cn("mb-8 flex flex-col gap-5 md:mb-11 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="site-eyebrow mb-3">{eyebrow}</p> : null}
        <h2 className="site-heading text-[var(--color-wine)]">{title}</h2>
        {description ? <p className="mt-4 text-sm leading-6 text-[var(--color-stone)] md:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function SiteCard({ children, className = "", as: Component = "div", ...props }) {
  return (
    <Component className={cn("rounded-2xl border border-[var(--color-sand)] bg-white shadow-[var(--shadow-card)]", className)} {...props}>
      {children}
    </Component>
  );
}

export function SiteEmptyState({
  icon: Icon = Search,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-sand)] bg-white px-6 py-16 text-center shadow-[var(--shadow-soft)]">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-pearl)] text-[var(--color-wine)]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-wine)]">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-stone)]">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function SiteFilterBar({ children, className = "" }) {
  return (
    <div className={cn("rounded-xl border border-[var(--color-sand)] bg-white p-3 shadow-[var(--shadow-soft)]", className)}>
      {children}
    </div>
  );
}
