import { Globe, Brain, ShieldCheck, BarChart3, Users, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const reasons = [
  { icon: Globe, title: "Globally Trusted Testing", desc: "Powered by Prometric's world-class assessment infrastructure." },
  { icon: Brain, title: "Competency Architecture", desc: "Questions mapped to higher-order thinking skills, not rote recall." },
  { icon: ShieldCheck, title: "Ultra-Secure Platform", desc: "AI proctoring with live monitoring ensures exam integrity." },
  { icon: BarChart3, title: "Precision Analytics", desc: "Detailed per-student reports with competency heatmaps." },
  { icon: Users, title: "Credible Steering Committee", desc: "Guided by education leaders and policy experts." },
  { icon: Award, title: "Unmatched Accolades", desc: "Nationally recognized certificates and awards for top performers." },
];

const Reasons = () => (
  <section className="py-16 md:py-24" id="why-spark">
    <div className="container px-4">
      <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-3">6 Reasons to Choose SPARK</h2>
      <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">What makes SPARK Olympiad the gold standard in academic assessment.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {reasons.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Icon size={20} className="text-primary" />
              </div>
              <h3 className="font-bold text-base mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default Reasons;
