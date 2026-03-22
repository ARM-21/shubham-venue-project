"use client";

import React from 'react';
import { 
  History, 
  Users, 
  CheckCircle, 
  Star,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Top Section */}
      <section className="bg-[#3a1224] py-32 md:py-48 px-6 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center gap-2 mb-6 text-[#C0A04C]">
            <Star size={16} fill="currentColor" />
            <span className="text-xs font-bold uppercase tracking-widest">Our Story</span>
            <Star size={16} fill="currentColor" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-8 uppercase leading-tight">
            We Create Small Moments into <span className="text-[#C0A04C]">Big Memories</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Shubham Venues is the top choice for weddings, parties, and meetings. We offer beautiful spaces and excellent service for your special days.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-black text-[#3a1224] uppercase leading-none">
              More Than Just a <span className="text-[#C0A04C]">Space</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed italic border-l-4 border-[#C0A04C] pl-6">
              "We believe every event is special. Our goal is to provide a place that is not just a room, but a part of your celebration."
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-[#3a1224] flex items-center justify-center rounded-xl mb-4">
                  <CheckCircle className="text-[#C0A04C]" size={24} />
                </div>
                <h4 className="font-bold text-[#3a1224] uppercase mb-2">Our Mission</h4>
                <p className="text-sm text-gray-500">To help you turn your ideas into a real and beautiful event.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-[#3a1224] flex items-center justify-center rounded-xl mb-4">
                  <Star className="text-[#C0A04C]" size={24} />
                </div>
                <h4 className="font-bold text-[#3a1224] uppercase mb-2">Best Quality</h4>
                <p className="text-sm text-gray-500">We keep high standards for service and cleanliness every day.</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 aspect-square rounded-3xl flex items-center justify-center text-[#3a1224]/20 overflow-hidden shadow-xl border-4 border-white">
             <History size={120} />
          </div>
        </div>
      </section>

      {/* Simple Stats */}
      <section className="bg-[#3a1224] py-20 px-6 text-white text-center">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div>
            <p className="text-4xl font-black text-[#C0A04C] mb-2">10+</p>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Years Active</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#C0A04C] mb-2">5000+</p>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Happy Guests</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#C0A04C] mb-2">100%</p>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Trusted</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#C0A04C] mb-2">Elite</p>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Service</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl font-black text-[#3a1224] uppercase mb-8">Ready to Plan Your Event?</h2>
        <Link 
          href="/contact"
          className="bg-[#3a1224] text-white px-12 py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#C0A04C] hover:text-[#3a1224] transition-all inline-flex items-center gap-3"
        >
          Contact Us Now <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
