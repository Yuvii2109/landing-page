import { Award, Trophy, Gift, Book } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const rewards = [
  {
    icon: Award,
    title: "Certificates",
    desc: "Recognition of achievement for all participants",
  },
  {
    icon: Trophy,
    title: "Medals",
    desc: "Awarded to top-performing students",
  },
  {
    icon: Book,
    title: "Academic Enrichment",
    desc: "Workshops, insights and future-ready learning opportunities",
  },
];

const Rewards = () => (
  <section className="py-12 md:py-16 bg-secondary/30" id="why-spark">
    <div className="container px-4">
      <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-3">Recognition That Goes Beyond Medals</h2>
      <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">Every participant is recognized - but for top performers, SPARK goes much further.</p>

      <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
        {rewards.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Icon size={24} className="text-primary" />
              </div>
              <h3 className="font-bold text-base text-center mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed text-center">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <p className="text-base md:text-lg text-muted-foreground">
          <span className="font-semibold">SPARK goes beyond recognition - creating meaningful academic growth for all stakeholders.</span>
        </p>
      </div>
    </div>
  </section>
);

export default Rewards;
