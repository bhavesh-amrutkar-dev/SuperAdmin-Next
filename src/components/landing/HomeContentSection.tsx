// src/components/HomeContentSection.tsx

"use client";

import { saleTime } from "@/src/lib/config";
import Image from "next/image";

interface Props {
  title: string;
  description?: string;
  image?: string;
  cellType?: number;
}

export default function HomeContentSection({
  title,
  description,
  image,
  cellType,
}: Props) {
  const finalImage = image || saleTime;

  return (
    <section className="py-10 md:py-14 xl:py-20">
      <div className="mx-auto w-full max-w-7xl px-4">
        {/* Responsive Row */}
        <div className="flex flex-col gap-8 md:flex-row md:items-center">
          
          {/* LEFT: Content */}
          <div className="w-full md:w-1/2">
            <h2
              className="
                mb-6
                text-base
                sm:text-lg
                md:text-xl
                lg:text-[32px]
                capitalize
                font-semibold
                section_title
              "
            >
              {title}
            </h2>

            {description && (
              <div
                className="
                  text-xs
                  sm:text-sm
                  text-[#7c7878]
                  leading-relaxed
                  capitalize md:pe-14
                "
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
          </div>

          {/* RIGHT: Image */}
          <div className="w-full md:w-1/2">
            <Image
              unoptimized
              src={finalImage}
              alt={title}
              width={401}
              height={365}
              priority
              className={`
                w-full
                h-auto
                object-cover
                ${
                  cellType === 1
                    ? "rounded-lg"
                    : cellType === 2
                    ? ""
                    : cellType === 3
                    ? "rounded-none"
                    : ""
                }
              `}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
