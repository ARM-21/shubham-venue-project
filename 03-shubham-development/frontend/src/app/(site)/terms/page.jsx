"use client";

import Link from "next/link";
import { ROUTES } from "config/routes";
import { ChevronLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#fdfaf6] relative overflow-hidden">
      {/* Dark Gradient Header */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/80 to-transparent pointer-events-none z-0" />

      <main className="max-w-4xl mx-auto px-6 sm:px-8 pt-20 pb-20 relative z-10">
        {/* Back Button */}
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-2 text-white hover:text-[#C0A04C] transition-colors mb-12 font-bold"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Home
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-[#C0A04C]" />
            <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Legal</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
            Terms of <span className="text-[#C0A04C] italic font-serif">Service</span>
          </h1>
          <p className="text-white/70 text-lg font-light leading-relaxed">
            Please read these terms carefully before using Shubham Venue's services and website.
          </p>
        </header>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-12 space-y-8">
          
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing and using this website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </Section>

          <Section title="2. Use License">
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Shubham Venue's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#3a1224]/70 mt-3">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer, disassemble, or hack any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </Section>

          <Section title="3. Booking and Payment">
            <p>
              All bookings are subject to availability and confirmation. Payment terms and conditions are specified at the time of booking. Payments must be made in full before the event date unless otherwise agreed upon in writing.
            </p>
          </Section>

          <Section title="4. Cancellation Policy">
            <p>
              Cancellations must be made in writing at least 30 days prior to the event. Different services have different cancellation policies. Refund eligibility depends on the timing and reason for cancellation. Please refer to our detailed cancellation policy for more information.
            </p>
          </Section>

          <Section title="5. Liability Disclaimer">
            <p>
              The materials on Shubham Venue's website are provided on an 'as is' basis. Shubham Venue makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </Section>

          <Section title="6. Limitations of Liability">
            <p>
              In no event shall Shubham Venue or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the website, even if authorized representatives have been notified.
            </p>
          </Section>

          <Section title="7. Accuracy of Materials">
            <p>
              The materials appearing on Shubham Venue's website could include technical, typographical, or photographic errors. Shubham Venue does not warrant that any of the materials on the website are accurate, complete, or current. Shubham Venue may make changes to the materials contained on the website at any time without notice.
            </p>
          </Section>

          <Section title="8. Links">
            <p>
              Shubham Venue has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Shubham Venue of the site. Use of any such linked website is at the user's own risk.
            </p>
          </Section>

          <Section title="9. Modifications">
            <p>
              Shubham Venue may revise these terms of service for the website at any time without notice. By using this website, you are agreeing to be bound by the then-current version of these terms of service.
            </p>
          </Section>

          <Section title="10. Governing Law">
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of Nepal, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </Section>

          <Section title="11. Contact Information">
            <div className="bg-[#C0A04C]/10 border border-[#C0A04C]/20 rounded-xl p-6 text-[#3a1224]">
              <p className="font-bold mb-3">For questions about these terms, please contact:</p>
              <p>Email: <a href="mailto:legal@shubhamvenue.com" className="text-[#C0A04C] hover:underline">legal@shubhamvenue.com</a></p>
              <p>Phone: <a href="tel:+9779812345678" className="text-[#C0A04C] hover:underline">+977 9812345678</a></p>
            </div>
          </Section>

          <div className="pt-8 border-t border-[#3a1224]/10 text-center text-sm text-[#3a1224]/50">
            <p>Last updated: April 2026</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#3a1224] mb-4">{title}</h2>
      <div className="text-[#3a1224]/70 leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}
