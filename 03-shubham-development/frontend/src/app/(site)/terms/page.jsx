"use client";

import Link from "next/link";
import { ROUTES } from "config/routes";
import { ChevronLeft, Scale, FileText, CreditCard, CalendarX, ShieldAlert, Users, Building2, Gavel } from "lucide-react";

const TOC = [
  { id: "acceptance", label: "1. Acceptance of Terms" },
  { id: "services", label: "2. Our Services" },
  { id: "accounts", label: "3. User Accounts" },
  { id: "booking", label: "4. Booking Process & Payments" },
  { id: "cancellation", label: "5. Cancellation & Refund Policy" },
  { id: "organizers", label: "6. Event Organizers" },
  { id: "conduct", label: "7. Acceptable Use" },
  { id: "ip", label: "8. Intellectual Property" },
  { id: "liability", label: "9. Limitation of Liability" },
  { id: "indemnification", label: "10. Indemnification" },
  { id: "termination", label: "11. Account Termination" },
  { id: "modifications", label: "12. Modifications to Terms" },
  { id: "governing", label: "13. Governing Law" },
  { id: "contact", label: "14. Contact Us" },
];

export default function TermsOfServicePage() {
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
            Terms of <span className="text-[#C0A04C] italic font-serif">Service</span>
          </h1>
          <p className="text-white/65 text-base leading-relaxed max-w-2xl">
            These terms govern your access to and use of Shubham Venue's website, platform, and services.
            Please read them carefully before proceeding.
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
                  Questions? Contact{" "}
                  <a href="mailto:legal@shubhamvenue.com" className="text-[#C0A04C] hover:underline">
                    legal@shubhamvenue.com
                  </a>
                </p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="bg-white rounded-3xl shadow-lg border border-[#3a1224]/8 overflow-hidden">
            {/* Alert banner */}
            <div className="bg-[#3a1224] px-8 py-5 flex items-start gap-4">
              <Scale className="w-5 h-5 text-[#C0A04C] shrink-0 mt-0.5" />
              <p className="text-sm text-white/80 leading-relaxed">
                By creating an account, making a booking, or using any part of our platform, you confirm that
                you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>

            <div className="px-8 sm:px-12 py-12 space-y-12">

              <Section id="acceptance" icon={<FileText className="w-5 h-5" />} title="1. Acceptance of Terms">
                <p>
                  These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your")
                  and Shubham Venue ("we," "us," or "our"), governing your access to and use of our website located at
                  shubhamvenue.com and all associated services, features, and content.
                </p>
                <p>
                  If you are using our services on behalf of an organisation, you represent and warrant that you have the
                  authority to bind that organisation to these Terms. In that case, "you" refers to both you individually and
                  the organisation.
                </p>
                <p>
                  If you do not agree to these Terms, you must immediately discontinue your use of the platform. Users under
                  the age of 18 must have a parent or legal guardian review and accept these Terms before using the platform.
                </p>
              </Section>

              <Divider />

              <Section id="services" icon={<Building2 className="w-5 h-5" />} title="2. Our Services">
                <p>
                  Shubham Venue operates a venue booking and event management platform based in Waling, Syangja, Gandaki
                  Province, Nepal. Our services include:
                </p>
                <ul className="list-none space-y-3 mt-4">
                  {[
                    ["Venue Discovery", "Browse and explore our available event halls with capacity, pricing, and availability information."],
                    ["Online Booking", "Reserve venue time slots for private events, weddings, corporate functions, and celebrations."],
                    ["Menu & Catering", "Select catering packages and menu options to accompany your event booking."],
                    ["Decoration Packages", "Add decoration schemes and customisations to your event."],
                    ["Event Ticketing", "Approved event organisers may publish and sell tickets to public events hosted at our venue."],
                    ["Organiser Hub", "A dedicated portal for verified event organisers to manage events, attendees, and analytics."],
                  ].map(([label, desc]) => (
                    <li key={label} className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C0A04C] shrink-0" />
                      <span><strong className="text-[#3a1224]">{label}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4">
                  We reserve the right to modify, suspend, or discontinue any aspect of our services at any time, with
                  reasonable notice where practicable. We are not liable to you or any third party for any modification,
                  suspension, or discontinuation of services.
                </p>
              </Section>

              <Divider />

              <Section id="accounts" icon={<Users className="w-5 h-5" />} title="3. User Accounts">
                <p>
                  To access most features of our platform, you must register for an account. You agree to:
                </p>
                <ul className="list-none space-y-2 mt-3">
                  {[
                    "Provide accurate, current, and complete information during registration.",
                    "Maintain the security of your password and immediately notify us of any unauthorised account access.",
                    "Accept responsibility for all activity that occurs under your account.",
                    "Not share your account credentials with any third party.",
                    "Not create more than one personal account.",
                    "Not use another user's account without permission.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C0A04C] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Highlight>
                  <strong>Single Session Policy:</strong> For security, we enforce one active login session per account.
                  Signing in on a new device automatically terminates all previous sessions. We recommend logging out
                  from shared devices after each use.
                </Highlight>
                <p>
                  You may register using your email address and a password, or via Google OAuth. Users who register via
                  Google OAuth cannot use the password reset feature; access is managed through your Google account.
                </p>
              </Section>

              <Divider />

              <Section id="booking" icon={<CreditCard className="w-5 h-5" />} title="4. Booking Process & Payments">
                <h3 className="text-base font-bold text-[#3a1224] mb-3">4.1 Reservation Process</h3>
                <p>
                  When you select a venue, date, and time slot, a provisional hold is placed on that slot for a limited
                  period (typically 5 minutes) while you complete your booking. This hold is not a confirmed booking.
                </p>
                <p className="mt-3">
                  A booking is only confirmed once full payment is received (or, for cash bookings, once the reservation is
                  administratively confirmed). Availability is subject to change until confirmation is complete.
                </p>

                <h3 className="text-base font-bold text-[#3a1224] mt-6 mb-3">4.2 Payment Terms</h3>
                <ul className="list-none space-y-2">
                  {[
                    "All prices displayed on the platform are in Nepalese Rupees (NPR) and inclusive of applicable charges unless stated otherwise.",
                    "Payment must be completed within the reservation window to secure your booking.",
                    "We accept online payment through our authorised payment gateway (Khalti) and cash on arrival where offered.",
                    "Online payments are processed securely. We do not store your full payment card details on our servers.",
                    "A booking confirmation email will be sent to your registered email address upon successful payment.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C0A04C] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-base font-bold text-[#3a1224] mt-6 mb-3">4.3 Cash on Arrival</h3>
                <p>
                  Where the cash-on-arrival option is available, your booking will remain in a "Pending" status until
                  payment is received and manually confirmed by our staff. We reserve the right to release the slot if
                  payment is not received within a reasonable timeframe before the event date.
                </p>

                <h3 className="text-base font-bold text-[#3a1224] mt-6 mb-3">4.4 Slot Conflict & Availability</h3>
                <p>
                  We use automated conflict detection to prevent double bookings. A whole-day booking blocks all other
                  slots for that date. Individual time-slot bookings (Morning, Evening) block only the reserved slot
                  and any subsequent whole-day requests. Confirmed bookings take precedence; we are not liable for
                  provisional holds that expire due to incomplete payment.
                </p>
              </Section>

              <Divider />

              <Section id="cancellation" icon={<CalendarX className="w-5 h-5" />} title="5. Cancellation & Refund Policy">
                <Highlight variant="warning">
                  All cancellation requests must be submitted in writing via email to{" "}
                  <a href="mailto:bookings@shubhamvenue.com" className="text-[#C0A04C] hover:underline font-semibold">
                    bookings@shubhamvenue.com
                  </a>{" "}
                  or through your account portal.
                </Highlight>

                <div className="mt-6 overflow-hidden rounded-xl border border-[#3a1224]/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#3a1224]/5">
                        <th className="text-left px-5 py-3 font-black text-[10px] uppercase tracking-widest text-[#3a1224]/60">Notice Period Before Event</th>
                        <th className="text-left px-5 py-3 font-black text-[10px] uppercase tracking-widest text-[#3a1224]/60">Refund Eligibility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3a1224]/8">
                      {[
                        ["30+ days", "Full refund (less processing fee)"],
                        ["15–29 days", "50% refund"],
                        ["7–14 days", "25% refund"],
                        ["Less than 7 days", "No refund (credit note may be considered)"],
                        ["No-show", "No refund"],
                      ].map(([period, refund]) => (
                        <tr key={period} className="hover:bg-[#fdfaf6]/80">
                          <td className="px-5 py-3 font-semibold text-[#3a1224]">{period}</td>
                          <td className="px-5 py-3 text-[#3a1224]/70">{refund}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="mt-5">
                  Refunds, where applicable, will be processed within 7–14 business days to the original payment method.
                  Processing fees charged by payment gateways are non-refundable. We reserve the right to cancel a booking
                  due to force majeure or extraordinary circumstances; in such cases a full refund will be issued.
                </p>
              </Section>

              <Divider />

              <Section id="organizers" icon={<Building2 className="w-5 h-5" />} title="6. Event Organisers">
                <p>
                  The Organiser Hub is available to users who have submitted and received approval for an organiser request.
                  By becoming an organiser on our platform, you additionally agree to:
                </p>
                <ul className="list-none space-y-2 mt-4">
                  {[
                    "Provide accurate event information including title, description, date, venue, and ticket details before event approval.",
                    "Comply with all applicable laws and regulations for conducting public events in Nepal, including obtaining any necessary permits or licences.",
                    "Not misrepresent the nature, scale, or content of your event.",
                    "Handle attendee data responsibly and in accordance with our Privacy Policy.",
                    "Accept that all public events are subject to our review and approval process before tickets may be sold.",
                    "Acknowledge that we may suspend or remove events that violate community standards, applicable law, or these Terms.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C0A04C] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4">
                  Organisers are solely responsible for the events they host. We act as a platform and venue provider only,
                  not a co-organiser. We are not liable for any act or omission of an event organiser.
                </p>
              </Section>

              <Divider />

              <Section id="conduct" icon={<ShieldAlert className="w-5 h-5" />} title="7. Acceptable Use">
                <p>You agree not to use the platform to:</p>
                <ul className="list-none space-y-2 mt-3">
                  {[
                    "Violate any applicable laws or regulations, including those of Nepal.",
                    "Transmit any content that is unlawful, harmful, threatening, abusive, defamatory, or otherwise objectionable.",
                    "Impersonate any person or entity, or falsely state your affiliation with any person or entity.",
                    "Submit false, inaccurate, or misleading information including in booking forms or event submissions.",
                    "Attempt to gain unauthorised access to any part of the platform, server, or network.",
                    "Use automated scripts, bots, or crawlers to extract data or make bulk requests.",
                    "Engage in fraudulent transactions, including chargebacks made in bad faith.",
                    "Harass, threaten, or intimidate other users, staff, or venue guests.",
                    "Upload or transmit viruses or any other malicious code.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C0A04C] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4">
                  Violations of this policy may result in immediate account suspension or termination without refund.
                </p>
              </Section>

              <Divider />

              <Section id="ip" icon={<FileText className="w-5 h-5" />} title="8. Intellectual Property">
                <p>
                  All content on this platform — including text, images, graphics, logos, software, and design — is the
                  exclusive property of Shubham Venue or its licensors and is protected under applicable intellectual
                  property laws. You are granted a limited, non-exclusive, non-transferable licence to access and use the
                  platform solely for personal, non-commercial purposes.
                </p>
                <p className="mt-3">
                  You may not copy, reproduce, distribute, modify, create derivative works from, publicly display, or
                  exploit any content from our platform without our express prior written consent. Requests for commercial
                  licensing should be directed to <a href="mailto:legal@shubhamvenue.com" className="text-[#C0A04C] hover:underline">legal@shubhamvenue.com</a>.
                </p>
                <p className="mt-3">
                  Content that you submit to the platform (such as event descriptions or profile information) remains your
                  property. However, by submitting content, you grant us a worldwide, royalty-free licence to use, display,
                  and distribute that content in connection with the operation of our services.
                </p>
              </Section>

              <Divider />

              <Section id="liability" icon={<Scale className="w-5 h-5" />} title="9. Limitation of Liability">
                <p>
                  To the maximum extent permitted by the laws of Nepal, Shubham Venue, its directors, employees, partners,
                  agents, and licensors shall not be liable for any:
                </p>
                <ul className="list-none space-y-2 mt-3">
                  {[
                    "Indirect, incidental, special, consequential, or punitive damages.",
                    "Loss of profits, revenue, data, business opportunity, or goodwill.",
                    "Damages resulting from unauthorised access to, or alteration of, your data.",
                    "Damages arising from the conduct or events of third-party event organisers.",
                    "Service interruptions, errors, or delays beyond our reasonable control.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C0A04C] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4">
                  Our total aggregate liability for any claim arising out of or relating to these Terms shall not exceed the
                  total amount you paid to us in the 12 months preceding the event giving rise to the claim. Some
                  jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities; in those
                  cases our liability is limited to the maximum extent permitted by law.
                </p>
              </Section>

              <Divider />

              <Section id="indemnification" icon={<ShieldAlert className="w-5 h-5" />} title="10. Indemnification">
                <p>
                  You agree to defend, indemnify, and hold harmless Shubham Venue and its affiliates, officers, directors,
                  employees, and agents from and against any claims, liabilities, damages, judgements, awards, losses,
                  costs, or expenses (including reasonable legal fees) arising out of or relating to:
                </p>
                <ul className="list-none space-y-2 mt-3">
                  {[
                    "Your use of the platform in violation of these Terms.",
                    "Your violation of any applicable law or the rights of any third party.",
                    "Any content you submit, post, or transmit through the platform.",
                    "Any event you organise using our venue or ticketing services.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C0A04C] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Divider />

              <Section id="termination" icon={<Users className="w-5 h-5" />} title="11. Account Termination">
                <p>
                  You may close your account at any time by contacting our support team. We reserve the right to suspend or
                  permanently terminate your account, with or without notice, if we determine in our sole discretion that you:
                </p>
                <ul className="list-none space-y-2 mt-3">
                  {[
                    "Have violated any provision of these Terms.",
                    "Have engaged in fraudulent, abusive, or illegal activity.",
                    "Have placed a chargeback or payment dispute in bad faith.",
                    "Pose a risk to the safety or security of other users or our platform.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C0A04C] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4">
                  Upon termination, your right to use the platform ceases immediately. Confirmed bookings with future dates
                  at the time of account termination will be honoured unless the termination was due to fraud or
                  misrepresentation. We will retain data as required by law or our Privacy Policy after account closure.
                </p>
              </Section>

              <Divider />

              <Section id="modifications" icon={<FileText className="w-5 h-5" />} title="12. Modifications to Terms">
                <p>
                  We may revise these Terms at any time. When we make material changes, we will notify you by email to your
                  registered address or by displaying a prominent notice on the platform at least 14 days before the changes
                  take effect. Your continued use of the platform after the effective date of revised Terms constitutes your
                  acceptance of the new Terms.
                </p>
                <p className="mt-3">
                  We encourage you to review these Terms periodically. The "Last updated" date at the top of this page
                  indicates when the Terms were most recently revised.
                </p>
              </Section>

              <Divider />

              <Section id="governing" icon={<Gavel className="w-5 h-5" />} title="13. Governing Law & Dispute Resolution">
                <p>
                  These Terms are governed by and construed in accordance with the laws of the Federal Democratic Republic
                  of Nepal, without regard to conflict-of-law principles. You irrevocably agree to submit to the exclusive
                  jurisdiction of the courts located in Syangja District, Gandaki Province, Nepal for the resolution of any
                  disputes arising out of or relating to these Terms or the use of our platform.
                </p>
                <p className="mt-3">
                  Before initiating any formal legal proceedings, both parties agree to attempt to resolve disputes through
                  good-faith negotiation. If negotiation fails within 30 days, either party may pursue their legal remedies.
                </p>
              </Section>

              <Divider />

              <Section id="contact" icon={<FileText className="w-5 h-5" />} title="14. Contact Us">
                <p>
                  If you have any questions, concerns, or complaints about these Terms of Service, please contact us through
                  any of the following channels:
                </p>
                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "Legal Enquiries", value: "legal@shubhamvenue.com", href: "mailto:legal@shubhamvenue.com" },
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
                  <Link href="/privacy" className="text-[#C0A04C] hover:underline font-semibold">
                    Privacy Policy
                  </Link>{" "}
                  for information on how we handle your personal data.
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
