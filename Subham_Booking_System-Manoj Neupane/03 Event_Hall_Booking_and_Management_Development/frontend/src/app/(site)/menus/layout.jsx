import React from 'react'
export const metadata = {
    template:  '%s | Menus',
    default: 'Menus',
    description: 'Explore our diverse range of menus for your special events at Shubham Venue. From traditional to contemporary cuisines, find the perfect menu to suit your celebration.',
}

export default function layout({children}) {
  return (
    <div>
      {children}
    </div>
  )
}
