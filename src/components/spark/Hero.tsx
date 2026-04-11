import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const [mobilePartnersOpen, setMobilePartnersOpen] = useState(false);

  return (
    <section className="hero-banner relative overflow-hidden pt-10 md:pt-14 lg:pt-16 pb-8 md:pb-8" id="hero">
      <div className="container px-4">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-14">
          <div className="order-1 md:order-1 flex justify-center md:justify-start md:pl-4 lg:pl-8">
            <div className="hero-media-frame hero-media-frame--soft">
              <img src="/banner_image.jpeg" alt="SPARK Olympiad Banner" className="hero-media-image hero-media-image--rounded" />
            </div>
          </div>

          <div className="order-2 md:order-2 text-center md:text-left">
            <h1 className="text-[1.8rem] sm:text-[2.05rem] md:text-[2.25rem] lg:text-[2.45rem] font-extrabold leading-[1.08] text-white mb-5 max-w-[15.5ch] mx-auto md:mx-0 md:max-w-[17.5ch]">
              India's Most Advanced Academic Benchmarking Olympiad
            </h1>

            <p className="text-[0.98rem] sm:text-[1.05rem] md:text-[1.15rem] font-semibold text-blue-50/95 mb-8 max-w-lg mx-auto md:mx-0 leading-[1.35]">
              Assessing Thinking. Measuring Performance. Enabling Excellence.
            </p>

            <Button asChild size="lg" className="rounded-md bg-[#ff5d1f] hover:bg-[#f34d0f] text-white font-semibold text-base px-8 h-12 mt-1">
              <a href="/registration">
                Register Your School <ArrowUpRight size={18} />
              </a>
            </Button>

            <div className="mt-7 md:hidden w-full max-w-[280px] mx-auto">
              <button
                onClick={() => setMobilePartnersOpen((prev) => !prev)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/30 px-3 py-2.5 text-sm font-medium text-white/90"
              >
                Initiative Of EDXSO & Prometric
                <ChevronDown size={16} className={mobilePartnersOpen ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>

              {mobilePartnersOpen && (
                <div className="mt-3 rounded-2xl bg-white p-3 shadow-lg">
                  <div className="grid gap-3 text-center">
                    <div>
                      <img src="/EDXSO.png" alt="EDXSO" className="mx-auto h-8 w-auto" />
                      <p className="mt-2 text-xs text-slate-700">Initiative Of</p>
                      <p className="text-[11px] text-slate-500">India's Premier Education Consultants</p>
                    </div>
                    <div>
                      <img src="/prometric.png" alt="Prometric" className="mx-auto h-8 w-auto" />
                      <p className="mt-2 text-xs text-slate-700">Powered By</p>
                      <p className="text-[11px] text-slate-500">Global Leader in Online Assessments</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:block mt-5 md:mt-6">
          <div className="mx-auto w-[min(80%,760px)] rounded-[1.5rem] bg-[#f8fafc] px-3 py-3 shadow-[0_10px_26px_rgba(2,6,23,0.10)] transition-shadow duration-300 hover:shadow-[0_24px_54px_rgba(2,6,23,0.24)]">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="flex flex-col items-center">
                <div className="h-14 flex items-center justify-center">
                  <img src="/EDXSO.png" alt="EDXSO" className="mx-auto h-10 sm:h-11 w-auto" />
                </div>
                <p className="mt-1.5 text-sm font-medium leading-none text-slate-700">Initiative Of</p>
                <p className="mt-1 text-sm leading-snug text-slate-800">India's Premier Education Consultants</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-14 flex items-center justify-center">
                  <img src="/prometric.png" alt="Prometric" className="mx-auto h-11 sm:h-12 w-auto" />
                </div>
                <p className="mt-1.5 text-sm font-medium leading-none text-slate-700">Powered By</p>
                <p className="mt-1 text-sm leading-snug text-slate-800">Global Leader in Online Assessments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
