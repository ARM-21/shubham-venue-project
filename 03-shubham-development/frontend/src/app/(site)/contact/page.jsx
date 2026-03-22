"use client";

import React from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  ArrowRight,
  Clock
} from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Top Banner */}
      <section className="bg-[#3a1224] pt-40 pb-20 px-6 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase">Get in Touch</h1>
        <p className="text-gray-300 max-w-xl mx-auto">
          We are here to help you plan your perfect event. Send us a message or call us anytime.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Information Side */}
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm space-y-12">
              <h2 className="text-2xl font-black text-[#3a1224] uppercase">Our Office</h2>
              
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="bg-[#3a1224] p-4 rounded-xl text-[#C0A04C]">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#3a1224] uppercase text-xs mb-1">Address</h4>
                    <p className="text-gray-500 text-sm">Waling, Syangja, Gandaki Province, Nepal</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="bg-[#3a1224] p-4 rounded-xl text-[#C0A04C]">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#3a1224] uppercase text-xs mb-1">Call Us</h4>
                    <p className="text-gray-500 text-sm">+977 123 4567890</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="bg-[#3a1224] p-4 rounded-xl text-[#C0A04C]">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#3a1224] uppercase text-xs mb-1">Email</h4>
                    <p className="text-gray-500 text-sm">hello@shubham.com</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="bg-[#3a1224] p-4 rounded-xl text-[#C0A04C]">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#3a1224] uppercase text-xs mb-1">Office Hours</h4>
                    <p className="text-gray-500 text-sm">Sun - Fri: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-[#3a1224] uppercase mb-10">Send a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter name"
                    className="w-full bg-[#FDFCFB] border border-gray-100 rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-[#C0A04C]/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Your Email</label>
                  <input 
                    type="email" 
                    placeholder="Enter email"
                    className="w-full bg-[#FDFCFB] border border-gray-100 rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-[#C0A04C]/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">What are you looking for?</label>
                <select className="w-full bg-[#FDFCFB] border border-gray-100 rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-[#C0A04C]/20 outline-none uppercase font-bold text-[#3a1224]">
                  <option>Booking a Venue</option>
                  <option>Party Planning</option>
                  <option>Work Meeting</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Message</label>
                <textarea 
                  rows="5"
                  placeholder="Tell us about your event..."
                  className="w-full bg-[#FDFCFB] border border-gray-100 rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-[#C0A04C]/20 outline-none resize-none"
                ></textarea>
              </div>

              <button className="w-full bg-[#3a1224] text-white py-5 rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#C0A04C] hover:text-[#3a1224] transition-all flex items-center justify-center gap-3 shadow-lg">
                Send Message <Send size={16} />
              </button>
            </form>
          </div>

        </div>
      </main>

      {/* Map Section */}
      <section className="h-96 bg-gray-200 flex items-center justify-center border-t border-gray-100">
        <div className="text-center">
          <MapPin size={48} className="text-[#3a1224] mx-auto mb-4" />
          <p className="text-sm font-bold uppercase text-[#3a1224]">Waling Center, Nepal</p>
        </div>
      </section>
    </div>
  );
}
