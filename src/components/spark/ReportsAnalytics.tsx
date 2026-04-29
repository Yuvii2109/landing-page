import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ReportsAnalytics = () => {
  const reports = [
    {
      id: "national_recognition_awards",
      title: "National Recognition & Achievement Benchmarks",
      description:
        "Explore medals, certificates, national achievers, and school excellence recognitions from SPARK Olympiads across India.",
      cta: "View National Achievement Trends",
      href: "/national-achievement",
    },
    {
      id: "school_performance_analytics",
      title: "Institutional Benchmark Alignment Analytics",
      description:
        "See how SPARK benchmarking compares schools against national averages with competency-level academic insights.",
      cta: "Explore Benchmark Alignment Reports",
    },
    {
      id: "student_insight_reports",
      title: "Competency Insight Diagnostics",
      description:
        "Understand how SPARK maps strengths, learning gaps, and competency readiness through detailed personalized reports.",
      cta: "View Sample Competency Diagnostics",
    },
    {
      id: "events_academic_showcase",
      title: "National Academic Engagement & Leadership Interactions",
      description:
        "Explore award ceremonies, school participation moments, leadership interactions, and national SPARK celebrations.",
      cta: "View National Engagement Highlights",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-secondary/30" id="reports-analytics">
      <div className="container px-4">
        <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-3">
          SPARK Academic Impact & Benchmark Intelligence Hub
        </h2>
        <p className="text-muted-foreground text-center mb-10 max-w-3xl mx-auto">
          Explore national achievements, competency insights, institutional benchmarking, and SPARK learning impact across
          participating schools.
        </p>
        <p className="text-muted-foreground text-center mb-10 max-w-3xl mx-auto">
          Spark Olympiad generates structured academic intelligence across participating institutions each year. This
          section provides a window into the benchmarking layers, recognition outcomes, and competency insights that
          support school-level improvement decisions.
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
          {reports.map((report) => (
            <div
              key={report.id}
              className="relative group flex h-full flex-col rounded-lg border border-primary/20 bg-primary/5 p-5 md:min-h-[202px] hover:shadow-lg transition-shadow"
            >
              <div className="mb-3 flex flex-1 items-start gap-3">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-1">{report.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
                </div>
              </div>

              {report.href ? (
                <Button asChild type="button" variant="outline" className="mt-auto w-full rounded-md font-semibold">
                  <Link to={report.href}>{report.cta}</Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-auto w-full rounded-md font-semibold"
                  disabled
                >
                  {report.cta}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReportsAnalytics;
