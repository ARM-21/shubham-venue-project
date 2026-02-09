import React from 'react'

const metadata = {
  title: "Admin Dashboard",
  description: "Overview of hall bookings, revenue, and occupancy",
}

export default function layout({children}) {
  return (
    <div>
      {children}
    </div>
  )
}
