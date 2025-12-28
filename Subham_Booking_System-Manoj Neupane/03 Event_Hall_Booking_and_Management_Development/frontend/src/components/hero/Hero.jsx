"use client";

import Carousel from '@/components/carousel/slider.jsx';
import { useRouter } from 'next/navigation';

export default function Hero({ images = [], interval = 4000 }) {
  const router = useRouter();

  return (
    <section className="relative w-full">
      <div className="relative">
        <Carousel images={images} interval={interval} />

        <div className="md:absolute   top-[30%] left-[30%] md:top-[100%] md:left-[50%] md:translate-x-[-50%] md:translate-y-[-50%] flex items-center justify-center  z-40">
          <div className="w-full md:max-w-2xl px-4 md:px-0 text-center">
            <div className="bg-white/95 backdrop-blur-sm flex  flex-col md:flex-row justify-center md:items-center gap-3 md:gap-6 py-4 px-6 rounded-xl shadow-md font-bold md:text-base lg:text-lg">
              <h3 className="sm:text-2xl md:text-[19px] lg:text-lg font-bold text-[#250815] mr-2">Ready to book?</h3>
              <div className="flex flex-col md:flex-row gap-3 ">
                <button
                  onClick={() => router.push('/search-availability')}
                  className="bg-[var(--maroon-primary)] text-white px-4 py-2  max-w-xl font-semibold rounded-lg hover:bg-[var(--maroon-hover)] transition cursor-pointer"
                  aria-label="View availability"
                >
                  View availability
                </button>
                <button
                  onClick={() => router.push('/venues')}
                  className="px-4 py-2 rounded-lg font-normal border border-gray-200 text-gray-700 hover:bg-gray-50 transition cursor-pointer max-w-xl"
                  aria-label="Browse halls"
                >
                  Browse halls
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
