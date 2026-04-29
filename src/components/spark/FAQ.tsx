import { useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "Is the exam online or offline?",
    a: "The exam is fully online and can be conducted in school under supervision, or students may take it from home through a secure proctored system.",
  },
  {
    q: "Can students select multiple subjects?",
    a: "Yes, students can choose multiple subjects based on their preference.",
  },
  {
    q: "What is the exam duration?",
    a: "The duration varies by class level (approx. 45-60 minutes per test).",
  },
  {
    q: "Can schools choose their exam dates?",
    a: "Yes, schools can select a preferred exam window between October and December.",
  },
  {
    q: "What infrastructure is required if conducting in School?",
    a: "A basic computer lab with internet connectivity is required to conduct the exam.",
  },
  {
    q: "What if a school does not have sufficient computers?",
    a: "The exam can be conducted in multiple slots to accommodate all students.",
  },
  {
    q: "Will technical support be provided?",
    a: "Yes, complete technical and operational support will be provided before and during the exam.",
  },
  {
    q: "What kind of reports will schools receive?",
    a: "Schools receive detailed reports including student-level insights, class performance, and national benchmarking.",
  },
  {
    q: "How will these reports help schools?",
    a: "They help identify learning gaps, improve teaching strategies, and enhance academic outcomes.",
  },
  {
    q: "Will all students receive certificates?",
    a: "Yes, all participating students receive certificates.",
  },
  {
    q: "Are there awards for top performers?",
    a: "Yes, top-performing students receive medals, certificates, scholarships and some surprises.",
  },
  {
    q: "Are teachers and schools also recognized?",
    a: "Yes, awards and recognition are given to teachers and principals of top-performing schools.",
  },
  {
    q: "Is there any upfront payment required?",
    a: "No immediate payment is required at the time of school registration.",
  },
  {
    q: "Why should our school participate in SPARK?",
    a: "SPARK helps schools benchmark performance nationally, gain actionable insights, and move towards future-ready, data-driven education.",
  },
  {
    q: "Who will be our point of contact?",
    a: "A coordinator from the SPARK team will be assigned to each school.",
  },
];

const FAQ = () => {
  const [showAll, setShowAll] = useState(false);

  const visibleFaqs = useMemo(() => {
    if (showAll) return faqs;
    return faqs.slice(0, 5);
  }, [showAll]);

  return (
    <section className="py-12 md:py-16" id="faq">
      <div className="container px-4 max-w-3xl">
        <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-12">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {visibleFaqs.map((faq, i) => (
            <AccordionItem key={faq.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm md:text-base font-semibold">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {!showAll && (
          <div className="mt-6 flex justify-center">
            <Button type="button" variant="outline" onClick={() => setShowAll(true)}>
              Load More FAQs
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQ;
