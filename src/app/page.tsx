// app/page.tsx
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import HomePageShell from "../components/landing/HomePageShell";

export default function LandingPage() {
  return (
    <main>
      <Header />
      <HomePageShell />
      <PreFooterIconModule />
      <Footer />
    </main>
  );
}
