'use client';

import { useRouter } from 'next/navigation';
import { Search, PencilSquareIcon, CreditCardIcon, CheckCircleIcon, ArrowRightIcon } from 'lucide-react';
import { ROUTES } from 'config/routes';

const features = [
  {
    icon: Search,
    title: 'Search & Discover',
    description: 'Browse 50+ verified halls with photos, reviews, and real-time availability',
    action: 'Start Searching',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: PencilSquareIcon,
    title: 'Customize Everything',
    description: 'Personalize your event with custom menus, decorations, and special requirements',
    action: 'Plan Event',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: CreditCardIcon,
    title: 'Transparent Pricing',
    description: 'All-inclusive pricing with no hidden fees. Know exactly what you\'re paying for',
    action: 'View Pricing',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: CheckCircleIcon,
    title: 'Instant Confirmation',
    description: 'Get your booking confirmed in minutes with 24/7 customer support',
    action: 'Book Now',
    color: 'from-orange-500 to-orange-600'
  }
];

export default function FeatureShowcase() {
  const router = useRouter();

  const handleFeatureClick = (feature) => {
    if (feature.title === 'Search & Discover') {
      router.push(ROUTES.SITE.VENUES());
    } else if (feature.title === 'Plan Event') {
      router.push(ROUTES.SITE.VENUES());
    }
  };

  return (
    <div className="mb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#3a1224] to-[#4a172d] rounded-3xl p-12 text-center mb-12 shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4">
          Plan Your Perfect Event
        </h1>
        <p className="text-xl text-[#C0A04C] mb-8">
          Professional venue booking in 3 simple steps
        </p>
        
        <button
          onClick={() => router.push(ROUTES.SITE.VENUES())}
          className="inline-flex items-center gap-2 h-12 px-8 bg-[#C0A04C] text-[#3a1224] font-black rounded-xl hover:shadow-lg transition-all cursor-pointer"
        >
          <span>Start Planning</span>
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="group bg-white/95 border border-[#3a1224]/5 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-[#C0A04C]/30"
              onClick={() => handleFeatureClick(feature)}
            >
              {/* Icon Background */}
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl p-4 mb-6 group-hover:scale-110 transition-transform`}>
                <Icon className="w-full h-full text-white" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-display font-black text-[#3a1224] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#3a1224]/60 mb-6 leading-relaxed">
                {feature.description}
              </p>

              {/* CTA */}
              <button
                onClick={() => handleFeatureClick(feature)}
                className="w-full h-10 px-4 bg-gray-50 hover:bg-[#C0A04C] text-[#3a1224] hover:text-[#3a1224] font-black text-[9px] uppercase tracking-widest rounded-xl transition-all"
              >
                {feature.action}
              </button>
            </div>
          );
        })}
      </div>

      {/* How It Works */}
      <div className="mt-16 bg-gradient-to-r from-[#C0A04C]/10 to-[#3a1224]/10 rounded-3xl p-12">
        <h2 className="text-3xl font-display font-black text-[#3a1224] text-center mb-12">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              number: '01',
              title: 'Search',
              description: 'Browse venues matching your date, budget, and requirements'
            },
            {
              number: '02',
              title: 'Customize',
              description: 'Select your menu, decorations, and add special requests'
            },
            {
              number: '03',
              title: 'Confirm',
              description: 'Review everything and complete payment in 2 minutes'
            }
          ].map((step, idx) => (
            <div key={idx} className="text-center">
              <div className="w-16 h-16 bg-[#C0A04C] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-display font-black text-[#3a1224]">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-display font-black text-[#3a1224] mb-2">
                {step.title}
              </h3>
              <p className="text-[#3a1224]/60">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
