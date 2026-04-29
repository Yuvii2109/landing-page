const Footer = () => (
  <footer className="relative overflow-hidden bg-spark-dark text-spark-slate">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.18),transparent_42%),radial-gradient(circle_at_85%_0%,hsl(var(--spark-green)/0.14),transparent_34%)]" />

    <div className="container relative px-4 py-14">
      <div className="mb-10 grid gap-10 border-b border-spark-slate/15 pb-10 lg:grid-cols-[1.2fr_0.8fr_0.9fr]">
        <div className="max-w-xl">
          <img src="/spark.png" alt="Spark Olympiad" className="mb-5 h-12 w-auto" />
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-spark-slate/80">
            An Initiative of EDXSO & Prometric
          </p>
          <p className="text-sm leading-relaxed text-spark-slate/70">
            SPARK Olympiad helps schools benchmark student readiness with structured assessments, meaningful insights, and
            outcome-led academic support.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-spark-slate/90">Explore</h3>
          <ul className="space-y-3 text-sm text-spark-slate/75">
            <li>
              <a href="/#comparison" className="transition-colors hover:text-primary">
                Why SPARK
              </a>
            </li>
            <li>
              <a href="/#how-it-works" className="transition-colors hover:text-primary">
                How It Works
              </a>
            </li>
            <li>
              <a href="/#faq" className="transition-colors hover:text-primary">
                FAQ
              </a>
            </li>
            <li>
              <a href="mailto:reachout@sparkolympiads.com" className="transition-colors hover:text-primary">
                Contact Team
              </a>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-spark-slate/20 bg-spark-slate/5 p-5 backdrop-blur-sm">
          <p className="mb-2 text-sm font-semibold text-spark-slate/95">Ready to Enroll Your School?</p>
          <p className="mb-5 text-sm leading-relaxed text-spark-slate/70">
            Begin registration in minutes and secure your school&apos;s participation for the current SPARK Olympiad cycle.
          </p>
          <a
            href="/registration"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:translate-y-[-1px] hover:shadow-[0_10px_24px_hsl(var(--primary)/0.28)]"
          >
            Register Your School
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-xs text-spark-slate/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} SPARK Olympiad. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="/privacy-policy" className="transition-colors hover:text-spark-slate/90">
            Privacy
          </a>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-spark-slate/40" />
          <a href="/terms-and-conditions" className="transition-colors hover:text-spark-slate/90">
            Terms
          </a>
        </div>
      </div>

      <p className="mt-1 text-[10px] leading-none text-transparent select-text">
        -....- -.-- ...
      </p>
    </div>
  </footer>
);

export default Footer;
