import { useEffect, useRef, useState } from "react";

const metrics = [
  { value: 100, label: "Schools Participated" },
  { value: 25000, label: "Students Engaged" },
];

const Counter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2500; // 2.5 seconds
          const startTime = Date.now();

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
      {count.toLocaleString()}{suffix}
    </p>
  );
};

const Highlights = () => (
  <section className="bg-spark-dark pt-16 pb-16 md:pt-24 md:pb-20" id="highlights">
    <div className="container px-4">
      <p className="text-center text-spark-slate text-sm font-semibold uppercase tracking-widest mb-8">2025 - A Powerful First Year</p>
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20">
        {metrics.map((m) => (
          <div key={m.label} className="text-center">
            <Counter target={m.value} suffix="+" />
            <p className="text-spark-slate text-sm md:text-base mt-2 font-medium">{m.label}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-spark-slate text-sm md:text-base mt-12 md:mt-16 max-w-2xl mx-auto leading-relaxed">
        As India's first competency-based Olympiad, SPARK made a strong debut in 2025 - bringing together forward-thinking schools and thousands of students.
      </p>
    </div>
  </section>
);

export default Highlights;
