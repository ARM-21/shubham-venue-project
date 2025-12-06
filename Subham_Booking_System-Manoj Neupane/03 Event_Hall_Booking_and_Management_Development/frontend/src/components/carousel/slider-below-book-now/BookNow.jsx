import React from 'react'

export default function BookNow() {
    return (
        <div className="mt-6 bg-white shadow-md rounded-md p-6 text-center">
            <h1 className="text-xl md:text-2xl font-bold">Book To make your event memorable</h1>
            <div className="mt-3">
                {/* tel link uses normal anchor; Link from next is not necessary for tel */}
                <a
                    href="tel:+9779856057322"
                    className="inline-block mt-2 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Book Now
                </a>
            </div>
        </div>
    )
}
