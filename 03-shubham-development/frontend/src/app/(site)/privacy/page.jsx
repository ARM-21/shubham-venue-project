"use client";

import Link from "next/link";
import { ROUTES } from "config/routes";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            Privacy <span className="text-[#C0A04C] italic font-serif">Policy</span>
          </h1>
          <p className="text-white/70 text-lg font-light leading-relaxed">
            Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
          </p>
        </header>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-12 space-y-8">
          
          <Section title="1. Information We Collect">
            <p>
              We collect information you provide directly to us, including your name, email address, phone number, booking preferences, and payment information. We also automatically collect certain information about your device and how you interact with our website.
            </p>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc list-inside space-y-2 text-[#3a1224]/70">
              <li>To process your bookings and payments</li>
              <li>To send you event confirmations and updates</li>
              <li>To improve our services and website functionality</li>
              <li>To communicate with you about promotions (with your consent)</li>
              <li>To comply with legal obligations</li>
            </ul>
          </Section>

          <Section title="3. Data Security">
            <p>
              We implement industry-standard security measures to protect your personal data. However, no method of transmission over the internet or digital storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="4. Third-Party Sharing">
            <p>
              We do not sell or rent your personal information to third parties. We may share information with service providers who assist us in operating our website and providing services, all under strict confidentiality agreements.
            </p>
          </Section>

          <Section title="5. Cookies and Tracking">
            <p>
              Our website uses cookies and similar tracking technologies to enhance your experience. You can control cookie settings through your browser preferences, though some features may not function properly if cookies are disabled.
            </p>
          </Section>

          <Section title="6. Your Rights">
            <p>
              You have the right to access, correct, or delete your personal information. To exercise these rights or ask questions about our privacy practices, please contact us at privacy@shubhamvenue.com.
            </p>
          </Section>

          <Section title="7. Policy Updates">
            <p>
              We may update this privacy policy from time to time. We will notify you of significant changes by posting an update on our website. Your continued use of our services indicates your acceptance of the updated policy.
            </p>
          </Section>

          <Section title="8. Contact Us">
            <div className="bg-[#C0A04C]/10 border border-[#C0A04C]/20 rounded-xl p-6 text-[#3a1224]">
              <p className="font-bold mb-3">For privacy concerns, please contact:</p>
              <p>Email: <a href="mailto:privacy@shubhamvenue.com" className="text-[#C0A04C] hover:underline">privacy@shubhamvenue.com</a></p>
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
