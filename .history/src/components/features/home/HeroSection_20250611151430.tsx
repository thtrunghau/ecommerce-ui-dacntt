import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { heroSlides } from "../../../mockData/mockData";
import { Button } from "@mui/material";

const slides = heroSlides;

const currentSlide = 0;

const HeroSection: React.FC = () => {
  const [activeSlide, setActiveSlide] = React.useState(currentSlide);

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);
  return (
    <section className="relative min-h-[420px] w-full bg-gray-100 py-8">
      {/* Navigation Arrows (desktop only) - Absolutely positioned outside content */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-gray-300 p-3 md:flex"
        aria-label="Previous slide"
      >
        <FiChevronLeft size={28} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-gray-300 p-3 md:flex"
        aria-label="Next slide"
      >
        <FiChevronRight size={28} />
      </button>

      {/* Main Content Container - Column on mobile, row on desktop */}
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-6 md:flex-row md:px-20">
        {/* Title, Description, Button - Full width on mobile, half on desktop */}
        <div className="mb-8 flex w-full flex-col items-center text-center md:mb-0 md:w-1/2 md:items-start md:text-left">
          <h1 className="mb-4 text-3xl font-bold text-black md:text-4xl">
            {slides[activeSlide].productName}
          </h1>          <p className="mb-6 max-w-md text-lg text-black">
            {slides[activeSlide].description}
          </p>{" "}
          <button className="w-fit rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white border border-black hover:bg-white hover:text-black transition-colors">
            Khám phá
          </button>
        </div>

        {/* Product Image - Full width on mobile, half on desktop */}
        <div className="flex w-full items-center justify-center md:w-1/2">
          <img
            src={slides[activeSlide].image}
            alt={slides[activeSlide].productName}
            className="h-64 w-64 rounded-md bg-[#e5e6e8] object-contain md:h-80 md:w-80"
          />
        </div>
      </div>

      {/* Progress Indicator - Mobile dots, desktop bars */}
      <div className="mt-8 flex w-full justify-center px-4">
        <div className="flex gap-3 md:gap-6">
          {slides.map((_, index) => (
            <div
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`cursor-pointer md:h-1 md:w-48 ${
                index === activeSlide ? "bg-black" : "bg-gray-300"
              } ${
                // Mobile: dots, Desktop: bars
                "h-3 w-3 rounded-full md:h-1 md:w-48 md:rounded"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
