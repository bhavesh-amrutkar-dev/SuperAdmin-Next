"use client";

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-[#fafafa]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-gray-700 border-t-yellow-400 animate-spin" />
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
