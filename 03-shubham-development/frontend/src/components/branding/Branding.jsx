import React from 'react'

export default function Branding({className}) {
    return (
        <div className={`w-full hidden min-[1015px]:block lg:w-1/2 pr-12`}>
            <div className="relative">
                <span className="text-[12px] font-black text-[#C0A04C] uppercase tracking-[0.5em] mb-4 block">Luxury Experience</span>
                <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-[1.1]">
                    Create <br />
                    Celebrate <br />
                    <span className="text-[#3a1224] bg-[#C0A04C] px-2 rounded-sm italic">Unite</span>
                </h1>
                
                <p className="text-xl text-white/50 font-light mb-12 max-w-md leading-relaxed">
                    Simple events, extraordinary memories. <br />
                    Book your favorite venue in seconds.
                </p>

                <div className="grid grid-cols-2 gap-8 pr-12">
                    <div className="group">
                        <div className="text-3xl font-display font-bold text-white mb-1">50+</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#C0A04C] font-bold">Premium Venues</div>
                    </div>
                    <div className="group">
                        <div className="text-3xl font-display font-bold text-white mb-1">10k+</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#C0A04C] font-bold">Happy Guests</div>
                    </div>
                    <div className="group">
                        <div className="text-3xl font-display font-bold text-white mb-1">100%</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#C0A04C] font-bold">Safe Booking</div>
                    </div>
                    <div className="group">
                        <div className="text-3xl font-display font-bold text-white mb-1">24/7</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#C0A04C] font-bold">Guest Support</div>
                    </div>
                </div>

                <div className="mt-16 flex items-center gap-4 text-white/30 italic font-display text-sm">
                    <span className="h-[1px] w-8 bg-white/20"></span>
                    "Simply the best platform for events"
                </div>
            </div>
        </div>
    )
}