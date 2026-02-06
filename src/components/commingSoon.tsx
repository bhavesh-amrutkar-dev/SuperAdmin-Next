"use client";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Coming Soon
        </h1>

        <p className="mt-4 text-gray-400 text-sm md:text-base">
          We’re working on something awesome. Stay tuned.
        </p>

        <div className="mt-8 h-1 w-20 mx-auto bg-yellow-400 rounded-full" />
      </div>
    </div>
  );
}
