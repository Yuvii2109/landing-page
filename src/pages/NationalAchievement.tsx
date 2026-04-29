import { ArrowRight, Brain, BookOpen, LineChart, Medal, Trophy, TrendingUp } from "lucide-react";
import { useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import TopBar from "@/components/spark/TopBar";
import Navbar from "@/components/spark/Navbar";
import Footer from "@/components/spark/Footer";
import { Button } from "@/components/ui/button";

const frameworkCards = [
  {
    title: "National Recognition Pathways",
    description: "Structured pathways that highlight student achievers across participating Spark institutions.",
    icon: Medal,
  },
  {
    title: "Performance Visibility",
    description: "Clear visibility into learner performance through structured, competency-based assessments.",
    icon: LineChart,
  },
  {
    title: "Celebrating Consistency",
    description: "Recognition that honours academic consistency and sustained excellence over time.",
    icon: Trophy,
  },
  {
    title: "Confidence-Building Recognition",
    description: "Meaningful recognition that strengthens learner confidence and institutional pride.",
    icon: TrendingUp,
  },
];

const distributionSnapshot = [
  "Top-performing cohorts showed stronger benchmark alignment in upper-grade cycles.",
  "Foundational grades demonstrated steady year-on-year movement in structured participation tracks.",
  "Institutional clusters with early preparation windows reflected tighter achievement spread.",
];

const medalPatterns = [
  "Strong achievers were concentrated in schools with consistency across participation phases.",
  "Cross-subject alignment improved where reasoning and application readiness were co-developed.",
  "Recognition outcomes were strongest in cohorts with sustained assessment discipline.",
];

const schoolMeaning = [
  "National benchmarking enables schools to compare progression against peer institutions.",
  "Early identification of high-potential learners supports focused academic mentoring.",
  "Structured recognition loops help strengthen long-term academic culture and motivation.",
];

const institutionalInsights = [
  {
    title: "Foundational Conceptual Readiness",
    description: "Foundational grades reflected strong conceptual readiness across participating learners.",
    icon: BookOpen,
  },
  {
    title: "Middle-Grade Improvement Potential",
    description: "Middle-grade learners showed strong improvement potential with structured preparation.",
    icon: TrendingUp,
  },
  {
    title: "Reasoning Growth Opportunities",
    description: "Reasoning-focused subjects displayed visible growth opportunities for learners.",
    icon: Brain,
  },
  {
    title: "Benefits of Structured Preparation",
    description: "Consistent performers benefited from structured preparation environments.",
    icon: Medal,
  },
];

const growthLoop = [
  "Participate in Assessment",
  "Gain Benchmark Visibility",
  "Identify Emerging Achievers",
  "Build Student Motivation",
  "Strengthen Academic Culture",
];

const featurePills = [
  {
    title: "NEP-Aligned Thinking",
    description: "Curriculum intent mapped to applied learning outcomes.",
    accentClass: "bg-sky-400",
  },
  {
    title: "Competency-Based Assessments",
    description: "Assessment design focused on depth, not rote speed.",
    accentClass: "bg-blue-400",
  },
  {
    title: "Structured Reporting",
    description: "Clear reporting views that support academic decisions.",
    accentClass: "bg-cyan-400",
  },
  {
    title: "Recognition Ecosystem",
    description: "Recognition loops that sustain student motivation.",
    accentClass: "bg-indigo-300",
  },
];

const NationalAchievement = () => {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const sections = document.querySelectorAll("section");
    const loopSteps = document.querySelectorAll("[data-loop-step]");
    if (!sections.length && !loopSteps.length) return;

    sections.forEach((section) => section.classList.add("reveal-on-scroll"));
    loopSteps.forEach((step) => step.classList.add("reveal-on-scroll"));

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      sections.forEach((section) => section.classList.add("is-visible"));
      loopSteps.forEach((step) => step.classList.add("is-visible"));
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
    loopSteps.forEach((step) => observer.observe(step));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-secondary/25">
      <TopBar />
      <Navbar />

      <main className="pb-16 pt-6 md:pb-20 md:pt-10">
        <div className="container space-y-10 px-4 md:space-y-14">
          <section className="overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-slate-100 via-blue-50 to-blue-100 p-6 shadow-sm md:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div>
                <p className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  National Recognition Insight
                </p>
                <h1 className="text-3xl font-black leading-tight text-foreground md:text-5xl md:leading-[1.05]">
                  National Achievement & Benchmark Alignment Trends Across Spark Networks
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Spark Olympiad analyses achievement movement across participating institutional clusters each year to
                  identify benchmark alignment trends, medal distributions, and competency-level performance acceleration
                  patterns.
                </p>
              </div>

              <div className="rounded-2xl border border-primary/15 bg-background/70 p-4 shadow-sm md:p-6">
                <img
                  src="/image3.jpeg"
                  alt="National achievement and benchmark alignment visual"
                  className="h-full w-full rounded-2xl object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-border bg-background p-6 shadow-sm md:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Recognition Framework
              </p>
              <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">A Structured Approach to Honouring Achievement</h2>
              <p className="mt-3 text-muted-foreground md:text-lg">
                Four pillars that shape how Spark recognises student excellence and supports forward-looking institutions.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {frameworkCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    className="flex h-full flex-col rounded-2xl border border-primary/15 bg-secondary/40 p-4 shadow-[0_10px_28px_hsl(var(--primary)/0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_hsl(var(--primary)/0.18)] md:p-5"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 md:h-11 md:w-11">
                      <Icon className="h-5 w-5 text-primary md:h-6 md:w-6" />
                    </div>
                    <h3 className="min-h-[3.3rem] text-lg font-bold leading-snug text-foreground md:min-h-[4rem] md:text-[1.35rem]">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-primary/15 bg-gradient-to-br from-white via-blue-50/40 to-slate-50 p-6 shadow-[0_12px_34px_hsl(var(--primary)/0.08)] md:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                National Trend Snapshot
              </p>
              <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">
                Where Achievement Patterns Become Clearer at a Glance
              </h2>
              <p className="mt-3 text-muted-foreground md:text-lg">
                These views highlight how national recognition patterns, medal outcomes, and school-level implications move
                together across participating cohorts.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <article className="group rounded-[1.75rem] border border-blue-200/70 bg-white p-6 shadow-[0_14px_36px_hsl(var(--primary)/0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_hsl(var(--primary)/0.16)] md:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                    01 / Snapshot
                  </span>
                  <span className="h-3 w-3 rounded-full bg-primary/70 shadow-[0_0_0_6px_hsl(var(--primary)/0.08)]" />
                </div>
                <div className="mb-5 h-1.5 w-20 rounded-full bg-gradient-to-r from-primary via-blue-400 to-transparent" />
                <h3 className="text-xl font-extrabold leading-snug text-foreground md:text-[1.6rem]">
                  National Achievement Distribution Snapshot
                </h3>
                <ul className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {distributionSnapshot.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="group rounded-[1.75rem] border border-blue-200/70 bg-white p-6 shadow-[0_14px_36px_hsl(var(--primary)/0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_hsl(var(--primary)/0.16)] md:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                    02 / Recognition
                  </span>
                  <span className="h-3 w-3 rounded-full bg-primary/70 shadow-[0_0_0_6px_hsl(var(--primary)/0.08)]" />
                </div>
                <div className="mb-5 h-1.5 w-20 rounded-full bg-gradient-to-r from-primary via-blue-400 to-transparent" />
                <h3 className="text-xl font-extrabold leading-snug text-foreground md:text-[1.6rem]">
                  Medal & Recognition Performance Patterns
                </h3>
                <ul className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {medalPatterns.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="group rounded-[1.75rem] border border-blue-200/70 bg-white p-6 shadow-[0_14px_36px_hsl(var(--primary)/0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_hsl(var(--primary)/0.16)] md:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                    03 / School Impact
                  </span>
                  <span className="h-3 w-3 rounded-full bg-primary/70 shadow-[0_0_0_6px_hsl(var(--primary)/0.08)]" />
                </div>
                <div className="mb-5 h-1.5 w-20 rounded-full bg-gradient-to-r from-primary via-blue-400 to-transparent" />
                <h3 className="text-xl font-extrabold leading-snug text-foreground md:text-[1.6rem]">
                  What This Means for Schools
                </h3>
                <ul className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {schoolMeaning.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-primary/15 bg-blue-50/70 p-6 shadow-sm md:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Observed Performance Patterns
              </p>
              <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">Insights From Across Participating Institutions</h2>
              <p className="mt-3 text-muted-foreground md:text-lg">
                Qualitative patterns observed in academic readiness, growth, and reasoning ability.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {institutionalInsights.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-primary/15 bg-background p-4 shadow-[0_10px_26px_hsl(var(--primary)/0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_hsl(var(--primary)/0.16)] md:p-5"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 md:h-11 md:w-11">
                      <Icon className="h-5 w-5 text-primary md:h-6 md:w-6" />
                    </div>
                    <h3 className="text-xl font-bold leading-snug text-foreground md:text-[1.45rem]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-slate-50 via-blue-50/75 to-blue-100/85 p-6 shadow-[0_12px_32px_hsl(var(--primary)/0.10)] md:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />

            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Why It Matters for Schools
              </p>
              <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">
                A Continuous Loop of Visibility, Recognition, and Growth
              </h2>
              <p className="mt-3 text-muted-foreground md:text-lg">
                Each stage strengthens the next, creating a clear academic rhythm from participation to recognition and
                sustained motivation.
              </p>
            </div>

            <div className="mt-10 relative mx-auto max-w-5xl">
              <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/10 via-primary/30 to-primary/10 lg:block" />

              <div className="space-y-4 md:space-y-5 lg:space-y-6">
                {growthLoop.map((step, index) => {
                  const isLeft = index % 2 === 0;

                  return (
                    <div key={step}>
                      <div className="lg:hidden">
                        <article
                          data-loop-step
                          style={{ transitionDelay: `${index * 120}ms` }}
                          className="relative rounded-[1.2rem] border border-primary/15 bg-white/95 p-4 pl-14 shadow-[0_10px_22px_hsl(var(--primary)/0.09)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_30px_hsl(var(--primary)/0.16)]"
                        >
                          <div className="absolute left-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-extrabold text-primary-foreground shadow-[0_10px_20px_hsl(var(--primary)/0.24)]">
                            {index + 1}
                          </div>
                          <div className="mb-2 h-1 w-10 rounded-full bg-gradient-to-r from-primary via-blue-400 to-transparent" />
                          <h3 className="text-base font-black leading-snug text-foreground">{step}</h3>
                        </article>
                      </div>

                      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] lg:items-center lg:gap-5">
                        <div className="flex justify-end">
                          {isLeft ? (
                            <article
                              data-loop-step
                              style={{ transitionDelay: `${index * 120}ms` }}
                              className="w-full max-w-[22rem] rounded-[1.2rem] border border-primary/15 bg-white/95 p-4 shadow-[0_10px_22px_hsl(var(--primary)/0.09)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_30px_hsl(var(--primary)/0.16)]"
                            >
                              <div className="mb-2 h-1 w-10 rounded-full bg-gradient-to-r from-primary via-blue-400 to-transparent" />
                              <h3 className="text-base font-black leading-snug text-foreground">{step}</h3>
                            </article>
                          ) : null}
                        </div>

                        <div className="relative flex justify-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-blue-100 bg-primary text-xs font-extrabold text-primary-foreground shadow-[0_10px_22px_hsl(var(--primary)/0.24)] md:h-11 md:w-11">
                            {index + 1}
                          </div>
                        </div>

                        <div className="flex justify-start">
                          {!isLeft ? (
                            <article
                              data-loop-step
                              style={{ transitionDelay: `${index * 120}ms` }}
                              className="w-full max-w-[22rem] rounded-[1.2rem] border border-primary/15 bg-white/95 p-4 shadow-[0_10px_22px_hsl(var(--primary)/0.09)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_30px_hsl(var(--primary)/0.16)]"
                            >
                              <div className="mb-2 h-1 w-10 rounded-full bg-gradient-to-r from-primary via-blue-400 to-transparent" />
                              <h3 className="text-base font-black leading-snug text-foreground">{step}</h3>
                            </article>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-[radial-gradient(circle_at_12%_18%,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(96,165,250,0.10),transparent_28%),linear-gradient(140deg,#ffffff_0%,#f8fbff_48%,#eef4ff_100%)] px-6 py-10 shadow-[0_16px_38px_hsl(var(--primary)/0.08)] md:px-10 md:py-12">
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-300/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/18 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

            <div className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div className="rounded-3xl border border-primary/12 bg-white/90 p-6 text-foreground shadow-[0_14px_34px_hsl(var(--primary)/0.07)] backdrop-blur-sm md:p-7">
                <p className="inline-flex rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  Platform Fit
                </p>
                <h2 className="mt-4 text-2xl font-black leading-tight md:text-[2.25rem] md:leading-[1.07]">
                  Built for Forward-Looking Academic Institutions
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  A future-ready architecture that connects pedagogy, performance visibility, and student recognition in one institutional flow.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-primary/12 bg-primary/6 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                    Actionable Reporting
                  </span>
                  <span className="rounded-full border border-primary/12 bg-primary/6 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                    National Benchmark Lens
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {featurePills.map((pill, index) => (
                  <article
                    key={pill.title}
                    className="group flex h-full min-h-[11rem] flex-col rounded-2xl border border-primary/12 bg-white/92 p-4 shadow-[0_12px_24px_hsl(var(--primary)/0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_30px_hsl(var(--primary)/0.14)] md:min-h-[12.5rem] md:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground ring-1 ring-primary/10">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="min-h-[3rem] text-base font-extrabold leading-snug text-foreground md:min-h-[4.25rem] md:text-lg">
                          {pill.title}
                        </h3>
                        <p className="mt-1 min-h-[3.5rem] text-sm leading-relaxed text-muted-foreground md:min-h-[4rem]">
                          {pill.description}
                        </p>
                      </div>
                    </div>
                    <div className={`mt-auto h-1.5 w-16 rounded-full ${pill.accentClass} shadow-[0_8px_16px_hsl(var(--primary)/0.14)]`} />
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-primary/18 bg-[linear-gradient(135deg,rgba(17,24,39,0.96)_0%,rgba(37,99,235,0.95)_52%,rgba(59,130,246,0.98)_100%)] px-6 py-10 text-white shadow-[0_18px_44px_hsl(var(--primary)/0.22)] md:px-10 md:py-14">
            <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

            <div className="mx-auto max-w-4xl text-center">
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white/90">
                Benchmark Invitation
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight md:text-5xl">Ready to Build Your School&apos;s Benchmark Visibility?</h2>
              <p className="mt-4 text-base text-white/80 md:text-lg">
                Join Spark Olympiad to map achievement trends, identify emerging performers, and strengthen institutional
                academic planning with structured national benchmarking.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="rounded-full bg-white px-7 font-bold text-primary hover:bg-blue-50">
                  <Link to="/registration">
                    Join SPARK
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-white/5 px-7 text-white hover:bg-white/12">
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NationalAchievement;
