"use client"
import { useState } from "react";
import "./globals.css"
import HeroSlider from "../components/landing/Hero";
import Header from "../components/layout/Header";
import PreFooterIconModule from "../components/layout/PreFooterIconModule";
import Footer from "../components/layout/Footer";
import HomePage from "../components/landing/HomePage";

export default function LandingPage() {

  const [homePage, homePageState] = useState();
  return (
    <main>
      <Header />
      <HomePage />
      <PreFooterIconModule />
      <Footer />
    </main>
  )
}
