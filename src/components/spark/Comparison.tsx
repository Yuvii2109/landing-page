import { XCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const traditional = [
  "Rote-based MCQs",
  "No proctoring",
  "Generic results",
  "One-size-fits-all",
  "Paper-heavy logistics",
];

const spark = [
  "Competency-mapped questions",
  "AI-proctored environment",
  "Precision analytics per student",
  "NEP & NCF aligned framework",
  "Fully online, hassle-free",
];

const Comparison = () => (
  <section className="py-12 md:py-16 bg-white" id="comparison">
    <div className="container px-4">
      <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-3">Why SPARK?</h2>
      <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">See how SPARK Olympiad compares to traditional assessments.</p>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Traditional */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive text-lg">Traditional Olympiads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {traditional.map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <XCircle size={18} className="text-destructive shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* SPARK */}
        <Card className="border-primary/30 bg-primary/5 ring-2 ring-primary/20">
          <CardHeader>
            <CardTitle className="text-primary text-lg">SPARK Olympiad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {spark.map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle size={18} className="text-spark-green shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

export default Comparison;
