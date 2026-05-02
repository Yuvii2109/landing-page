import { ArrowRight, BookOpen, ClipboardList, Eye, Heart, PieChart } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "@/components/spark/TopBar";
import Navbar from "@/components/spark/Navbar";
import Footer from "@/components/spark/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  RadarChart,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const benefitCards = [
  {
    title: "Identifies Learning Strengths",
    description: "Surfaces areas where students already demonstrate confident understanding.",
    icon: BookOpen,
  },
  {
    title: "Highlights Growth Opportunities",
    description: "Pinpoints focus areas that, with the right support, unlock next-level learning.",
    icon: ArrowRight,
  },
  {
    title: "Shows Competency Readiness",
    description: "Maps performance against core competencies rather than raw marks.",
    icon: PieChart,
  },
  {
    title: "Supports Better Guidance",
    description: "Enables meaningful, evidence-led conversations for teachers and parents.",
    icon: Heart,
  },
];

const readinessItems = [
  { subject: "Mathematics", value: 82 },
  { subject: "Science", value: 68 },
  { subject: "English", value: 76 },
];

const strengthAreas = ["Logical Reasoning", "Application of Concepts", "Pattern Recognition"];
const focusAreas = ["Conceptual Depth", "Retention Practice", "Time Confidence"];

const competencies = [
  "Conceptual Clarity",
  "Application Ability",
  "Reasoning Skills",
  "Retention Stability",
  "Confidence Readiness",
];

const sampleRadarValues = [
  { subject: "Conceptual Clarity", value: 78 },
  { subject: "Application Ability", value: 64 },
  { subject: "Reasoning Skills", value: 82 },
  { subject: "Retention Stability", value: 58 },
  { subject: "Confidence Readiness", value: 71 },
];

const StudentInsights = () => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const renderRadarTick = ({ payload, x, y, textAnchor }: { payload: { value: string }; x: number; y: number; textAnchor: string }) => {
    const [first, second] = String(payload.value).split(" ");
    return (
      <text x={x} y={y} textAnchor={textAnchor} fill="#6b7280" fontSize={12}>
        <tspan x={x} dy="0">{first}</tspan>
        {second ? <tspan x={x} dy="14">{second}</tspan> : null}
      </text>
    );
  };

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

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
    <div className="min-h-screen bg-secondary/25">
      <TopBar />
      <Navbar />

      <main className="pb-16 pt-6 md:pb-20 md:pt-10">
        <div className="container space-y-10 px-4 md:space-y-14">
          {/* Hero */}
          <section className="overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-slate-100 via-blue-50 to-blue-100 p-6 shadow-[0_12px_34px_hsl(var(--primary)/0.08)] md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  Insight Layer
                </p>
                <h1 className="text-3xl font-black leading-tight text-foreground md:text-5xl md:leading-[1.05]">
                  Student Insight Reports
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Understand how Spark maps strengths, learning gaps, and competency readiness through detailed,
                  structured insight reports designed for schools and families.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    className="h-12 rounded-full px-6 text-base font-semibold shadow-[0_12px_26px_hsl(var(--primary)/0.26)]"
                    onClick={() => setIsViewerOpen(true)}
                  >
                    View Student Reports
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  <Button asChild type="button" variant="outline" className="h-12 rounded-full px-6 text-base font-semibold">
                    <Link to="/registration">Register</Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/15 bg-background/70 p-4 shadow-[0_14px_34px_hsl(var(--primary)/0.10)] md:p-6">
                <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-[0_18px_40px_hsl(var(--primary)/0.08)]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-primary/10 p-2">
                        <Eye className="text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold">Student Insight Report</h4>
                        <p className="text-sm text-muted-foreground">Competency Snapshot</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">ANONYMISED</div>
                  </div>

                  <div className="h-40 rounded-lg border border-primary/5 bg-background/80">
                    <div className="h-full w-full p-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={sampleRadarValues} cx="50%" cy="50%" outerRadius="80%">
                          <PolarGrid stroke="#e6f0ff" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                          <Radar name="Sample" dataKey="value" stroke="#1666d3" fill="#1666d3" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-white p-3 shadow-[0_10px_28px_hsl(var(--primary)/0.06)]">
                      <p className="text-xs text-muted-foreground">READINESS</p>
                      <div className="mt-2 h-3 w-full rounded-full bg-slate-100">
                        <div className="h-3 w-3/5 rounded-full bg-gradient-to-r from-primary via-blue-400 to-transparent" />
                      </div>
                    </div>

                    <div className="rounded-lg bg-white p-3 shadow-[0_10px_28px_hsl(var(--primary)/0.06)]">
                      <p className="text-xs text-muted-foreground">Application</p>
                      <div className="mt-2 h-3 w-full rounded-full bg-slate-100">
                        <div className="h-3 w-3/5 rounded-full bg-gradient-to-r from-primary via-blue-400 to-transparent" />
                      </div>
                    </div>

                    <div className="rounded-lg bg-white p-3 shadow-[0_10px_28px_hsl(var(--primary)/0.06)]">
                      <p className="text-xs text-muted-foreground">Reasoning</p>
                      <div className="mt-2 h-3 w-full rounded-full bg-slate-100">
                        <div className="h-3 w-2/3 rounded-full bg-gradient-to-r from-primary via-blue-400 to-transparent" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="space-y-6 rounded-3xl border border-primary/15 bg-background p-6 shadow-sm md:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Report Benefits
              </p>
              <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">Built to make learning visible</h2>
              <p className="mt-3 text-muted-foreground md:text-lg">
                Each Insight Report is engineered around what truly helps a student grow — clarity, direction, and meaningful guidance.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {benefitCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.title} className="rounded-2xl border border-primary/15 bg-white p-6 shadow-[0_14px_34px_hsl(var(--primary)/0.10)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_hsl(var(--primary)/0.16)]">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{card.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Sample Preview */}
          <section id="sample-preview" className="rounded-3xl border border-primary/15 bg-gradient-to-br from-white via-blue-50/40 to-slate-50 p-6 shadow-sm md:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Sample Preview
              </p>
              <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">Inside a Spark Student Insight Report</h2>
              <p className="mt-3 text-muted-foreground md:text-lg">A compact view of the key report modules.</p>
            </div>

            <div className="relative mt-8 overflow-hidden rounded-[2.5rem] border border-blue-200 bg-white shadow-[0_30px_80px_rgba(15,85,206,0.16)]">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(29,78,216,0.12),_transparent_60%)]" />

              <div className="rounded-[2.5rem] bg-blue-700 px-6 py-7 text-white md:px-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-100 drop-shadow-[0_1px_1px_rgba(15,23,42,0.6)]">
                      Spark Olympiads - Insight Report
                    </p>
                    <h3 className="mt-2 text-xl font-semibold md:text-2xl drop-shadow-[0_1px_1px_rgba(15,23,42,0.6)]">
                      Student Performance Snapshot
                    </h3>
                  </div>
                  <span className="rounded-full border border-white/70 bg-white/35 px-4 py-1 text-xs font-semibold text-white drop-shadow-[0_1px_1px_rgba(15,23,42,0.6)]">
                    Sample - Anonymised
                  </span>
                </div>
              </div>

              <div className="space-y-6 px-6 py-8 md:px-10 md:py-10">
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="rounded-2xl border border-blue-200/70 bg-blue-50/60 p-5 shadow-[0_18px_40px_rgba(15,85,206,0.14)]">
                    <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Subject Readiness Overview
                    </div>
                    <div className="space-y-4">
                      {readinessItems.map((item) => (
                        <div key={item.subject}>
                          <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                            <span>{item.subject}</span>
                            <span className="text-xs font-semibold text-blue-600">Readiness</span>
                          </div>
                          <div className="mt-2 h-2.5 w-full rounded-full bg-blue-100">
                            <div
                              className="h-2.5 rounded-full bg-blue-600"
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex h-full flex-col rounded-2xl border border-blue-200/70 bg-white p-5 shadow-[0_18px_40px_rgba(15,85,206,0.12)]">
                    <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Strength Areas
                    </div>
                    <p className="mb-4 text-xs text-muted-foreground">
                      Strengths the student consistently demonstrates.
                    </p>
                    <ul className="space-y-3 text-sm text-foreground">
                      {strengthAreas.map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.22)]">
                            ✓
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-blue-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      High confidence signals reasoning & application.
                    </div>
                  </div>

                  <div className="flex h-full flex-col rounded-2xl border border-blue-200/70 bg-white p-5 shadow-[0_18px_40px_rgba(15,85,206,0.12)]">
                    <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Focus Areas
                    </div>
                    <p className="mb-4 text-xs text-muted-foreground">
                      Areas to refine with targeted support.
                    </p>
                    <ul className="space-y-3 text-sm text-foreground">
                      {focusAreas.map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-blue-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      Guided practice recommended in the next cycle.
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-200/70 bg-blue-50/70 p-5 shadow-[0_20px_44px_rgba(15,85,206,0.12)]">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10">
                      <ClipboardList className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                        Progress Guidance
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        The student demonstrates strong reasoning patterns and application instincts. Targeted practice in conceptual depth
                        and timed retention exercises is likely to translate into stronger overall readiness across upcoming learning cycles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Competency Insights (radar + details) */}
          <section className="rounded-3xl border border-primary/15 bg-white p-6 shadow-sm md:p-10">
            <div className="mx-auto max-w-5xl">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                <div className="order-2 lg:order-1">
                  <h2 className="text-2xl font-black text-foreground md:text-4xl">Visibility that goes beyond scores</h2>
                  <p className="mt-3 text-muted-foreground md:text-lg">
                    The report maps performance across five core competencies — helping educators see where depth, application, and confidence combine.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {competencies.map((c) => {
                      const isCenter = c === "Confidence Readiness";
                      return (
                        <div
                          key={c}
                          className={`rounded-lg border border-primary/10 bg-gradient-to-r from-white to-blue-50/30 p-4 shadow-[0_10px_24px_rgba(15,85,206,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,85,206,0.16)]${isCenter ? " sm:col-span-2 sm:justify-self-center sm:w-full sm:max-w-[360px]" : ""}`}
                        >
                          <h4 className="font-semibold">{c}</h4>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="order-1 flex items-center justify-center lg:order-2">
                  <div className="w-full max-w-sm">
                    <div className="rounded-2xl border border-primary/10 bg-background/50 p-6 shadow-[0_18px_40px_hsl(var(--primary)/0.06)]">
                      <div style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart
                            data={sampleRadarValues}
                            cx="50%"
                            cy="50%"
                            outerRadius="74%"
                            margin={{ top: 26, right: 34, bottom: 26, left: 34 }}
                          >
                            <PolarGrid stroke="#e6f0ff" />
                            <PolarAngleAxis dataKey="subject" tick={renderRadarTick} tickMargin={12} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                            <Radar name="Student" dataKey="value" stroke="#1666d3" fill="#1666d3" fillOpacity={0.6} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-blue-50 via-blue-50/60 to-blue-100/70 p-6 shadow-[0_20px_55px_hsl(var(--primary)/0.10)] md:p-12">
            <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-100/70 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-blue-200/50 blur-3xl" />

            <div className="relative mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Ready When You Are
              </p>
              <h3 className="mt-4 text-2xl font-black text-foreground md:text-3xl">
                Ready to see a full report?
              </h3>
              <p className="mt-3 text-muted-foreground md:text-lg">
                Request a sample report or register your school to get started.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={() => setIsViewerOpen(true)}
                  className="h-12 rounded-full px-7 text-base font-semibold shadow-[0_12px_28px_hsl(var(--primary)/0.25)]"
                >
                  View Student Reports
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-full px-7 text-base font-semibold">
                  <Link to="/registration">Register</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Sample Student Insight Report</DialogTitle>
            <DialogDescription>Preview the anonymised sample report.</DialogDescription>
          </DialogHeader>

          <div className="mt-4 h-[70vh]">
            <iframe className="h-full w-full" src="/student_report.pdf#toolbar=0&navpanes=0&scrollbar=1&view=FitH" title="Student Report" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentInsights;
