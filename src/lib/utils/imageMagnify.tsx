"use client";

import React from "react";
import { PLACE_HOLDER } from "../config";
import ReactImageMagnify from "react-image-magnify";

interface ImageMagnifyProps {
  largeImage?: string;
  product?: any;
}

const ImageMagnify: React.FC<ImageMagnifyProps> = ({
  largeImage,
  product,
}) => {
  const imageSrc = largeImage || PLACE_HOLDER;

  const altText =
    product?.images?.[0]?.altText ?? "";

  return (
    <div id="imageZoom" className="w-full">
      <div className="h-88.5 md:h-full relative">
        <ReactImageMagnify
          smallImage={{
            alt: altText,
            isFluidWidth: true,
            src: imageSrc,
            onError: (e: any) => {
              e.target.onerror = null;
              e.target.src = PLACE_HOLDER;
            },
          }}
          largeImage={{
            src: imageSrc,
            width: 2000,
            height: 3000,
            onError: (e: any) => {
              e.target.onerror = null;
              e.target.src = PLACE_HOLDER;
            },
          }}
          lensStyle={{
            height: "100%",
          }}
          enlargedImageContainerStyle={{
            background: "#ffffff",
            zIndex: 50,
          }}
          imageClassName="
            relative
            mx-auto
            w-[90%] md:w-full
            max-w-full
            max-h-full md:max-h-[90%]
            object-contain
            bg-white
            transition-opacity
            duration-150
          "
          className="h-full"
        />
      </div>
    </div>
  );
};

export default ImageMagnify;