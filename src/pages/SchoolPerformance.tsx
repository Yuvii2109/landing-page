import { useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CalendarCheck2,
  ChartNoAxesColumn,
  ClipboardCheck,
  FileSpreadsheet,
  LineChart,
  LucideIcon,
  Target,
} from "lucide-react";
import TopBar from "@/components/spark/TopBar";
import Navbar from "@/components/spark/Navbar";
import Footer from "@/components/spark/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const capabilityCards: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "Grade-wise Performance Visibility",
    description: "Structured views help institutions review academic performance across participating grades.",
    icon: BookOpenCheck,
  },
  {
    title: "Subject-wise Competency Insights",
    description: "Subject patterns and competency indicators help academic teams interpret learning needs.",
    icon: ChartNoAxesColumn,
  },
  {
    title: "Benchmark Trend Interpretation",
    description: "Benchmark-aligned reporting supports clearer interpretation of academic progress over time.",
    icon: LineChart,
  },
  {
    title: "Structured Institutional Reports",
    description: "School-level reports organize assessment outcomes into principal-friendly academic summaries.",
    icon: FileSpreadsheet,
  },
];

const benchmarkSteps = [
  "Assessment Participation",
  "Data Interpretation",
  "Academic Insights",
  "Planning Priorities",
  "Performance Improvement",
];

const benchmarkOutcomeCards = [
  "Supports academic reviews",
  "Helps identify focus grades",
  "Improves subject planning",
  "Enables evidence-led decisions",
];

const workflowCards = [
  "Review Reports",
  "Identify Learning Trends",
  "Plan Teacher Actions",
  "Support Students",
  "Track Progress",
];

const SchoolPerformance = () => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const sections = Array.from(document.querySelectorAll("section"));
    const revealItems = Array.from(document.querySelectorAll("[data-reveal-item]"));
    const targets = Array.from(new Set([...sections, ...revealItems]));
    if (!targets.length) return;

    targets.forEach((target) => target.classList.add("reveal-on-scroll"));

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      targets.forEach((target) => target.classList.add("is-visible"));
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

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-secondary/25">
      <TopBar />
      <Navbar />

      <main className="pb-16 pt-6 md:pb-20 md:pt-10">
        <div className="container space-y-10 px-4 md:space-y-14">
          <section className="overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-slate-100 via-blue-50 to-blue-100 p-6 shadow-[0_12px_34px_hsl(var(--primary)/0.08)] md:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
              <div className="max-w-[620px]">
                <h1 className="text-3xl font-black leading-tight text-foreground md:text-5xl md:leading-[1.02] lg:text-[4.35rem]">
                  School
                  <br />
                  Performance
                  <br />
                  Analytics
                </h1>

                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary md:text-xl md:leading-[1.35]">
                  See how Spark benchmarking helps schools interpret academic performance through structured reports,
                  competency insights, and growth visibility.
                </p>

                <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Spark Olympiads supports institutions with meaningful performance analytics that go beyond marks and
                  help leaders take smarter academic decisions.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    className="h-12 rounded-full px-6 text-base font-semibold shadow-[0_12px_26px_hsl(var(--primary)/0.26)]"
                    onClick={() => setIsViewerOpen(true)}
                  >
                    View School Reports
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <Button asChild type="button" variant="outline" className="h-12 rounded-full px-6 text-base font-semibold">
                    <Link to="/registration">Register</Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl border border-primary/15 bg-blue-50/75 p-3 shadow-[0_14px_34px_hsl(var(--primary)/0.10)] md:p-5 lg:ml-auto lg:max-w-[530px]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-muted-foreground">School Report</p>
                    <p className="text-lg font-black text-foreground md:text-xl">Academic Analytics</p>
                  </div>
                  <span className="rounded-full border border-primary/25 bg-cyan-100 px-4 py-1 text-sm font-bold text-primary">
                    Benchmark View
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
                  <article className="rounded-3xl border border-primary/15 bg-background p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-base font-extrabold text-muted-foreground md:text-lg">Grade View</p>
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex h-24 items-end gap-2 rounded-xl bg-secondary/50 px-3 pb-3">
                      {[0.5, 0.78, 0.64, 0.9, 0.72].map((height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-[1.1rem] bg-gradient-to-t from-primary to-cyan-400"
                          style={{ height: `${Math.round(height * 100)}%` }}
                        />
                      ))}
                    </div>
                  </article>

                  <article className="rounded-3xl border border-primary/15 bg-background p-4 shadow-sm">
                    <p className="mb-3 text-base font-extrabold text-muted-foreground md:text-lg">Competency Map</p>
                    <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[conic-gradient(hsl(var(--primary))_0_32%,#18b9db_32%_64%,#b2d4ff_64%_100%)]">
                      <span className="h-14 w-14 rounded-full bg-background" />
                    </div>
                  </article>
                </div>

                <article className="mt-4 rounded-3xl border border-primary/15 bg-background p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-base font-extrabold text-muted-foreground md:text-lg">Subject Trends</p>
                    <LineChart className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="rounded-xl bg-secondary/45 p-4">
                    <svg viewBox="0 0 360 120" className="h-28 w-full" role="img" aria-label="Subject trend lines">
                      <polyline
                        points="0,92 60,82 120,72 180,66 240,52 300,46 360,32"
                        fill="none"
                        stroke="#1666d3"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points="0,84 60,72 120,64 180,60 240,57 300,62 360,48"
                        fill="none"
                        stroke="#61d4e8"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {[16, 40, 64, 88, 112].map((y) => (
                        <line key={y} x1="0" y1={y} x2="360" y2={y} stroke="#bfd4f1" strokeWidth="2" />
                      ))}
                      <circle cx="360" cy="32" r="5" fill="#f6c744" />
                    </svg>
                  </div>
                </article>

              </div>
            </div>
          </section>

          <section className="space-y-7 rounded-[2rem] border border-primary/15 bg-background p-6 shadow-sm md:p-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                <ChartNoAxesColumn className="h-4 w-4" />
                Analytics Capabilities
              </p>
              <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">
                Structured visibility for academic leadership
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
              {capabilityCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    data-reveal-item
                    style={{ transitionDelay: `${index * 80}ms` }}
                    className="rounded-3xl border border-primary/15 bg-secondary/30 p-4 shadow-[0_12px_28px_hsl(var(--primary)/0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_hsl(var(--primary)/0.16)] md:p-5"
                  >
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold leading-snug text-foreground md:text-lg">{card.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground md:text-sm">{card.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-[2rem] border border-primary/15 bg-gradient-to-br from-slate-50 via-blue-50/75 to-blue-100 p-6 shadow-[0_14px_36px_hsl(var(--primary)/0.09)] md:p-10">
            <div className="mx-auto max-w-4xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                <ClipboardCheck className="h-4 w-4" />
                Report Preview
              </p>
              <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">
                Inside a Spark School Performance Report
              </h2>
              <p className="mt-3 text-muted-foreground md:text-lg">
                Designed to help academic leaders understand school performance more clearly.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border border-primary/15 bg-background/85 p-4 shadow-sm md:p-6">
              <div className="space-y-4">
                  <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-muted-foreground">Institution Report</p>
                      <p className="text-xl font-black text-foreground md:text-2xl">Performance Overview</p>
                    </div>
                    <span className="rounded-full border border-primary/25 bg-cyan-100 px-4 py-1 text-sm font-bold text-primary">
                      Symbolic charts
                    </span>
                  </header>

                  <div className="grid gap-4 md:grid-cols-[1.25fr_0.6fr_0.65fr]">
                    <article className="rounded-3xl border border-primary/15 bg-secondary/35 p-4">
                      <p className="text-base font-extrabold text-muted-foreground md:text-lg">Overall Performance Snapshot</p>
                      <svg viewBox="0 0 360 140" className="mt-3 h-36 w-full" role="img" aria-label="Overall trend">
                        <polyline
                          points="0,110 60,95 120,88 180,80 240,64 300,56 350,38"
                          fill="none"
                          stroke="#1666d3"
                          strokeWidth="5"
                          strokeLinecap="round"
                        />
                        <polyline
                          points="0,98 60,85 120,70 180,60 240,62 300,70 350,54"
                          fill="none"
                          stroke="#6dd8ea"
                          strokeWidth="5"
                          strokeLinecap="round"
                        />
                        {[30, 70, 110].map((y) => (
                          <line key={y} x1="0" y1={y} x2="360" y2={y} stroke="#bfd4f1" strokeWidth="2" />
                        ))}
                        <circle cx="350" cy="38" r="5" fill="#f6c744" />
                      </svg>
                    </article>

                    <article className="rounded-3xl border border-primary/15 bg-secondary/35 p-4">
                      <p className="text-base font-extrabold text-muted-foreground md:text-lg">Grade Comparison View</p>
                      <div className="mt-4 flex h-32 items-end gap-2">
                        {[0.55, 0.82, 0.44, 0.72].map((height, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-t-[1rem] bg-gradient-to-t from-primary to-cyan-400"
                            style={{ height: `${Math.round(height * 100)}%` }}
                          />
                        ))}
                      </div>
                    </article>

                    <article className="rounded-3xl border border-primary/15 bg-secondary/35 p-4">
                      <p className="text-base font-extrabold text-muted-foreground md:text-lg">Subject Trends</p>
                      <div className="mt-4 space-y-3">
                        <div className="h-4 w-full rounded-full bg-gradient-to-r from-primary to-cyan-400" />
                        <div className="h-4 w-11/12 rounded-full bg-gradient-to-r from-primary to-cyan-400" />
                        <div className="h-4 w-4/5 rounded-full bg-gradient-to-r from-primary to-cyan-400" />
                        <div className="h-4 w-3/5 rounded-full bg-gradient-to-r from-primary to-cyan-400" />
                        <div className="h-4 w-1/2 rounded-full bg-gradient-to-r from-primary to-cyan-400" />
                      </div>
                    </article>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <article className="rounded-3xl border border-primary/15 bg-secondary/35 p-4">
                      <p className="text-base font-extrabold text-muted-foreground md:text-lg">Strength Areas</p>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-bold text-primary md:text-base">Concept clarity</div>
                        <div className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-bold text-primary md:text-base">Consistent participation</div>
                      </div>
                    </article>

                    <article className="rounded-3xl border border-primary/15 bg-secondary/35 p-4">
                      <p className="text-base font-extrabold text-muted-foreground md:text-lg">Improvement Opportunities</p>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-bold text-primary md:text-base">Focus topics</div>
                        <div className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-bold text-primary md:text-base">Grade support</div>
                      </div>
                    </article>
                  </div>
              </div>
            </div>
          </section>

          <section className="space-y-7 rounded-[2rem] border border-primary/15 bg-background p-6 shadow-sm md:p-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                <Target className="h-4 w-4" />
                Benchmark Insights
              </p>
              <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">
                How Spark Analytics Supports Schools
              </h2>
            </div>

            <div className="grid gap-3 lg:grid-cols-[repeat(5,minmax(0,1fr))] lg:items-center">
              {benchmarkSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <article
                    data-reveal-item
                    style={{ transitionDelay: `${index * 70}ms` }}
                    className="min-h-[120px] flex-1 rounded-3xl border border-primary/15 bg-white p-4 shadow-[0_14px_30px_hsl(var(--primary)/0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_hsl(var(--primary)/0.18)]"
                  >
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-cyan-500 md:text-sm">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-2 text-base font-bold leading-snug text-foreground md:text-lg">{step}</p>
                  </article>

                  {index < benchmarkSteps.length - 1 ? (
                    <div className="hidden shrink-0 self-stretch text-primary/70 lg:flex lg:w-5 lg:items-center lg:justify-center">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {benchmarkOutcomeCards.map((item) => (
                <article
                  key={item}
                  className="flex items-center justify-center rounded-3xl border border-primary/15 bg-gradient-to-br from-white to-blue-50 p-4 text-center text-sm font-bold leading-snug text-primary shadow-[0_14px_30px_hsl(var(--primary)/0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_hsl(var(--primary)/0.16)] md:text-base"
                >
                  {item}
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-7 rounded-[2rem] border border-primary/15 bg-background p-6 shadow-sm md:p-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                <CalendarCheck2 className="h-4 w-4" />
                Report Workflow
              </p>
              <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">
                How Schools Use Reports
              </h2>
            </div>

            <div className="relative">
              {/* vertical line */}
              <div className="hidden lg:block absolute left-1/2 top-6 bottom-6 w-px -translate-x-1/2 bg-primary/10" />

              <div className="space-y-6">
                {workflowCards.map((item, idx) => {
                  const isLeft = idx % 2 === 0;
                  const article = (
                    <article
                      data-reveal-item
                      style={{ transitionDelay: `${idx * 80}ms` }}
                      className="rounded-lg border border-primary/10 bg-white p-3 shadow-[0_6px_16px_hsl(var(--primary)/0.02)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_hsl(var(--primary)/0.08)] mx-0 lg:mx-auto lg:max-w-[364px]"
                    >
                      <div className="flex flex-col items-center text-center">
                          <p className="text-sm font-bold text-foreground md:text-base">{item}</p>
                          <p className="mt-1 text-xs text-muted-foreground hidden md:block">Helpful action for academic teams</p>
                        </div>
                    </article>
                  );

                  return (
                    <div key={item} className="grid items-center lg:grid-cols-[1fr_96px_1fr] gap-6">
                      <div className="hidden lg:block">{isLeft ? article : <div />}</div>

                      <div className="flex items-center justify-center">
                        <div className="relative flex items-center justify-center">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-cyan-400 text-white flex items-center justify-center shadow-md z-10">
                            <span className="text-sm font-black">{idx + 1}</span>
                          </div>
                        </div>
                      </div>

                      <div className="hidden lg:block">{!isLeft ? article : <div />}</div>

                      {/* mobile: full width article */}
                      <div className="lg:hidden">{article}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-primary/15 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 shadow-[0_14px_36px_hsl(var(--primary)/0.08)] md:p-12">
            <div className="mx-auto max-w-4xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                <ArrowRight className="h-4 w-4" />
                Partner with Spark
              </p>
              <h2 className="mt-4 text-2xl font-black text-foreground md:text-4xl">
                Want Better Visibility into School Performance?
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-lg">
                Explore how Spark Olympiads can support your institution with benchmark-aligned reports and structured
                academic insights.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  className="h-12 rounded-full px-7 text-base font-semibold shadow-[0_12px_24px_hsl(var(--primary)/0.25)]"
                  onClick={() => setIsViewerOpen(true)}
                >
                  View School Report
                </Button>
                <Button asChild type="button" variant="outline" className="h-12 rounded-full px-7 text-base font-semibold">
                  <Link to="/registration">Partner With Spark</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="w-[95vw] max-w-[1100px] rounded-2xl p-0">
          <DialogHeader className="border-b px-5 pb-3 pt-5 sm:px-6">
            <DialogTitle className="text-xl font-black text-foreground">School Report Viewer</DialogTitle>
            <DialogDescription>
              Preview of school performance reports provided to institutions partnering with Spark Olympiads. These reports offer insights into academic performance, subject trends, and growth areas to help schools make informed decisions.
            </DialogDescription>
          </DialogHeader>

          <section className="h-[70vh] w-full bg-secondary/35 p-3 sm:p-4">
            <div className="h-full w-full overflow-hidden rounded-xl border border-primary/15 bg-background">
              <iframe
                src="/olympiad_analytics.pdf#toolbar=0&navpanes=0&scrollbar=1&view=FitH"
                title="Olympiad Analytics PDF"
                className="h-full w-full"
              />
            </div>
          </section>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolPerformance;
