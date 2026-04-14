import { useEffect } from "react";
import TopBar from "@/components/spark/TopBar";
import Navbar from "@/components/spark/Navbar";
import Hero from "@/components/spark/Hero";
import Highlights from "@/components/spark/Highlights";
import AboutSpark from "@/components/spark/AboutSpark";
import Comparison from "@/components/spark/Comparison";
import Rewards from "@/components/spark/Rewards";
import HowItWorks from "@/components/spark/HowItWorks";
import Pricing from "@/components/spark/Pricing";
import ReportsAnalytics from "@/components/spark/ReportsAnalytics";
import RegistrationCTA from "@/components/spark/RegistrationCTA";
import TechPartners from "@/components/spark/TechPartners";
import FAQ from "@/components/spark/FAQ";
import Footer from "@/components/spark/Footer";

const Index = () => {
  useEffect(() => {
    const sections = document.querySelectorAll("section");
    if (!sections.length) return;

    sections.forEach((section) => section.classList.add("reveal-on-scroll"));

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      <TopBar />
      <Navbar />
      <Hero />
      <Highlights />
      <AboutSpark />
      <ReportsAnalytics />
      <Comparison />
      <Rewards />
      <Pricing />
      <HowItWorks />
      <RegistrationCTA />
      <TechPartners />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
