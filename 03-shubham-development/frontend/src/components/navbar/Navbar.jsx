'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from 'contexts/AuthProvider';
import { 
  House, 
  Info, 
  Images, 
  Contact, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  User, 
  Ticket, 
  LayoutDashboard, 
  ShieldCheck,
  Menu as MenuIcon,
  X,
  Sparkles,
  Calendar,
  BookOpen
} from "lucide-react";
import { ROUTES } from 'config/routes';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: 'Home', href: ROUTES.HOME, icon: House },
  { name: 'Venues', href: ROUTES.SITE.VENUES(), icon: Images },
  { name: 'Events', href: ROUTES.SITE.EVENTS, icon: Calendar },
  { name: 'Blogs', href: ROUTES.SITE.BLOGS, icon: BookOpen },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Contact', href: '/contact', icon: Contact },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setProfileOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setProfileOpen(false);
      router.push(ROUTES.AUTH.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, router]);

  return (
    <header 
      className={`fixed top-[41px] left-0 right-0 z-[100] transition-all duration-700 ${
        isScrolled 
          ? 'py-3 -translate-y-[41px] bg-[#3a1224]/95 backdrop-blur-2xl border-b border-[#C0A04C]/30 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]' 
          : 'py-6 bg-transparent'
      }`}
    >
      <nav className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="group flex items-center gap-3 relative z-10">
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Dynamic Ring on Scroll */}
            <div className={`absolute inset-0 bg-[#C0A04C] rounded-xl transition-all duration-500 ${
              isScrolled ? 'rotate-45 opacity-40 scale-90' : 'rotate-6 opacity-20'
            }`} />
            <Image
              src="/assets/business-icons/video.gif"
              alt="Logo"
              width={40}
              height={40}
              className={`relative z-10 transition-transform duration-500 ${isScrolled ? 'scale-90' : 'scale-100'}`}
              unoptimized
            />
          </div>
          <div className="flex flex-col">
            <span className={`font-bold tracking-tighter text-white leading-none transition-all duration-500 ${isScrolled ? 'text-lg' : 'text-xl'}`}>
              SHUBHAM
            </span>
            <span className={`tracking-[0.2em] text-[#C0A04C] font-semibold transition-all duration-500 ${isScrolled ? 'text-[8px]' : 'text-[10px]'}`}>
              VENUE
            </span>
          </div>
        </Link>

        {/* Dynamic Center Message on Scroll */}
        <div className={`absolute left-1/2 -translate-x-1/2 hidden xl:flex items-center gap-2 transition-all duration-700 ${
          isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#C0A04C]/50" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C0A04C] font-bold whitespace-nowrap">
            Experience the Extraordinary
          </span>
          <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#C0A04C]/50" />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    pathname === item.href 
                      ? 'text-[#C0A04C]' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {pathname === item.href && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-white/10 rounded-full border border-white/10"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link 
            href={ROUTES.SITE.VENUES()}
            className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-[#C0A04C] hover:bg-[#D4B563] text-[#3a1224] rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-[#C0A04C]/20 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Book Now
          </Link>

          {!user ? (
            <Link
              href={ROUTES.AUTH.ROOT}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-all border border-white/10"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="group flex items-center gap-3 pl-3 pr-2 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all active:scale-95"
              >
                <div className="relative">
                  {user.profilePicture ? (
                    <Image 
                      src={user.profilePicture} 
                      alt="Profile" 
                      width={32} 
                      height={32} 
                      className="rounded-full ring-2 ring-[#C0A04C]/50 object-cover" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#C0A04C] flex items-center justify-center text-[#3a1224] font-bold text-sm">
                      {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#3a1224] rounded-full" />
                </div>
                <div className="hidden md:flex flex-col items-start leading-none gap-0.5">
                  <span className="text-xs font-bold text-white group-hover:text-[#C0A04C] transition-colors">
                    {user.username || 'My Account'}
                  </span>
                  <span className="text-[10px] text-white/50">{user.role || 'Guest'}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-[#1a1a1a] border border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden backdrop-blur-xl z-[110]"
                  >
                    <div className="p-4 bg-white/5 border-b border-white/10">
                      <p className="text-sm font-bold text-white truncate">{user.email}</p>
                      <p className="text-[10px] text-[#C0A04C] font-semibold uppercase tracking-wider mt-0.5">
                        {user.role || 'Verified Member'}
                      </p>
                    </div>

                    <div className="p-2">
                      <ProfileLink 
                        icon={User} 
                        label="My Profile" 
                        href={ROUTES.SITE.PROFILE} 
                        onClick={() => setProfileOpen(false)} 
                      />
                      <ProfileLink 
                        icon={Ticket} 
                        label="My Tickets" 
                        href={ROUTES.SITE.TICKETS} 
                        onClick={() => setProfileOpen(false)} 
                      />
                      <ProfileLink 
                        icon={LayoutDashboard} 
                        label="Organizer Dashboard" 
                        href={ROUTES.SITE.ORGANIZER} 
                        onClick={() => setProfileOpen(false)} 
                      />
                      
                      {user?.role?.toLowerCase() === 'admin' && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <ProfileLink 
                            icon={ShieldCheck} 
                            label="Admin Control" 
                            href={ROUTES.ADMIN.DASHBOARD} 
                            onClick={() => setProfileOpen(false)} 
                            className="text-[#C0A04C] hover:bg-[#C0A04C]/10"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/10"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 bg-white/5 rounded-xl border border-white/10 text-white active:scale-95 transition-all"
          >
            {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#3a1224] border-t border-white/10 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white/70 hover:text-[#C0A04C] hover:bg-white/10 transition-all border border-white/5"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-lg font-semibold">{item.name}</span>
                </Link>
              ))}
              <Link
                href={ROUTES.SITE.VENUES()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#C0A04C] text-[#3a1224] font-bold shadow-xl"
              >
                <Sparkles size={20} />
                Plan Your Event
              </Link>

              {/* Mobile Auth Actions */}
              {!user ? (
                <Link
                  href={ROUTES.AUTH.ROOT}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold border border-white/10 transition-all"
                >
                  <LogIn size={20} />
                  Sign In
                </Link>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function ProfileLink({ icon: Icon, label, href, onClick, className = "" }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all ${className}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
