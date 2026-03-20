'use client';
import { useEffect, useRef, useState } from "react";
import SlideButton from "./left-right-button/SlideButton";
import BookNow from "./slider-below-book-now/BookNow";
import { use } from "react";



export default function Carousel({ images = [], interval = 5000 }) {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showButtons, setShowButtons] = useState(false);
  const timeoutRef = useRef(null);

  const length = images.length;

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (autoPlay && length > 1) {
      timeoutRef.current = setTimeout(() => {
        setCurrent((c) => (c === length - 1 ? 0 : c + 1));
      }, interval);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, autoPlay, interval, length]);


  if (!Array.isArray(images) || length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => {
          setAutoPlay(false);
          setShowButtons(true);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
    
        onMouseLeave={() => {
          setAutoPlay(true);
          setShowButtons(false);
        }}
      >
        <div className="relative h-96 lg:h-[500px] w-full">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-transform duration-700 ease-in-out
                ${index === current ? "translate-x-0 z-20 opacity-100" : "translate-x-full z-10 opacity-0"}
              `}
              aria-hidden={index !== current}
            >
              {/* Image */}
              <img
                src={image.image}
                alt={image.branding || image.title || `slide-${index}`}
                className="w-full h-full object-cover"
                draggable="false"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end md:items-center">
                <div className="p-6 md:p-12 text-white max-w-2xl">
                  <h2 className="text-xl md:text-3xl font-semibold">{image.title}</h2>
                  {image.branding && <h3 className="text-sm md:text-lg opacity-90">{image.branding}</h3>}
                  {image.mini && <p className="mt-2 italic font-semibold">{image.mini}</p>}
                </div>
              </div>
            </div>
          ))}

          {/* Left arrow */}

          <SlideButton
            direction="left"
            setCurrent={setCurrent}
            length={length}
            current={current}
            showButtons={showButtons}
          />

          {/* Right arrow */}
          <SlideButton
            direction="right"
            setCurrent={setCurrent}
            length={length}
            current={current}
            showButtons={showButtons}
          />

          {/* Pagination dots */}
          <div className="absolute bottom-2 md:bottom-15 lg:bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                  idx === current ? "bg-white scale-125" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
            {/* <BookNow /> */}
    </div>
  );
}