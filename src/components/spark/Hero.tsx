import { ArrowUpRight, BellRing, Globe, Monitor, ShieldCheck } from "lucide-react";
import { Counter, highlightsMetrics } from "./Highlights";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="hero-banner relative overflow-hidden pt-10 md:pt-14 lg:pt-16 pb-12 md:pb-16" id="hero">
      <div className="container px-4">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-14">
          <div className="order-1 md:order-1 flex justify-center md:justify-start md:pl-4 lg:pl-8">
            <div className="hero-media-frame hero-media-frame--soft">
              <img src="/banner_image.jpeg" alt="SPARK Olympiad Banner" className="hero-media-image hero-media-image--rounded" />
            </div>
          </div>

          <div className="order-2 md:order-2 text-center">
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-300 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.11em] text-amber-950 sm:px-4 sm:text-[0.72rem] md:text-[0.74rem]">
              <BellRing size={13} className="shrink-0" />
              SPARK 2026&ndash;27 | Continuing the Journey of Smarter Assessments
            </p>

            <h1 className="text-[1.8rem] sm:text-[2.05rem] md:text-[2.25rem] lg:text-[2.45rem] font-extrabold leading-[1.08] text-white mb-5 max-w-[15.5ch] mx-auto md:max-w-[17.5ch]">
              India's Most Advanced Academic Benchmarking Olympiad
            </h1>

            <p className="text-[0.92rem] sm:text-[0.99rem] md:text-[1.09rem] font-semibold text-blue-50/95 mb-4 max-w-xl mx-auto leading-[1.35]">
              Assessing Thinking. Measuring Performance. Enabling Excellence.
              <span className="mt-1 block text-blue-100/95">Built for schools that aspire beyond traditional Olympiads.</span>
            </p>

            <div className="mb-8 flex flex-col items-center text-center">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/30 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow-[0_6px_16px_rgba(2,6,23,0.18)] backdrop-blur-[1px] transition-shadow duration-200 hover:shadow-[0_12px_30px_rgba(2,6,23,0.32)]">
                  <ShieldCheck size={14} className="shrink-0 text-blue-100" />
                  AI-Proctored Assessments
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/30 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow-[0_6px_16px_rgba(2,6,23,0.18)] backdrop-blur-[1px] transition-shadow duration-200 hover:shadow-[0_12px_30px_rgba(2,6,23,0.32)]">
                  <Globe size={14} className="shrink-0 text-blue-100" />
                  Anytime, Anywhere Access
                </span>
              </div>

              <div className="mt-3 flex w-full justify-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/30 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow-[0_6px_16px_rgba(2,6,23,0.18)] backdrop-blur-[1px] transition-shadow duration-200 hover:shadow-[0_12px_30px_rgba(2,6,23,0.32)]">
                  <Monitor size={14} className="shrink-0 text-blue-100" />
                  Fully Online &amp; Hassle-Free
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <Button asChild size="lg" className="rounded-md bg-[#ff5d1f] hover:bg-[#f34d0f] text-white font-semibold text-base px-8 h-12 mt-1">
                <a href="/registration">
                  Register Your School <ArrowUpRight size={18} />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-10 mx-auto w-full max-w-[88rem] rounded-[1.75rem] border border-slate-200 bg-white/95 px-5 py-6 shadow-[0_18px_42px_rgba(2,6,23,0.16)] backdrop-blur-sm md:px-8 md:py-7">
          <p className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-primary sm:text-[0.75rem] md:text-[0.78rem]">
            2025 - A Powerful First Year
          </p>

          <div className="mt-5 flex flex-col items-center justify-center gap-8 md:flex-row md:gap-16">
            {highlightsMetrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <Counter target={metric.value} suffix="+" />
                <p className="mt-2 text-sm font-medium text-slate-700 md:text-base">{metric.label}</p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-slate-600 md:mt-10 md:text-base">
            As India's first competency-based Olympiad, SPARK made a strong debut in 2025 - bringing together forward-thinking schools and thousands of students.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
