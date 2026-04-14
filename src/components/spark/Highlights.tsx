import { useEffect, useRef, useState } from "react";

export const highlightsMetrics = [
  { value: 500, label: "Schools Participated" },
  { value: 125000, label: "Students Engaged" },
];

export const Counter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const duration = 2500;

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(progress * target);
            setCount(current);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };

          animate();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [target, hasAnimated]);

  return (
    <p ref={ref} className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
      {count.toLocaleString("en-IN")}{suffix}
    </p>
  );
};

const schoolLogos = Array.from({ length: 30 }, (_, index) => `/${index + 1}.png`);
const marqueeLogos = [...schoolLogos, ...schoolLogos];

const Highlights = () => (
  <section className="bg-white pt-3 pb-2 md:pt-3 md:pb-3" id="highlights">
    <div className="container px-4">
      <p className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 md:text-base">
        Partner Schools
      </p>
      <div className="partner-marquee rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-4 shadow-[0_14px_36px_rgba(15,23,42,0.08)] md:px-6 md:py-5">
        <div className="partner-marquee__track">
          {marqueeLogos.map((logo, index) => (
            <div key={`${logo}-${index}`} className="partner-marquee__item">
              <img
                src={logo}
                alt={`Partner school logo ${(index % schoolLogos.length) + 1}`}
                className="max-h-10 w-auto object-contain opacity-90 md:max-h-12"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Highlights;
