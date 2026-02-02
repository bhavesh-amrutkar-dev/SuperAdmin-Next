"use client"
import { useState } from "react";
import HeroSlider from "../components/landing/Hero";
import Header from "../components/layout/Header";
import PreFooterIconModule from "../components/layout/PreFooterIconModule";
import Footer from "../components/layout/Footer";

export default function LandingPage() {

  const [homePage, homePageState] = useState();
  return (
    <main>
      <Header />
      <HeroSlider />
      <PreFooterIconModule />
      <Footer />
    </main>
  )
}
