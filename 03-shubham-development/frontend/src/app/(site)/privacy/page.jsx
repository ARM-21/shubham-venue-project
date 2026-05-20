"use client";

import Link from "next/link";
import { ROUTES } from "config/routes";
import {
  ChevronLeft, Shield, Database, Eye, Share2, Cookie,
  UserCheck, RefreshCw, Lock, Mail,
} from "lucide-react";

const TOC = [
  { id: "overview", label: "1. Overview" },
  { id: "collection", label: "2. Information We Collect" },
  { id: "usage", label: "3. How We Use Your Information" },
  { id: "storage", label: "4. Data Storage & Security" },
  { id: "sharing", label: "5. Sharing Your Information" },
  { id: "cookies", label: "6. Cookies & Tracking" },
  { id: "retention", label: "7. Data Retention" },
  { id: "rights", label: "8. Your Rights" },
  { id: "children", label: "9. Children's Privacy" },
  { id: "thirdparty", label: "10. Third-Party Links" },
  { id: "changes", label: "11. Changes to This Policy" },
  { id: "contact", label: "12. Contact Us" },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fdfaf6] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[520px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/85 to-transparent pointer-events-none z-0" />

      <main className="max-w-6xl mx-auto px-6 sm:px-8 pt-20 pb-24 relative z-10">
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-2 text-white/70 hover:text-[#C0A04C] transition-colors mb-10 text-sm font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <header className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-[1px] bg-[#C0A04C]" />
            <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Legal</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-display font-bold text-white mb-5 leading-tight">
            Privacy <span className="text-[#C0A04C] italic font-serif">Policy</span>
          </h1>
          <p className="text-white/65 text-base leading-relaxed max-w-2xl">
            We take your privacy seriously. This policy explains exactly what data we collect, why we collect it,
            how it is stored, and the controls you have over your information.
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/50">
            <span>Effective date: <strong className="text-white/70">1 January 2025</strong></span>
            <span>Last updated: <strong className="text-white/70">May 2026</strong></span>
            <span>Jurisdiction: <strong className="text-white/70">Nepal</strong></span>
          </div>
        </header>

        <div className="grid lg:grid-cols-[260px_1fr] gap-10 items-start">
          {/* Sticky Table of Contents */}
          <aside className="hidden lg:block sticky top-8">
            <div className="rounded-2xl border border-[#3a1224]/10 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#3a1224]/40 mb-4">Contents</p>
              <nav className="space-y-1">
                {TOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-xs text-[#3a1224]/60 hover:text-[#C0A04C] transition-colors py-1 leading-snug"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-5 border-t border-[#3a1224]/8">
                <p className="text-[10px] text-[#3a1224]/40 leading-relaxed">
                  Privacy questions?{" "}
                  <a href="mailto:privacy@shubhamvenue.com" className="text-[#C0A04C] hover:underline">
                    privacy@shubhamvenue.com
                  </a>
                </p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="bg-white rounded-3xl shadow-lg border border-[#3a1224]/8 overflow-hidden">
            {/* Header banner */}
            <div className="bg-[#3a1224] px-8 py-5 flex items-start gap-4">
              <Shield className="w-5 h-5 text-[#C0A04C] shrink-0 mt-0.5" />
              <p className="text-sm text-white/80 leading-relaxed">
                We do not sell or rent your personal information to any third party for marketing purposes — ever.
                This policy explains precisely how your data flows through our platform.
              </p>
            </div>

            <div className="px-8 sm:px-12 py-12 space-y-12">

              <Section id="overview" icon={<Eye className="w-5 h-5" />} title="1. Overview">
                <p>
                  Shubham Venue ("we," "our," or "us") operates the website and platform at shubhamvenue.com.
                  This Privacy Policy applies to all users of our platform, including visitors, registered users,
                  event organisers, and administrators.
                </p>
                <p>
                  This policy describes what personal information we collect, how we use it, when we share it,
                  how long we retain it, and what rights you have. By using our platform, you consent to the
                  practices described in this policy.
                </p>
                <p>
                  If you have questions or concerns not addressed here, contact our privacy team at{" "}
                  <a href="mailto:privacy@shubhamvenue.com" className="text-[#C0A04C] hover:underline">
                    privacy@shubhamvenue.com
                  </a>.
                </p>
              </Section>

              <Divider />

              <Section id="collection" icon={<Database className="w-5 h-5" />} title="2. Information We Collect">
                <h3 className="text-base font-bold text-[#3a1224] mb-3">2.1 Information You Provide Directly</h3>
                <ul className="list-none space-y-2">
                  {[
                    ["Account registration", "Full name, email address, password (stored as a secure hash — never in plain text), and profile photo."],
                    ["Booking details", "Event date, selected time slot, hall preference, number of guests, and special requests."],
                    ["Payment information", "Transaction reference numbers and payment status. Full card details are processed by our payment gateway (Khalti) and are never stored on our servers."],
                    ["Menu & catering choices", "Food package selections and any dietary notes you provide."],
                    ["Decoration preferences", "Selected decoration scheme and add-on items."],
                    ["Organiser information", "Business name, event details, ticket types, and attendee communications for approved event organisers."],
                    ["Communications", "Messages you send to our support team, enquiry form submissions, and email correspondence."],
                  ].map(([label, desc]) => (
                    <li key={label} className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C0A04C] shrink-0" />
                      <span><strong className="text-[#3a1224]">{label}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-base font-bold text-[#3a1224] mt-6 mb-3">2.2 Information Collected Automatically</h3>
                <ul className="list-none space-y-2">
                  {[
                    ["Log data", "IP address, browser type, operating system, pages visited, and timestamp of access."],
                    ["Session data", "Authentication session tokens stored as secure HTTP-only cookies."],
                    ["Device data", "Device type, screen resolution, and language settings."],
                    ["Usage data", "Features used, booking flow steps completed, and error events."],
                  ].map(([label, desc]) => (
                    <li key={label} className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C0A04C] shrink-0" />
                      <span><strong className="text-[#3a1224]">{label}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-base font-bold text-[#3a1224] mt-6 mb-3">2.3 Information from Third Parties</h3>
                <p>
                  If you choose to sign in with Google, we receive your name, email address, and profile photo from
                  Google's OAuth service. We do not receive or store your Google password. The data we receive is
                  limited to what you authorise during the OAuth consent flow.
                </p>
              </Section>

              <Divider />

              <Section id="usage" icon={<Eye className="w-5 h-5" />} title="3. How We Use Your Information">
                <div className="grid sm:grid-cols-2 gap-4 mt-2">
                  {[
                    {
                      title: "Service Delivery",
                      items: ["Process and confirm venue bookings", "Send booking confirmations and invoices", "Manage event ticketing and check-in", "Provide customer support"],
                    },
                    {
                      title: "Account Management",
                      items: ["Authenticate your identity", "Maintain your booking history", "Send OTP verification codes", "Process password resets securely"],
                    },
                    {
                      title: "Platform Operations",
                      items: ["Detect and prevent fraud or abuse", "Enforce rate limits to protect the platform", "Monitor system performance", "Debug errors and improve reliability"],
                    },
                    {
                      title: "Communications",
                      items: ["Send transactional emails (confirmations, reminders)", "Notify you of booking status changes", "Respond to support enquiries", "Send important policy updates"],
                    },
                  ].map(({ title, items }) => (
                    <div key={title} className="rounded-xl bg-[#fdfaf6] border border-[#3a1224]/8 p-5">
                      <p className="text-xs font-black uppercase tracking-widest text-[#3a1224]/40 mb-3">{title}</p>
                      <ul className="space-y-1.5">
                        {items.map((item) => (
                          <li key={item} className="flex gap-2 text-xs text-[#3a1224]/70">
                            <span className="mt-1 w-1 h-1 rounded-full bg-[#C0A04C] shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <Highlight>
                  We will only contact you with marketing or promotional communications if you have explicitly opted in.
                  You can opt out at any time using the unsubscribe link in any such email or by contacting us directly.
                </Highlight>
              </Section>

              <Divider />

              <Section id="storage" icon={<Lock className="w-5 h-5" />} title="4. Data Storage & Security">
                <p>
                  Your data is stored on secure servers hosted by reputable cloud infrastructure providers. We implement
                  the following technical and organisational safeguards:
                </p>
                <ul className="list-none space-y-2 mt-4">
                  {[
                    "Passwords are hashed using bcrypt with a minimum of 10 salt rounds — your plain-text password is never stored.",
                    "Password reset tokens are hashed with SHA-256 before storage; only the short-lived plain token in your email link can initiate a reset.",
                    "Session cookies are HTTP-only and Secure, preventing client-side JavaScript access.",
                    "All data in transit is encrypted via HTTPS / TLS.",
                    "Database access is restricted to authenticated application servers; no public database endpoints are exposed.",
                    "Rate limiting is applied to all authentication and sensitive endpoints to mitigate brute-force attacks.",
                    "Single-session enforcement prevents concurrent logins from multiple devices without your knowledge.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C0A04C] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Highlight variant="warning">
                  Despite these measures, no method of data transmission or storage is completely secure. While we
                  work diligently to protect your data, we cannot guarantee absolute security. If you suspect your
                  account has been compromised, change your password immediately and contact us.
                </Highlight>
              </Section>

              <Divider />

              <Section id="sharing" icon={<Share2 className="w-5 h-5" />} title="5. Sharing Your Information">
                <p>
                  We do not sell, trade, or rent your personal information. We share data only in the following
                  limited and necessary circumstances:
                </p>
                <ul className="list-none space-y-3 mt-4">
                  {[
                    ["Payment processors", "We share the minimum data required (transaction amount, booking reference) with Khalti to process payments. Khalti's own privacy policy governs their data handling."],
                    ["Email service provider", "We use Resend to deliver transactional emails (booking confirmations, password resets, OTP codes). Your email address is shared solely to deliver these messages."],
                    ["Event organisers", "If you purchase a ticket to an event, your name and ticket details are shared with the event organiser for the purpose of check-in management. Organisers may not use this data for any other purpose."],
                    ["Legal obligations", "We may disclose your information when required by law, regulation, or valid legal process (such as a court order), or to protect the rights, property, or safety of Shubham Venue, our users, or the public."],
                    ["Business transfers", "In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you via email before your data becomes subject to a different privacy policy."],
                  ].map(([label, desc]) => (
                    <li key={label} className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C0A04C] shrink-0" />
                      <span><strong className="text-[#3a1224]">{label}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Divider />

              <Section id="cookies" icon={<Cookie className="w-5 h-5" />} title="6. Cookies & Tracking">
                <p>
                  We use cookies and similar technologies to operate the platform. Here is what we use and why:
                </p>
                <div className="mt-5 overflow-hidden rounded-xl border border-[#3a1224]/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#3a1224]/5">
                        <th className="text-left px-5 py-3 font-black text-[10px] uppercase tracking-widest text-[#3a1224]/60">Cookie Type</th>
                        <th className="text-left px-5 py-3 font-black text-[10px] uppercase tracking-widest text-[#3a1224]/60">Purpose</th>
                        <th className="text-left px-5 py-3 font-black text-[10px] uppercase tracking-widest text-[#3a1224]/60">Essential?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3a1224]/8">
                      {[
                        ["Session cookie", "Keeps you logged in and maintains your booking session state", "Yes"],
                        ["CSRF token", "Protects against cross-site request forgery attacks", "Yes"],
                        ["Preference cookies", "Remembers your language and display preferences", "No"],
                      ].map(([type, purpose, essential]) => (
                        <tr key={type} className="hover:bg-[#fdfaf6]/80">
                          <td className="px-5 py-3 font-semibold text-[#3a1224]">{type}</td>
                          <td className="px-5 py-3 text-[#3a1224]/70">{purpose}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                              essential === "Yes" ? "bg-[#3a1224]/8 text-[#3a1224]" : "bg-[#3a1224]/4 text-[#3a1224]/50"
                            }`}>
                              {essential}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4">
                  Essential cookies cannot be disabled without breaking core platform functionality (such as staying
                  logged in). Non-essential cookies can be disabled through your browser settings. Note that disabling
                  cookies may impair certain features of the platform.
                </p>
                <p className="mt-3">
                  We do not currently use third-party advertising or analytics cookies (such as Google Analytics).
                  If this changes, this policy will be updated and you will be notified.
                </p>
              </Section>

              <Divider />

              <Section id="retention" icon={<RefreshCw className="w-5 h-5" />} title="7. Data Retention">
                <p>
                  We retain your personal information only for as long as necessary to fulfil the purposes described
                  in this policy, or as required by applicable law. Our standard retention periods are:
                </p>
                <div className="mt-5 overflow-hidden rounded-xl border border-[#3a1224]/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#3a1224]/5">
                        <th className="text-left px-5 py-3 font-black text-[10px] uppercase tracking-widest text-[#3a1224]/60">Data Type</th>
                        <th className="text-left px-5 py-3 font-black text-[10px] uppercase tracking-widest text-[#3a1224]/60">Retention Period</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3a1224]/8">
                      {[
                        ["Account information", "Duration of account, plus 2 years after closure"],
                        ["Booking records", "7 years (for financial record-keeping obligations)"],
                        ["Payment transaction logs", "7 years (as required by tax law)"],
                        ["Email logs (transactional)", "90 days"],
                        ["Server access logs", "30 days"],
                        ["Password reset tokens", "1 hour from generation, then automatically deleted"],
                        ["Abandoned bookings (pending, unpaid)", "Auto-deleted after 5 minutes via TTL index"],
                      ].map(([type, period]) => (
                        <tr key={type} className="hover:bg-[#fdfaf6]/80">
                          <td className="px-5 py-3 font-semibold text-[#3a1224]">{type}</td>
                          <td className="px-5 py-3 text-[#3a1224]/70">{period}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4">
                  When data is no longer needed, it is securely deleted or anonymised so it can no longer be
                  associated with you as an individual.
                </p>
              </Section>

              <Divider />

              <Section id="rights" icon={<UserCheck className="w-5 h-5" />} title="8. Your Rights">
                <p>
                  Subject to applicable law, you have the following rights over your personal data:
                </p>
                <ul className="list-none space-y-3 mt-4">
                  {[
                    ["Right of access", "Request a copy of the personal data we hold about you."],
                    ["Right to rectification", "Ask us to correct inaccurate or incomplete personal data."],
                    ["Right to erasure", "Request deletion of your personal data, subject to legal retention obligations."],
                    ["Right to restrict processing", "Ask us to pause processing of your data while a dispute is resolved."],
                    ["Right to data portability", "Receive your data in a structured, machine-readable format."],
                    ["Right to object", "Object to processing of your personal data for certain purposes."],
                    ["Right to withdraw consent", "Withdraw any consent you have given at any time (e.g., for marketing emails)."],
                  ].map(([label, desc]) => (
                    <li key={label} className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C0A04C] shrink-0" />
                      <span><strong className="text-[#3a1224]">{label}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
                <Highlight>
                  To exercise any of these rights, contact us at{" "}
                  <a href="mailto:privacy@shubhamvenue.com" className="text-[#C0A04C] hover:underline font-semibold">
                    privacy@shubhamvenue.com
                  </a>. We will respond to verifiable requests within 30 days. We may need to verify your identity
                  before fulfilling a request. There is no charge for exercising your rights, though we may charge a
                  reasonable fee for manifestly unfounded or excessive requests.
                </Highlight>
              </Section>

              <Divider />

              <Section id="children" icon={<Shield className="w-5 h-5" />} title="9. Children's Privacy">
                <p>
                  Our platform is not directed at or intended for use by children under the age of 13. We do not
                  knowingly collect personal information from children under 13. If you are between 13 and 18 years old,
                  you must have a parent or legal guardian's consent before using our services.
                </p>
                <p className="mt-3">
                  If we become aware that we have inadvertently collected personal information from a child under 13
                  without parental consent, we will take steps to delete that information as promptly as possible.
                  If you believe we may have collected such information, please contact us immediately at{" "}
                  <a href="mailto:privacy@shubhamvenue.com" className="text-[#C0A04C] hover:underline">
                    privacy@shubhamvenue.com
                  </a>.
                </p>
              </Section>

              <Divider />

              <Section id="thirdparty" icon={<Share2 className="w-5 h-5" />} title="10. Third-Party Links">
                <p>
                  Our platform may contain links to external websites or services (such as Google OAuth, Khalti payment
                  gateway, or event organiser websites). This Privacy Policy does not apply to those third-party sites.
                  We are not responsible for the privacy practices or content of any third-party websites, and we
                  encourage you to read their privacy policies before providing any personal information.
                </p>
              </Section>

              <Divider />

              <Section id="changes" icon={<RefreshCw className="w-5 h-5" />} title="11. Changes to This Policy">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology,
                  legal requirements, or for other operational reasons. When we make material changes, we will:
                </p>
                <ul className="list-none space-y-2 mt-3">
                  {[
                    "Update the \"Last updated\" date at the top of this page.",
                    "Send an email notification to all registered users.",
                    "Display a prominent notice on the platform for at least 14 days.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C0A04C] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3">
                  Your continued use of the platform after the effective date of the revised policy constitutes your
                  acceptance of the changes. We encourage you to review this policy periodically.
                </p>
              </Section>

              <Divider />

              <Section id="contact" icon={<Mail className="w-5 h-5" />} title="12. Contact Us">
                <p>
                  If you have any questions, requests, or complaints regarding this Privacy Policy or our data
                  practices, please contact our Data Privacy team:
                </p>
                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "Privacy Enquiries", value: "privacy@shubhamvenue.com", href: "mailto:privacy@shubhamvenue.com" },
                    { label: "General Support", value: "hello@shubham.com", href: "mailto:hello@shubham.com" },
                    { label: "Phone", value: "+977 9812345678", href: "tel:+9779812345678" },
                    { label: "Postal Address", value: "Waling BP Road, Syangja, Gandaki Province, Nepal", href: null },
                  ].map(({ label, value, href }) => (
                    <div key={label} className="rounded-xl bg-[#fdfaf6] border border-[#3a1224]/8 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#3a1224]/40 mb-1">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-semibold text-[#C0A04C] hover:underline">{value}</a>
                      ) : (
                        <p className="text-sm font-semibold text-[#3a1224]">{value}</p>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm">
                  Also see our{" "}
                  <Link href="/terms" className="text-[#C0A04C] hover:underline font-semibold">
                    Terms of Service
                  </Link>{" "}
                  for the full legal framework governing your use of Shubham Venue.
                </p>
              </Section>

              <div className="pt-8 border-t border-[#3a1224]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#3a1224]/40">
                <p>© 2025–2026 Shubham Venue. All rights reserved.</p>
                <p>Last updated: May 2026</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ id, icon, title, children }) {
  return (
    <section id={id} className="scroll-mt-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#C0A04C]/10 text-[#C0A04C]">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-[#3a1224]">{title}</h2>
      </div>
      <div className="text-[#3a1224]/70 leading-relaxed space-y-3 text-sm">
        {children}
      </div>
    </section>
  );
}

function Divider() {
  return <div className="border-t border-[#3a1224]/8" />;
}

function Highlight({ children, variant = "default" }) {
  const styles =
    variant === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-900"
      : "bg-[#C0A04C]/8 border-[#C0A04C]/20 text-[#3a1224]";
  return (
    <div className={`rounded-xl border px-5 py-4 text-sm leading-relaxed mt-4 ${styles}`}>
      {children}
    </div>
  );
}
