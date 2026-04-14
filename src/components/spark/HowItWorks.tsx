import { School, CalendarCheck, UserPlus, Monitor, FileBarChart } from "lucide-react";

const steps = [
  { icon: School, title: "Register School", desc: "Fill the registration form with school details." },
  { icon: UserPlus, title: "Add Students", desc: "Upload student lists for each participating class." },
  { icon: CalendarCheck, title: "Select Exam Slot", desc: "Choose a convenient exam window (Oct–Dec)." },
  { icon: Monitor, title: "Conduct Exam", desc: "Students take the AI-proctored exam online." },
  { icon: FileBarChart, title: "Get Reports", desc: "Receive detailed competency analytics per student." },
];

const HowItWorks = () => (
  <section className="py-16 md:py-24 bg-secondary/30" id="how-it-works">
    <div className="container px-4">
      <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-3">How It Works</h2>
      <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">A simple 5-step process from registration to results.</p>

      {/* Mobile: vertical */}
      <div className="flex flex-col lg:hidden gap-6 max-w-md mx-auto">
        {steps.map(({ icon: Icon, title, desc }, i) => (
          <div key={title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                {i + 1}
              </div>
              {i < steps.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
            </div>
            <div className="pb-6">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} className="text-primary" />
                <h3 className="font-bold text-sm">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: horizontal */}
      <div className="hidden lg:grid grid-cols-5 gap-4 max-w-5xl mx-auto">
        {steps.map(({ icon: Icon, title, desc }, i) => (
          <div key={title} className="text-center relative">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto mb-3">
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="absolute top-6 left-[calc(50%+24px)] w-[calc(100%-48px)] h-px bg-border" />
            )}
            <Icon size={20} className="text-primary mx-auto mb-2" />
            <h3 className="font-bold text-sm mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
