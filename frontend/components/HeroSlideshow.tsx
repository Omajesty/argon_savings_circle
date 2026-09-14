"use client";

import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/hero/fruit-stand.jpg",
    alt: "Pepper seller at a West African market stall",
  },
  {
    src: "/hero/tomato-market.jpg",
    alt: "Traders at a tomato and pepper stall",
  },
  {
    src: "/hero/plantain-stall.jpg",
    alt: "Two women at a plantain and groundnut stall",
  },
  {
    src: "/hero/market-umbrella.jpg",
    alt: "Measuring beans under a market umbrella",
  },
  {
    src: "/hero/meeting.jpg",
    alt: "People keeping the circle books on a laptop",
  },
];

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [paused]);

  const go = (step: number) => {
    setIndex((current) => (current + step + slides.length) % slides.length);
  };

  return (
    <section
      id="home"
      className="relative min-h-[560px] overflow-hidden md:min-h-[640px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, slideIndex) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            slideIndex === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-[#FFF3E4] via-[#FFF3E4]/90 to-[#FFF3E4]/25 md:via-[#FFF3E4]/85 md:to-transparent" />

      <div className="relative mx-auto flex min-h-[560px] max-w-6xl items-center px-5 py-16 md:min-h-[640px] md:py-24">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold leading-tight text-navy md:text-5xl">
            Saving together is now{" "}
            <span className="text-orange">much easier</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted">
            An ajo is a savings circle. You pay a fixed amount every week.
            One person collects the pot, by turn, until everyone has
            collected once. Ajo keeps the books so Chairman Ade does not
            have to.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/register" className="btn-teal">
              Join for Free
            </Link>
            <Link href="/#how" className="btn-ghost bg-white/70">
              Watch how it works
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
        <button
          type="button"
          aria-label="Previous slide"
          className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-navy shadow-card"
          onClick={() => go(-1)}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        {slides.map((slide, slideIndex) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show slide ${slideIndex + 1}`}
            aria-current={slideIndex === index}
            className={`h-2.5 rounded-full transition-all ${
              slideIndex === index ? "w-8 bg-teal" : "w-2.5 bg-white/80"
            }`}
            onClick={() => setIndex(slideIndex)}
          />
        ))}
        <button
          type="button"
          aria-label="Next slide"
          className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-navy shadow-card"
          onClick={() => go(1)}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </section>
  );
}
