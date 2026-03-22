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
    <div className="w-full h-full relative group min-h-[500px] md:min-h-[650px]">
      <div
        className="relative w-full h-full min-h-[500px] md:min-h-[650px] overflow-hidden bg-black"
        onMouseEnter={() => {
          setAutoPlay(false);
          setShowButtons(true);
        }}
        onMouseLeave={() => {
          setAutoPlay(true);
          setShowButtons(false);
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out
              ${index === current ? "z-20 opacity-100" : "z-10 opacity-0"}
            `}
            aria-hidden={index !== current}
          >
            {/* Image with Ken Burns effect when active */}
            <div className={`w-full h-full overflow-hidden ${index === current ? 'animate-ken-burns' : ''}`}>
              <img
                src={image.image}
                alt={image.branding || image.title || `slide-${index}`}
                className="w-full h-full object-cover transform scale-100"
                draggable="false"
                onError={(e) => {
                  e.target.src = '/assets/business-images/placeholder1.jpg';
                }}
              />
            </div>

            {/* Overlay - subtle vignette to help text in Hero component */}
            <div className="absolute inset-0 bg-black/30 z-20" />
          </div>
        ))}

        {/* Navigation Buttons */}
        <div className={`absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 z-30 pointer-events-none transition-opacity duration-500 ${showButtons ? 'opacity-100' : 'opacity-0'}`}>
          <div className="pointer-events-auto">
            <SlideButton
              direction="left"
              setCurrent={setCurrent}
              length={length}
              current={current}
              showButtons={showButtons}
            />
          </div>
          <div className="pointer-events-auto">
            <SlideButton
              direction="right"
              setCurrent={setCurrent}
              length={length}
              current={current}
              showButtons={showButtons}
            />
          </div>
        </div>

        {/* Pagination Dots - Centered Pill Style */}
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-40 flex gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer pointer-events-auto ${
                index === current 
                ? "w-8 bg-[var(--gold-accent)]" 
                : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
  