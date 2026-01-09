import React from 'react'

export default function BookingSummary({hall, bookingData, calculateTotal}) {
  return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Hall</p>
                <p className="font-semibold">{hall.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-semibold">{bookingData.date}</p>
              </div>
              <div>
                <p className="text-gray-600">Slot</p>
                <p className="font-semibold capitalize">{bookingData.slot}</p>
              </div>
              <div>
                <p className="text-gray-600">Guests</p>
                <p className="font-semibold">{bookingData.guests}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-[#66213f]">
                  NPR {calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
  )
}
