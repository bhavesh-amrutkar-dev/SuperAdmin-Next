"use client";

import { useEffect, useState } from "react";
import type { HomeBanner } from "@/src/models/api/response/home";
import Image from "next/image";

type Props = {
  banners: HomeBanner[];
  autoPlay?: boolean;
};

export default function HeroSlider({ banners, autoPlay = true }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners, autoPlay]);

  if (!banners.length) return null;

  const banner = banners[index];

  return (
    <section className="w-full">
      <div className="w-full">
        <div className="relative overflow-hidden">
          <picture className="w-full h-full block">
            {/* Desktop first in picture source */}
            <source className="w-full h-full"
              media="(min-width: 768px)"
              srcSet={banner.imageWeb}
            />

            {/* Mobile default */}
            <Image
              src={banner.imageMobile}
              alt="Home banner"
              className="w-full h-full object-cover object-left"
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              width={800}
              height={600}
            />
          </picture>
        </div>

        {/* Dots */}
        {banners.length > 1 && (
          <div className="flex justify-center gap-3 py-4">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-200
                  ${i === index
                    ? "bg-black scale-125"
                    : "bg-black/30 hover:bg-black/50"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
