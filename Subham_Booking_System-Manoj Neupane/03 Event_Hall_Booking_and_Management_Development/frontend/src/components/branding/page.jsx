import React from 'react'

export default function page({className}) {
    return (
        <div className={`w-full hidden min-[1015px]:block  lg:w-1/2 max-w-2xl mb-8 lg:mb-0 lg:pr-12 text-center lg:text-left`}>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                        Shubham Venue
                    </h1>
                    <p className="text-xl text-[#d4af37] font-light mb-6">
                        Where Celebrations Come to Life
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-[#d4af37] rounded-full flex items-center justify-center mr-4 shadow-lg">
                            <span className="text-[#250815] text-lg font-bold">✓</span>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg">Premium Venue</h3>
                            <p className="text-gray-300">Luxurious event spaces for all occasions</p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-[#d4af37] rounded-full flex items-center justify-center mr-4 shadow-lg">
                            <span className="text-[#250815] text-lg font-bold">✓</span>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg">Expert Planning</h3>
                            <p className="text-gray-300">Professional event coordination</p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-[#d4af37] rounded-full flex items-center justify-center mr-4 shadow-lg">
                            <span className="text-[#250815] text-lg font-bold">✓</span>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg">Memorable Events</h3>
                            <p className="text-gray-300">Create unforgettable moments</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial */}
                <div className="mt-8 p-6 bg-white/5 rounded-2xl border-l-4 border-[#d4af37]">
                    <p className="text-gray-300 italic">"The perfect venue for our wedding celebration. Exceptional service and beautiful ambiance!"</p>
                    <p className="text-[#d4af37] font-semibold mt-2">- Happy Customer</p>
                </div>
            </div>
        </div>

    )
}
