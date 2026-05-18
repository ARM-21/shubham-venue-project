"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ROUTES } from "config/routes";

const contactDetails = [
  { label: "Address", value: "Waling, Syangja, Gandaki Province, Nepal" },
  { label: "Phone", value: "+977 9812345678" },
  { label: "Email", value: "hello@shubham.com" },
  { label: "Office hours", value: "Sun - Fri, 9:00 AM - 6:00 PM" },
];

const enquiryTypes = [
  "Venue booking",
  "Ticket support",
  "Event planning",
  "Organizer enquiry",
  "Other",
];

const supportAreas = [
  "Venue availability and pricing",
  "Menu and guest planning",
  "Ticket and event support",
  "Organizer account enquiries",
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
      <section className="relative overflow-hidden bg-[#3a1224] px-6 pb-14 pt-44 text-white">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FDFCFB] to-transparent" />
        <div className="relative mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#C0A04C]">Contact Shubham Venue</p>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">
              Talk to us about your event.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
              Have a venue booking question, event enquiry, ticket issue, or organizer request? Share the details and our team will help you with the next step.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#C0A04C]">Quick contact</p>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/48">Phone</p>
                <p className="mt-1 text-lg font-black text-white">+977 9812345678</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/48">Location</p>
                <p className="mt-1 text-lg font-black text-white">Waling, Syangja</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-8 px-6 py-12 lg:grid-cols-[0.88fr_1.12fr] lg:py-16">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[#eadfcb] bg-white p-7 shadow-[0_22px_70px_-50px_rgba(58,18,36,0.35)]">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">Office details</p>
            <div className="mt-6 divide-y divide-[#eadfcb]">
              {contactDetails.map((item) => (
                <div key={item.label} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/45">{item.label}</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#3a1224]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#eadfcb] bg-[#fbf7ef] p-7">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">Support areas</p>
            <div className="mt-5 space-y-3">
              {supportAreas.map((area, index) => (
                <div key={area} className="grid grid-cols-[38px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-[#eadfcb] bg-white p-4">
                  <span className="text-xs font-black text-[#C0A04C]">{String(index + 1).padStart(2, "0")}</span>
                  <p className="text-sm font-bold text-[#3a1224]">{area}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#3a1224] p-7 text-white">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">Planning first?</p>
            <h2 className="mt-3 text-2xl font-black">Check available halls before calling.</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Start with your date, slot, and guest count so the conversation is clearer.
            </p>
            <Link
              href={ROUTES.SITE.SEARCH_AVAILABILITY()}
              className="mt-6 inline-flex w-full cursor-pointer justify-center rounded-full bg-[#C0A04C] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#3a1224] transition hover:bg-[#d8bc64]"
            >
              Check Availability
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#eadfcb] bg-white p-7 shadow-[0_22px_70px_-50px_rgba(58,18,36,0.35)] sm:p-9">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">Send a message</p>
          <h2 className="mt-3 text-3xl font-black text-[#3a1224]">Tell us what you need.</h2>
          <p className="mt-3 text-sm leading-6 text-[#3a1224]/65">
            Include your event date, estimated guests, preferred hall style, and anything you already know about the plan.
          </p>

          {submitted ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-800">
                Message noted. For urgent bookings, please call the listed phone number.
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/55">Name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  required
                  className="mt-2 w-full rounded-2xl border border-[#eadfcb] bg-[#FDFCFB] px-5 py-4 text-sm text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:bg-white focus:ring-4 focus:ring-[#C0A04C]/15"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/55">Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  className="mt-2 w-full rounded-2xl border border-[#eadfcb] bg-[#FDFCFB] px-5 py-4 text-sm text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:bg-white focus:ring-4 focus:ring-[#C0A04C]/15"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/55">Enquiry type</span>
              <select
                name="enquiryType"
                className="mt-2 w-full cursor-pointer rounded-2xl border border-[#eadfcb] bg-[#FDFCFB] px-5 py-4 text-sm font-bold text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:bg-white focus:ring-4 focus:ring-[#C0A04C]/15"
              >
                {enquiryTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/55">Message</span>
              <textarea
                name="message"
                rows={7}
                placeholder="Tell us about your event, expected guests, date, or question..."
                required
                className="mt-2 w-full resize-none rounded-2xl border border-[#eadfcb] bg-[#FDFCFB] px-5 py-4 text-sm text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:bg-white focus:ring-4 focus:ring-[#C0A04C]/15"
              />
            </label>

            <button
              type="submit"
              className="w-full cursor-pointer rounded-full bg-[#3a1224] px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#C0A04C] hover:text-[#3a1224]"
            >
              Send Message
            </button>
          </form>

          <p className="mt-5 text-xs leading-5 text-[#3a1224]/50">
            This enquiry form is for general contact. For urgent availability or payment questions, call directly.
          </p>
        </div>
      </section>
    </main>
  );
}
