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
            aria-label="Previous slide"
            onClick={direction === "right" ? slideRight : slideLeft}
            className={`absolute ${direction === "right" ? "right-2 " : "left-2"} ${showButtons ? " opacity-100" : "opacity-0"}  transition-opacity duration-300 ease-in top-1/2 -translate-y-1/2  z-30 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/60 cursor-pointer text-4xl`}
        >
        <span className={`m-auto flex justify-center items-center absolute -top-1 ${direction === "right" ? "right-3" : "left-3"}`}>{direction === "right" ? "›" : "‹"}</span>
            
        </button>
    )
}
