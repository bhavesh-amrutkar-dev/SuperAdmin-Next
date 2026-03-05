"use client";

import Header from "../layout/Header";


export default function RaffleDetailSkeleton() {
  return (
    <main className="bg-gray-50 min-h-screen animate-pulse">
      <Header />

      <div className="mx-auto w-full max-w-[1648px] px-4 md:px-6 py-4 md:py-10">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT IMAGE */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-4 h-[500px] flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-gray-200" />
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="w-full lg:w-1/2 space-y-6 bg-gray-100 p-6 rounded-xl">

            {/* Title */}
            <div className="h-6 w-2/3 bg-gray-200 rounded"></div>

            {/* Share button */}
            <div className="h-10 w-28 bg-gray-200 rounded-full"></div>

            {/* Countdown */}
            <div className="h-20 bg-gray-200 rounded-lg"></div>

            {/* Timeline */}
            <div className="h-16 bg-gray-200 rounded-lg"></div>

            {/* Price */}
            <div className="h-24 bg-gray-200 rounded-lg"></div>

            {/* Highlights */}
            <div className="bg-white p-6 rounded-xl space-y-4">
              <div className="h-4 w-40 bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
              <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
            </div>

            {/* Participate Button */}
            <div className="h-12 bg-gray-200 rounded-lg"></div>

          </div>
        </div>

        {/* Accordion Skeleton */}
        <div className="bg-white rounded-xl mt-8 p-6 space-y-4">
          <div className="h-5 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
        </div>

      </div>
    </main>
  );
}