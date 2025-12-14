"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import HeroSection from "@/components/home/Hero";
import FeaturesSection from "@/components/home/Features";
import EnhancedHero from "@/components/home/Languages";
import CTASection from "@/components/home/CTA";

export default function Home() {
  return (
    <div className="w-full bg-neutral-950 text-neutral-50">
      <HomeNavbar />

      <HeroSection />

      <FeaturesSection />

      <EnhancedHero />

      <CTASection />

      <Footer />
    </div>
  );
}
