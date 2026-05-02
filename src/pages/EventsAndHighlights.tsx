import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Globe2,
  GraduationCap,
  Handshake,
  Heart,
  Medal,
  Quote,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { useLayoutEffect, type SVGProps } from "react";
import { Link } from "react-router-dom";
import TopBar from "@/components/spark/TopBar";
import Navbar from "@/components/spark/Navbar";
import Footer from "@/components/spark/Footer";
import { Button } from "@/components/ui/button";

const highlightCards = [
  {
    title: "Student Participation",
    description: "Learners across India stepping forward to engage with meaningful academic challenges.",
    icon: Users,
  },
  {
    title: "Recognition Celebrations",
    description: "Certificates, medals and stage moments that honour effort, growth and achievement.",
    icon: Trophy,
  },
  {
    title: "Institutional Engagement",
    description: "Schools embracing Spark as a structured academic experience for their students.",
    icon: GraduationCap,
  },
  {
    title: "Community Building",
    description: "Educators, leaders and students coming together around a shared learning culture.",
    icon: Heart,
  },
];

const milestones = [
  {
    label: "Learning",
    title: "Designed for Real Classrooms",
    description: "Built to fit naturally into how schools already teach and learn.",
    icon: BookOpen,
  },
  {
    label: "Reach",
    title: "Extensive Nationwide Presence",
    description: "Students from diverse regions and boards participating side by side.",
    icon: Globe2,
  },
  {
    label: "Focus",
    title: "Recognition That Means Something",
    description: "Every certificate tied to genuine effort, growth and engagement.",
    icon: Medal,
  },
  {
    label: "Spirit",
    title: "Curiosity, Not Just Competition",
    description: "Celebrating the act of trying, the habit of learning, the joy of progress.",
    icon: Sparkles,
  },
];

const educatorQuotes = [
  {
    quote: "Our students looked forward to Spark week. It gave them a reason to engage with learning beyond the textbook.",
    role: "Academic Coordinator",
    org: "Participating School",
  },
  {
    quote: "Receiving a Spark certificate on stage was a moment of real pride for our learner and for the entire class.",
    role: "Class Teacher",
    org: "Participating School",
  },
  {
    quote: "Spark gave our school a structured way to celebrate effort, not just outcomes.",
    role: "School Leader",
    org: "Participating Institution",
  },
];

const ClipboardCheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 2h6a2 2 0 0 1 2 2v2h-2" />
    <path d="M9 2a2 2 0 0 0-2 2v2H5" />
    <path d="M7 6h10v14H7z" />
    <path d="m9 13 2 2 4-4" />
  </svg>
);

const journeySteps = [
  { title: "Register Institutions", icon: CalendarCheck },
  { title: "Student Participation", icon: Users },
  { title: "Assessments", icon: ClipboardCheckIcon },
  { title: "Recognition Moments", icon: Trophy },
  { title: "Continued Engagement", icon: ArrowRight },
];

const communityCards = [
  {
    title: "Educator Participation",
    description: "Teachers actively shaping a culture of curiosity and rigour.",
    icon: GraduationCap,
  },
  {
    title: "School Leadership Engagement",
    description: "Principals championing structured academic experiences.",
    icon: Handshake,
  },
  {
    title: "Recognition Culture",
    description: "Celebrating effort, growth and excellence in equal measure.",
    icon: Trophy,
  },
  {
    title: "Collaborative Ecosystem",
    description: "Schools, students and partners growing together.",
    icon: Users,
  },
];


const EventsAndHighlights = () => {
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
          <section className="overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-slate-100 via-blue-50 to-blue-100 p-6 shadow-[0_12px_34px_hsl(var(--primary)/0.08)] md:p-10">
            <div className="text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                <Sparkles className="h-4 w-4" />
                Spark Olympiads - 2025 Highlights
              </p>
              <h1 className="mt-5 text-3xl font-black leading-tight text-foreground md:text-5xl">
                SPARK Events
                <span className="block text-primary">&amp; Highlights</span>
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                A national academic movement built on student participation, meaningful recognition, and the everyday
                engagement of schools across India.
              </p>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Spark Olympiads creates structured academic experiences that bring students, educators, and institutions
                together - one moment, one milestone at a time.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild type="button" className="h-12 rounded-full px-6 text-base font-semibold shadow-[0_12px_26px_hsl(var(--primary)/0.26)]">
                  <a href="#events-highlights">
                    Explore Milestones
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild type="button" variant="outline" className="h-12 rounded-full px-6 text-base font-semibold">
                  <Link to="/registration">Partner With Spark</Link>
                </Button>
              </div>
            </div>
          </section>

          <section
            id="events-highlights"
            className="space-y-6 rounded-3xl border border-primary/15 bg-gradient-to-br from-slate-50 via-blue-50/60 to-blue-100/70 p-6 shadow-sm md:p-10"
          >
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Milestones
              </p>
              <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">Moments That Defined Spark</h2>
              <p className="mt-3 text-muted-foreground md:text-lg">
                Moments that capture participation, recognition, and the shared academic culture Spark builds.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {highlightCards.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    data-reveal-item
                    style={{ transitionDelay: `${index * 80}ms` }}
                    className="rounded-3xl border border-primary/15 bg-white p-5 shadow-[0_14px_34px_hsl(var(--primary)/0.08)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_22px_48px_hsl(var(--primary)/0.16)]"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="min-h-[2.7rem] text-lg font-bold text-foreground md:min-h-[3rem]">{item.title}</h3>
                    <p className="mt-0 text-sm text-muted-foreground">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="milestones" className="space-y-6 rounded-3xl border border-primary/15 bg-background p-6 shadow-sm md:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Milestones
              </p>
              <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">What Spark 2025 Stood For</h2>
              <p className="mt-3 text-muted-foreground md:text-lg">
                A year of academic moments that shaped a national learning movement.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {milestones.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    data-reveal-item
                    style={{ transitionDelay: `${index * 80}ms` }}
                    className="rounded-3xl border border-primary/15 bg-secondary/30 p-5 shadow-[0_14px_34px_hsl(var(--primary)/0.08)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_22px_48px_hsl(var(--primary)/0.16)]"
                  >
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{item.label}</p>
                    <h3 className="mt-2 text-lg font-bold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-primary/15 bg-background p-6 shadow-sm md:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Voices from the Movement
              </p>
              <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">What Educators Tell Us</h2>
              <p className="mt-3 text-muted-foreground md:text-lg">
                Anonymised reflections from schools that took part in Spark Olympiads.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {educatorQuotes.map((item, index) => (
                <article
                  key={item.role}
                  data-reveal-item
                  style={{ transitionDelay: `${index * 80}ms` }}
                  className="flex h-full flex-col rounded-3xl border border-primary/15 bg-secondary/20 p-6 shadow-[0_14px_34px_hsl(var(--primary)/0.08)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_22px_48px_hsl(var(--primary)/0.16)]"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Quote className="h-6 w-6" />
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">&quot;{item.quote}&quot;</p>
                  <div className="mt-6 border-t border-primary/10 pt-4">
                    <p className="text-sm font-bold text-foreground">{item.role}</p>
                    <p className="text-xs text-muted-foreground">{item.org}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-primary/15 bg-gradient-to-br from-white via-blue-50/40 to-slate-50 p-6 shadow-sm md:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                The Journey
              </p>
              <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">Participation Journey</h2>
              <p className="mt-3 text-muted-foreground md:text-lg">
                Spark creates a complete academic engagement journey beyond a single exam experience.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-5 lg:items-center">
              {journeySteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex items-center gap-4 lg:flex-col lg:gap-3">
                    <div
                      data-reveal-item
                      style={{ transitionDelay: `${index * 80}ms` }}
                      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_18px_34px_hsl(var(--primary)/0.24)]"
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-left lg:text-center">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Step {index + 1}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground md:text-base">{step.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-primary/15 bg-background p-6 shadow-sm md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="overflow-hidden rounded-3xl border border-primary/15 bg-secondary/30 shadow-[0_20px_46px_hsl(var(--primary)/0.12)]">
                <img
                  src="/image4.jpeg"
                  alt="Leadership roundtable on academic engagement"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  Leadership &amp; Engagement
                </p>
                <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">
                  Building Stronger Academic Communities
                </h2>
                <p className="mt-3 text-muted-foreground md:text-lg">
                  Spark brings together the people who shape student journeys - teachers, school leaders and institutional partners.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {communityCards.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <article
                        key={item.title}
                        data-reveal-item
                        style={{ transitionDelay: `${index * 80}ms` }}
                        className="rounded-2xl border border-primary/15 bg-secondary/20 p-4 shadow-[0_14px_34px_hsl(var(--primary)/0.08)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_22px_48px_hsl(var(--primary)/0.16)]"
                      >
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                        <p className="mt-2 text-xs text-muted-foreground md:text-sm">{item.description}</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 p-6 text-white shadow-[0_22px_60px_rgba(12,78,204,0.35)] md:p-12">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[size:42px_42px] opacity-55" />
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-blue-400/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="relative z-10 text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                Join the Movement
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
                Be Part of the Next
                <br />
                Spark Success Story
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-base text-blue-100 md:text-lg">
                Join Spark Olympiads and bring structured academic participation, recognition, and meaningful learning
                experiences to your institution.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  className="h-12 rounded-full border-white/80 bg-white px-6 text-base font-semibold text-slate-900 hover:bg-white"
                >
                  <Link to="/registration">Register School</Link>
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

export default EventsAndHighlights;
