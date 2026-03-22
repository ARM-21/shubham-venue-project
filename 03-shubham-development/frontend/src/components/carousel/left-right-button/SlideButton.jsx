import React from 'react'

export default function SlideButton({ direction, onClick, setCurrent, length, current , showButtons}) {


    const slideRight = () => {
        if (length === 0) return;
        setCurrent((c) => (c === length - 1 ? 0 : c + 1));
    };

    const slideLeft = () => {
        if (length === 0) return;   
        setCurrent((c) => (c === 0 ? length - 1 : c - 1));
    };
    return (
        <button
            aria-label={direction === "right" ? "Next slide" : "Previous slide"}
            onClick={direction === "right" ? slideRight : slideLeft}
            className={`group/btn w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 hover:bg-white/20 hover:scale-110 active:scale-90 pointer-events-auto`}
        >
            <svg 
                className={`w-6 h-6 transition-transform duration-300 ${direction === "right" ? "group-hover/btn:translate-x-0.5" : "group-hover/btn:-translate-x-0.5"}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={direction === "right" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} 
                />
            </svg>
        </button>
    )
}
