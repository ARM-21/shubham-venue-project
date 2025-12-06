import React from 'react'
export const metadata = {
  title: {
    template: '%s | Venue',
    default: 'Venue',
  },
  description: 'Explore our featured venues available for booking.',
}
export default function layout({ children }) {
  return (
    <div>
      {children}
    </div>
  )
}
