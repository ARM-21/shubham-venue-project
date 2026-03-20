import React from 'react'

export default function Branding({className}) {
    return (
        <div className={`w-full hidden min-[1015px]:block lg:w-1/2 max-w-2xl mb-8 lg:mb-0 lg:pr-12 text-center lg:text-left`}>
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100">
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#42162a] mb-4 leading-tight">
                        Shubham Venue
                    </h1>
                    <p className="text-xl text-gray-600 font-light mb-6">
                        Where Celebrations Come to Life
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-[#502538] rounded-full flex items-center justify-center mr-4 shadow-md">
                            <span className="text-white text-lg font-bold">✓</span>
                        </div>
                        <div>
                            <h3 className="text-black font-semibold text-lg">Premium Venue</h3>
                            <p className="text-gray-600">Luxurious event spaces for all occasions</p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-[#502538] rounded-full flex items-center justify-center mr-4 shadow-md">
                            <span className="text-white text-lg font-bold">✓</span>
                        </div>
                        <div>
                            <h3 className="text-black font-semibold text-lg">Expert Planning</h3>
                            <p className="text-gray-600">Professional event coordination</p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-[#502538]   rounded-full flex items-center justify-center mr-4 shadow-md">
                            <span className="text-white text-lg font-bold">✓</span>
                        </div>
                        <div>
                            <h3 className="text-black font-semibold text-lg">Memorable Events</h3>
                            <p className="text-gray-600">Create unforgettable moments</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial */}
                <div className="mt-8 p-6 bg-gray-50 rounded-xl border-l-4 border-[#502538]">
                    <p className="text-gray-700 italic">"The perfect venue for our wedding celebration. Exceptional service and beautiful ambiance!"</p>
                    <p className="text-[#502538]font-semibold mt-2">- Happy Customer</p>
                </div>
            </div>
        </div>
    )
}