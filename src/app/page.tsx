"use client"
import "./globals.css"
import Header from "../components/layout/Header";
import PreFooterIconModule from "../components/layout/PreFooterIconModule";
import Footer from "../components/layout/Footer";
import HomePage from "../components/landing/HomePage";
import { useAuth } from "../context/authContext";
import { FullScreenLoader } from "../components/fullScreenLoader";

export default function LandingPage() {
  const { ready } = useAuth();
  if (!ready) return <FullScreenLoader />;
  return (

    <main>
      <Header />
      <HomePage />
      <PreFooterIconModule />
      <Footer />
    </main>
  )
}
