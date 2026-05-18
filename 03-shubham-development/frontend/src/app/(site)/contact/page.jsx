"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ROUTES } from "config/routes";

const enquiryTypes = [
  "Venue booking",
  "Ticket support",
  "Event planning",
  "Organizer enquiry",
  "Other",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    toast.success("Message noted. Please call for urgent booking support.");
  }

  return (
    <main className="min-h-screen bg-[#FDFCFB]">

      {/* ── Page header ──────────────────────────────────────── */}
      <section className="bg-[#3a1224] px-6 pb-14 pt-40 text-white">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#C0A04C]">
            Contact
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.06] tracking-tight sm:text-5xl">
            Talk to us about your event.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-white/65">
            Venue bookings, event enquiries, ticket issues, organizer requests — 
            share what you need and we&apos;ll help with the next step.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-8 border-t border-white/10 pt-8 text-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Phone</p>
              <p className="mt-1 font-semibold">+977 9812345678</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Email</p>
              <p className="mt-1 font-semibold">hello@shubham.com</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Office hours</p>
              <p className="mt-1 font-semibold">Sun – Fri, 9 AM – 6 PM</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Location</p>
              <p className="mt-1 font-semibold">Waling, Syangja, Nepal</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Form + sidebar ───────────────────────────────────── */}
      <section className="mx-auto max-w-[1180px] px-6 py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_340px] lg:items-start">

          {/* Contact form */}
          <div>
            <h2 className="text-2xl font-black text-[#3a1224]">Send a message</h2>
            <p className="mt-2 text-sm leading-6 text-[#3a1224]/55">
              Include your event date, expected guests, and preferred hall style. 
              We typically respond within one business day.
            </p>

            {submitted && (
              <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-5 py-4">
                <p className="text-sm font-semibold text-emerald-800">
                  Your message has been noted. For urgent bookings, please call directly.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#3a1224]/50"
                  >
                    Full name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    placeholder="Your name"
                    required
                    className="mt-2 w-full rounded-md border border-[#eadfcb] bg-white px-4 py-3 text-sm text-[#3a1224] outline-none transition placeholder:text-[#3a1224]/30 focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#3a1224]/50"
                  >
                    Email address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    className="mt-2 w-full rounded-md border border-[#eadfcb] bg-white px-4 py-3 text-sm text-[#3a1224] outline-none transition placeholder:text-[#3a1224]/30 focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-phone"
                  className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#3a1224]/50"
                >
                  Phone number <span className="normal-case font-normal tracking-normal text-[#3a1224]/35">(optional)</span>
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  placeholder="+977 98XXXXXXXX"
                  className="mt-2 w-full rounded-md border border-[#eadfcb] bg-white px-4 py-3 text-sm text-[#3a1224] outline-none transition placeholder:text-[#3a1224]/30 focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-enquiry"
                  className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#3a1224]/50"
                >
                  Enquiry type
                </label>
                <select
                  id="contact-enquiry"
                  name="enquiryType"
                  className="mt-2 w-full cursor-pointer rounded-md border border-[#eadfcb] bg-white px-4 py-3 text-sm font-medium text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20"
                >
                  {enquiryTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#3a1224]/50"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  placeholder="Tell us about your event — date, expected guests, occasion type, or any specific questions..."
                  required
                  className="mt-2 w-full resize-none rounded-md border border-[#eadfcb] bg-white px-4 py-3 text-sm text-[#3a1224] outline-none transition placeholder:text-[#3a1224]/30 focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20"
                />
              </div>

              <button
                type="submit"
                className="rounded-md bg-[#3a1224] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-[#4b1830]"
              >
                Send message
              </button>

              <p className="text-xs leading-5 text-[#3a1224]/40">
                This form is for general enquiries. For urgent booking support or to confirm availability, 
                please call directly.
              </p>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-24">

            {/* Office details */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#C0A04C]">
                Office details
              </p>
              <div className="mt-4 divide-y divide-[#eadfcb]">
                {[
                  { label: "Address", value: "Waling, Syangja, Gandaki Province, Nepal" },
                  { label: "Phone", value: "+977 9812345678" },
                  { label: "Email", value: "hello@shubham.com" },
                  { label: "Office hours", value: "Sun – Fri, 9:00 AM – 6:00 PM" },
                ].map((item) => (
                  <div key={item.label} className="py-4 first:pt-0 last:pb-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3a1224]/38">
                      {item.label}
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-[#3a1224]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What we help with */}
            <div className="border-t border-[#eadfcb] pt-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#C0A04C]">
                We can help with
              </p>
              <ul className="mt-4 space-y-3">
                {[
                  "Venue availability and pricing",
                  "Menu and catering packages",
                  "Ticket and booking support",
                  "Organizer account enquiries",
                ].map((area) => (
                  <li key={area} className="flex items-start gap-2.5 text-sm text-[#3a1224]/65">
                    <span className="mt-[5px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#C0A04C]" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>

            {/* Check availability nudge */}
            <div className="border-t border-[#eadfcb] pt-8">
              <p className="text-sm font-black text-[#3a1224]">Checking hall availability?</p>
              <p className="mt-2 text-sm leading-6 text-[#3a1224]/55">
                Start with your date and guest count before calling — it makes the conversation much quicker.
              </p>
              <Link
                href={ROUTES.SITE.SEARCH_AVAILABILITY()}
                className="mt-5 inline-flex w-full items-center justify-center rounded-md border border-[#eadfcb] bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#3a1224] transition hover:border-[#C0A04C] hover:bg-[#fbf7ef]"
              >
                Check Availability
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
