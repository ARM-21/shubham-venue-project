import React from 'react'
import axios from '@/lib/axios';


export async function generateMetadata({params}) {
    const { slug } = await params;
    
    try {
        const response = await axios.get(`/api/v1/halls/${slug}`);
        const venue = response.data.hall;

        return {
            title: venue.name,
            description: venue.description,
        };
    } catch (error) {
        return {
            title: 'Venue Details',
            description: 'Loading venue information...',
        };
    }
}

export default function layout({ children }) {
  return (
    <div>
      {children}
    </div>
  )
}
