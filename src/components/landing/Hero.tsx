"use client"

import { useEffect, useState } from "react"

const slides = [
  {
    title: "Build faster",
    description: "Launch your product with confidence",
  },
  {
    title: "Scale smarter",
    description: "Infrastructure that grows with you",
  },
  {
    title: "Ship quality",
    description: "Modern tools for modern teams",
  },
]

export default function HeroSlider() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, 1500)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-32 text-center transition-all duration-700">
        <h2 className="text-5xl font-bold mb-4">
          {slides[index].title}
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          {slides[index].description}
        </p>

        <button className="px-8 py-3 bg-black text-white rounded-lg">
          Get Started
        </button>
      </div>
    </section>
  )
}
