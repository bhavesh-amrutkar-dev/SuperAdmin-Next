"use client";

import React, { useRef, useState } from "react";
import { PLACE_HOLDER } from "../config";

interface ImageMagnifyProps {
  largeImage?: string;
  product?: any;
}

const ImageMagnify: React.FC<ImageMagnifyProps> = ({
  largeImage,
  product,
}) => {
  const imageSrc = largeImage || PLACE_HOLDER;
  const altText = product?.images?.[0]?.altText ?? "";

  const containerRef = useRef<HTMLDivElement>(null);
  const [backgroundPosition, setBackgroundPosition] = useState("0% 0%");
  const [showZoom, setShowZoom] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      containerRef.current!.getBoundingClientRect();

    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;

    setBackgroundPosition(`${x}% ${y}%`);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-xl cursor-zoom-in"
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Normal Image */}
      <img
        src={imageSrc}
        alt={altText}
        onError={(e: any) => {
          e.target.onerror = null;
          e.target.src = PLACE_HOLDER;
        }}
        className="w-full h-full object-contain bg-white"
      />

      {/* Zoom Overlay */}
      {showZoom && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "400%",
            backgroundPosition: backgroundPosition,
          }}
        />
      )}
    </div>
  );
};

export default ImageMagnify;