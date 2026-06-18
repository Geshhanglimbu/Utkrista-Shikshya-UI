import React from "react";
import "./LandingPage.css";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { HeroBanner } from "../components/landing/HeroBanner";
import { StatsBar, FeaturedCourses, Categories, Testimonials, CTABanner } from "../components/landing/LandingSections";

export default function LandingPage() {
  return (
    <div className="landing-wrapper">
      <Navbar />
      <main>
        <HeroBanner />
        <StatsBar />
        <FeaturedCourses />
        <Categories />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
