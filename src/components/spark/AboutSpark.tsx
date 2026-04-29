import { useEffect, useRef } from "react";

const AboutSpark = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
//test
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {
            // Ignore autoplay rejections from restrictive browser policies.
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.45 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white pt-8 pb-10 md:pt-10 md:pb-12" id="about-spark">
      <div className="container px-4">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-6 shadow-[0_14px_34px_rgba(2,6,23,0.08)] sm:px-6 sm:py-8 md:px-10 md:py-10">
          <h2 className="text-center text-2xl font-extrabold text-slate-900 md:text-3xl">About Spark</h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-sm font-medium leading-relaxed text-slate-700 md:text-base">
            A one-minute introduction to the SPARK Olympiad vision, framework, and impact.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.26)] transition-shadow duration-300 hover:shadow-[0_24px_60px_rgba(15,23,42,0.34)]">
            <div className="aspect-video w-full bg-black">
              <video
                ref={videoRef}
                className="h-full w-full"
                controls
                playsInline
                muted
                preload="metadata"
                aria-label="About SPARK introduction video"
              >
                <source src="https://sparkolympiads.com/videos/intro.mp4" type="video/mp4" />
                Your browser does not support HTML5 video. You can watch the video here:
                <a
                  href="https://sparkolympiads.com/videos/intro.mp4"
                  target="_blank"
                  rel="noreferrer"
                  className="ml-1 text-blue-300 underline"
                >
                  Open intro video
                </a>
                .
              </video>
            </div>
          </div>

          <p className="mt-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            1-minute overview
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Competency-Based
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              AI-Proctored
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Global Benchmarking
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSpark;