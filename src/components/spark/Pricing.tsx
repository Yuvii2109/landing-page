import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Pricing = () => (
  <section className="py-16 md:py-24 bg-white" id="pricing">
    <div className="container px-4">
      <h2 className="text-2xl md:text-4xl font-extrabold text-center text-slate-900 mb-10">Program Overview</h2>

      <div className="max-w-4xl mx-auto">
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="border-primary/15 shadow-[0_10px_24px_rgba(15,78,168,0.08)] transition-shadow duration-300 hover:shadow-[0_16px_32px_rgba(15,78,168,0.14)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg text-primary">Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base md:text-lg font-semibold">1-10</p>
            </CardContent>
          </Card>

          <Card className="border-primary/15 shadow-[0_10px_24px_rgba(15,78,168,0.08)] transition-shadow duration-300 hover:shadow-[0_16px_32px_rgba(15,78,168,0.14)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg text-primary">Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base md:text-lg font-semibold">English, Maths, Science, EVS, India Awareness</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5 shadow-[0_10px_24px_rgba(15,78,168,0.10)] transition-shadow duration-300 hover:shadow-[0_16px_32px_rgba(15,78,168,0.16)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg text-primary">Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-base md:text-lg">
                <li>₹200 - Single Subject</li>
                <li>₹700 - All Subjects</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5 shadow-[0_10px_24px_rgba(15,78,168,0.10)] transition-shadow duration-300 hover:shadow-[0_16px_32px_rgba(15,78,168,0.16)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg text-primary">Exam Window</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-base md:text-lg">
                <li>October: 26th - 31st</li>
                <li>November: 23rd - 30th</li>
                <li>December: 1st - 15th</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-primary/15 shadow-[0_10px_24px_rgba(15,78,168,0.08)] transition-shadow duration-300 hover:shadow-[0_16px_32px_rgba(15,78,168,0.14)]">
            <CardContent className="pt-6">
              <p className="text-base md:text-lg leading-relaxed">
                Schools can choose their preferred dates within the given window.
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-primary/15 shadow-[0_10px_24px_rgba(15,78,168,0.08)] transition-shadow duration-300 hover:shadow-[0_16px_32px_rgba(15,78,168,0.14)]">
            <CardContent className="pt-6">
              <p className="text-base md:text-lg leading-relaxed">
                <span className="font-semibold">Mode:</span> Fully online-conducted at school under supervision or from home with secure proctoring.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </section>
);

export default Pricing;
