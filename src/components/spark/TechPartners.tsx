import { Card, CardContent } from "@/components/ui/card";

const TechPartners = () => (
  <section className="py-16 md:py-24" id="about-edxso-prometric">
    <div className="container px-4">
      <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-12">About EDXSO & Prometric</h2>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="shadow-[0_10px_24px_rgba(15,78,168,0.08)] transition-shadow duration-300 hover:shadow-[0_16px_36px_rgba(15,78,168,0.16)]">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-xl font-bold mb-3 text-primary">EDXSO</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              EDXSO is a leading education consulting and solutions provider transforming K-12 education through competency-based assessments, teacher training, and data-driven academic interventions. <br/><br/>
              With expertise in curriculum design, leadership development, and AI-enabled assessments, EDXSO partners with schools and institutions to enhance learning outcomes and build future-ready academic ecosystems. Recognizing the need for more credible and rigorous assessments, EDXSO launched SPARK-India's first fully online Olympiad-in partnership with Prometric.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-[0_10px_24px_rgba(15,78,168,0.08)] transition-shadow duration-300 hover:shadow-[0_16px_36px_rgba(15,78,168,0.16)]">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-xl font-bold mb-3 text-primary">Prometric</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Prometric is a global leader in secure, technology-enabled assessment solutions, operating across 180+ countries.<br/><br/>
              Trusted by leading organizations such as ETS (GRE) and CFA Institute, Prometric specializes in large-scale, high-stakes testing powered by advanced analytics and AI-driven proctoring.<br/><br/>
              With a strong focus on integrity, accuracy, and innovation, Prometric sets global benchmarks in delivering reliable and scalable assessment systems.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-12 max-w-4xl mx-auto rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 shadow-[0_10px_24px_rgba(15,78,168,0.10)]">
        <p className="text-center text-sm md:text-base font-medium text-slate-700 leading-relaxed">
          Together, EDXSO and Prometric bring global standards to school assessments-making them more insightful, secure, and impactful.
        </p>
      </div>
    </div>
  </section>
);

export default TechPartners;
