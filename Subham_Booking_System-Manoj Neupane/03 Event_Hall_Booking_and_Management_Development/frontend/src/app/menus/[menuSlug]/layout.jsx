import React from 'react'
export async function generateMetadata({ params }) {
    const {menuSlug} = await params;
      return {
    title: `${menuSlug}`,
    description: `Discover the details of our ${menuSlug} menu at Shubham Party Palace. Explore a curated selection of dishes designed to make your event unforgettable.`,
  }
}

export default function layout({children}) {
  return (
    <div>
      {children}
    </div>
  )
}
