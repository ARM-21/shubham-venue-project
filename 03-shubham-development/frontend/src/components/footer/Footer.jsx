import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from 'config/routes';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#3a1224] text-[#E5E7EB] pt-24 pb-12 overflow-hidden w-full">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C0A04C] to-transparent opacity-30" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C0A04C] rounded-full blur-[120px] opacity-10" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C0A04C] rounded-full blur-[120px] opacity-10" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand Identity Section */}
          <div className="lg:col-span-4 space-y-8">
            <Link href={ROUTES.HOME} className="inline-flex items-center gap-4 group">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/10 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                <Image
                  src="/assets/business-icons/video.gif"
                  alt="Shubham Palace"
                  width={48}
                  height={48}
                  className="relative z-10 brightness-110"
                  unoptimized
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-white">SHUBHAM</span>
                <span className="text-xs tracking-[0.3em] text-[#C0A04C] font-semibold">VENUE</span>
              </div>
            </Link>
            
            <p className="text-lg text-gray-400 leading-relaxed font-medium max-w-sm">
              Crafting extraordinary moments with timeless elegance and unparalleled hospitality since 2015.
            </p>

            <div className="flex items-center gap-4">
              <SocialIcon icon={Facebook} href="https://facebook.com" />
              <SocialIcon icon={Instagram} href="https://instagram.com" />
              <SocialIcon icon={Twitter} href="https://twitter.com" />
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
            
            {/* Discovery Column */}
            <div className="space-y-6">
              <h4 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C0A04C]" />
                Discovery
              </h4>
              <ul className="space-y-4">
                <FooterLink href={ROUTES.SITE.VENUES()} label="Luxury Venues" />
                <FooterLink href="/menus" label="Royal Cuisines" />
                <FooterLink href="/gallery" label="Grand Gallery" />
                <FooterLink href="/about" label="Our Heritage" />
                <FooterLink href="/contact" label="Get in Touch" />
              </ul>
            </div>

            {/* Specialities Column */}
            <div className="space-y-6">
              <h4 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-[#C0A04C]" />
                Event Types
              </h4>
              <ul className="space-y-4">
                <FooterLink href={`${ROUTES.SITE.VENUES()}?type=wedding`} label="Royal Weddings" />
                <FooterLink href={`${ROUTES.SITE.VENUES()}?type=corporate`} label="Corporate Galas" />
                <FooterLink href={`${ROUTES.SITE.VENUES()}?type=birthday`} label="Grand Birthdays" />
                <FooterLink href={`${ROUTES.SITE.VENUES()}?type=engagement`} label="Engagements" />
                <FooterLink href={`${ROUTES.SITE.VENUES()}?type=seminar`} label="Seminars" />
              </ul>
            </div>

            {/* Concierge Column */}
            <div className="col-span-2 md:col-span-1 space-y-6">
              <h4 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C0A04C]" />
                Location
              </h4>
              <div className="space-y-6">
                <address className="not-italic text-gray-400 leading-relaxed group cursor-default">
                  <span className="block text-white font-semibold">Nepal Headquarters</span>
                  BP Road, Waling-08, Syangja<br />
                  Gandaki Province, 33800
                </address>

                <div className="space-y-3">
                  <a href="tel:+9779812345678" className="flex items-center gap-3 text-gray-400 hover:text-[#C0A04C] transition-colors group">
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#C0A04C]/10">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">+977 9812345678</span>
                  </a>
                  <a href="mailto:contact@shubham-venue.me" className="flex items-center gap-3 text-gray-400 hover:text-[#C0A04C] transition-colors group">
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#C0A04C]/10">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">contact@shubham-venue.me</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-sm text-gray-500 font-medium">
            <p>© {currentYear} Shubham Venue. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 group">
            <ShieldCheck className="w-4 h-4 text-[#C0A04C]" />
            <span className="text-xs text-gray-400 font-bold tracking-tight">SECURE BOOKING SYSTEM</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }) {
  return (
    <li>
      <Link 
        href={href} 
        className="text-gray-400 hover:text-[#C0A04C] transition-all duration-300 flex items-center group gap-0 hover:gap-2"
      >
        <span className="w-0 group-hover:w-4 h-[1px] bg-[#C0A04C] transition-all duration-300" />
        <span className="text-sm font-medium">{label}</span>
      </Link>
    </li>
  );
}

function SocialIcon({ icon: Icon, href }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/70 hover:text-[#C0A04C] hover:bg-[#C0A04C]/10 hover:border-[#C0A04C]/30 transition-all duration-300 active:scale-90"
    >
      <Icon className="w-5 h-5" />
    </a>
  );
}
