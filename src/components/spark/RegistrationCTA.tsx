import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const RegistrationCTA = () => (
  <section className="py-16 md:py-24" id="register">
    <div className="container px-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-background p-8 md:p-10 text-center shadow-[0_12px_30px_rgba(15,78,168,0.10)]">
        <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-3">Empower Your Students with a Smarter Olympiad</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
          <br/>Join a growing network of schools choosing deeper learning, meaningful benchmarking, and future-ready academic excellence.
        </p>
        <Button asChild size="lg" className="rounded-md bg-[#ff5d1f] hover:bg-[#f34d0f] text-white font-semibold px-8">
          <a href="/registration">
            Join SPARK 2026-27 <ArrowUpRight size={18} />
          </a>
        </Button>
      </div>
    </div>
  </section>
);

export default RegistrationCTA;