"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "config/routes";

// Sample gallery data - replace with actual images
const GALLERY_IMAGES = [
  { id: 1, title: "Elegant Wedding Setup", category: "Weddings", image: "/assets/business-images/gallery/wedding-1.jpg" },
  { id: 2, title: "Grand Ballroom", category: "Venues", image: "/assets/business-images/gallery/ballroom.jpg" },
  { id: 3, title: "Corporate Gala", category: "Corporate", image: "/assets/business-images/gallery/corporate.jpg" },
  { id: 4, title: "Reception Hall", category: "Venues", image: "/assets/business-images/gallery/reception.jpg" },
  { id: 5, title: "Decoration Artistry", category: "Decorations", image: "/assets/business-images/gallery/decor.jpg" },
  { id: 6, title: "Birthday Celebration", category: "Birthdays", image: "/assets/business-images/gallery/birthday.jpg" },
  { id: 7, title: "Engagement Ceremony", category: "Engagements", image: "/assets/business-images/gallery/engagement.jpg" },
  { id: 8, title: "Outdoor Venue", category: "Venues", image: "/assets/business-images/gallery/outdoor.jpg" },
  { id: 9, title: "Culinary Showcase", category: "Catering", image: "/assets/business-images/gallery/cuisine.jpg" },
  { id: 10, title: "Entrance Design", category: "Decorations", image: "/assets/business-images/gallery/entrance.jpg" },
  { id: 11, title: "Banquet Setup", category: "Venues", image: "/assets/business-images/gallery/banquet.jpg" },
  { id: 12, title: "Evening Ambiance", category: "Decorations", image: "/assets/business-images/gallery/ambiance.jpg" },
];

const CATEGORIES = ["All", "Weddings", "Venues", "Corporate", "Decorations", "Birthdays", "Engagements", "Catering"];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredImages = selectedCategory === "All" 
    ? GALLERY_IMAGES 
    : GALLERY_IMAGES.filter(img => img.category === selectedCategory);

  const handleImageClick = (index) => {
    setSelectedImage(filteredImages[index]);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(filteredImages[nextIndex]);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(filteredImages[prevIndex]);
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] relative overflow-hidden">
      {/* Dark Gradient Header Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/80 to-transparent pointer-events-none z-0" />

      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-40 pb-20 relative z-10">
        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-[#C0A04C]" />
            <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Visual Showcase</span>
          </div>
          <div>
            <h1 className="text-6xl lg:text-8xl font-display font-bold text-white mb-6 leading-[0.9]">
              Grand <span className="text-[#C0A04C] italic font-serif">Gallery</span>
            </h1>
            <p className="text-white/70 text-lg font-light leading-relaxed max-w-2xl">
              Explore our collection of beautifully decorated venues and stunning event moments from celebrations hosted at Shubham.
            </p>
          </div>
        </header>

        {/* Category Filter */}
        <div className="mb-16 flex flex-wrap gap-3">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setSelectedImage(null);
              }}
              className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                selectedCategory === category
                  ? "bg-[#C0A04C] text-[#3a1224] shadow-lg shadow-[#C0A04C]/30"
                  : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              onClick={() => handleImageClick(index)}
              className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Image
                src={image.image}
                alt={image.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white font-bold text-lg mb-1">{image.title}</h3>
                <p className="text-[#C0A04C] text-xs font-semibold uppercase tracking-widest">{image.category}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center py-12 border-t border-white/10">
          <h3 className="text-2xl font-display font-bold text-[#3a1224] mb-4">Ready to Create Your Perfect Event?</h3>
          <Link
            href={ROUTES.SITE.VENUES()}
            className="inline-block px-8 py-4 bg-[#3a1224] text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-[#3a1224]/30 transition-all"
          >
            Explore Venues
          </Link>
        </div>
      </main>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-[#C0A04C] transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Image */}
            <div className="relative h-[60vh] mb-4">
              <Image
                src={selectedImage.image}
                alt={selectedImage.title}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>

            {/* Info */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h3>
              <p className="text-[#C0A04C] font-bold">{selectedImage.category}</p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePrev}
                className="p-2 text-white hover:text-[#C0A04C] transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <span className="text-white font-bold">
                {currentIndex + 1} / {filteredImages.length}
              </span>
              <button
                onClick={handleNext}
                className="p-2 text-white hover:text-[#C0A04C] transition-colors"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
