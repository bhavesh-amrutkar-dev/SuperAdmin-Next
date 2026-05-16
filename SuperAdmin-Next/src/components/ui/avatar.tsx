"use client";

import Image from "next/image";
import { useState } from "react";
import { User } from "lucide-react";

type AvatarProps = {
  src?: string | null;
  alt?: string;
  firstName?: string;
  lastName?: string;
  size?: number;
  className?: string;
};

export default function Avatar({
  src,
  alt = "Profile",
  firstName,
  lastName,
  size = 96,
  className = "",
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : firstName
        ? firstName[0].toUpperCase()
        : null;

  const showImage = src && !imgError;

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center text-white font-semibold transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setImgError(true)}
        />
      ) : initials ? (
        <span className="text-lg">{initials}</span>
      ) : (
        <User className="w-6 h-6 text-white/80" />
      )}

      {/* Online Status Dot */}
      <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
    </div>
  );

}
