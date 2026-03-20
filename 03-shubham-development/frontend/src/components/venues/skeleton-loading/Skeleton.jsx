import React from 'react'
import Image from 'next/image';
export default function Skeleton() {

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map((_, i) => (
                <div  key={i} className="max-w-sm border border-gray-300 rounded-lg p-4">
                    <div className="animate-pulse w-full bg-gray-300 h-48 rounded-lg mb-5 flex justify-center items-center">
                      <Image src="/assets/utils-icons/skeleton-img.svg" alt="loading" width={40} height={40} className="object-contain" />
                    </div>
                    <div className="w-full flex justify-between items-start animate-pulse">
                        <div className="block">
                            <h3 className="h-3 bg-gray-300 rounded-full w-48 mb-4"></h3>
                            <p className="h-2 bg-gray-300 rounded-full w-32 mb-2.5"></p>
                        </div>
                        <span className="h-2 bg-gray-300 rounded-full w-16 "></span>
                    </div>
                </div>
            ))}
        </div>
    )
}
