import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import TopBar from "@/components/spark/TopBar";
import Navbar from "@/components/spark/Navbar";
import Footer from "@/components/spark/Footer";

const sections = [
  {
    title: "1. Eligibility & Registration",
    content: [
      "Only students officially registered through their school can participate.",
      "Registration must include accurate personal details—name, grade, school, and photo ID. Any false information may lead to disqualification.",
    ],
  },
  {
    title: "2. Exam Setup & Technical Requirements",
    content: [
      "Operating System and Browser Requirements",
      "Windows 10 or higher - Microsoft Edge - Chrome - JavaScript must be enabled - Minimum Screen Resolution: 1024 × 768",
      "Mac OS 11 or higher - Safari - Chrome - JavaScript must be enabled - Minimum Screen Resolution: 1024 × 768",
      "Chrome OS (Chromebooks) - Chrome - Managed Chromebook required for secure testing - Recommended Screen Resolution: 1366 x 768",
      "Memory and Network Requirements",
      "RAM: 8 GB RAM or more",
      "Internet/Network: High Speed Internet connection required, 10 Mbps per user",
      "100 users × 10 Mbps/user = 1000 Mbps or 1 Gbps Total Network.",
      "Wireless Guidelines",
      "Recommended Minimum Download Speed: 10-15 Mbps per user.",
      "Recommended Minimum Upload Speed: 3-5 Mbps per user.",
      "The school’s Wi-Fi infrastructure should be capable of supporting a high number of simultaneous connections.",
    ],
  },
  {
    title: "3. Access & Login",
    content: [
      "Each participant gets a unique username and password.",
      "Login credentials are single-use and non-transferable; multiple logins will result in automatic termination.",
    ],
  },
  {
    title: "4. Exam Conduct & Monitoring",
    content: [
      "No other tabs, applications, or devices allowed once the exam begins—violation leads to immediate termination.",
      "Only authorized staff and proctors may be present in the lab; no assistance from others is allowed.",
    ],
  },
  {
    title: "5. Integrity & Fair Play",
    content: [
      "Participants must act honestly—no plagiarism, copying, or use of unauthorized aids (notes, calculators, phones, browsers).",
    ],
  },
  {
    title: "6. Technical Interruptions & Timing",
    content: [
      "No extra time or reattempt is allowed due to technical issues (power loss, internet failure, hardware malfunction). The timer starts when the exam window opens; submission after the allotted time is final.",
      "Accidentally closing/reloading the window counts as submission; no retake allowed.",
    ],
  },
  {
    title: "7. Results, Awards & Communications",
    content: [
      "Exam results are final. No reevaluation or appeals permitted.",
      "Awards/certificates will be distributed through schools only.",
      "By registering, participants agree to receive communications regarding exam schedules and results.",
    ],
  },
  {
    title: "8. Rescheduling & Refunds",
    content: [
      "Exam dates and times are fixed. Missing the session does not allow for rescheduling or refunds.",
    ],
  },
  {
    title: "10. Amendments & Legal Jurisdiction",
    content: [
      "Organizers reserve the right to change rules—format, timing, scoring—at any time, and such changes are effective immediately.",
      "All exam-related disputes are governed by the laws of [Your State/Country], under the jurisdiction of courts in [City].",
    ],
  },
];

const TermsAndConditions = () => (
  <div className="min-h-screen bg-secondary/30">
    <TopBar />
    <Navbar />

    <main className="py-10 md:py-16">
      <div className="container px-4">
        <div className="mx-auto max-w-4xl space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <section className="rounded-2xl border border-border bg-background/90 p-6 shadow-sm md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Terms &amp; Conditions</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Sparkolympiads School Computer Lab Online Exam Terms &amp; Conditions</h1>

            <div className="mt-8 space-y-8">
              {sections.map((section) => (
                <article key={section.title} className="space-y-3">
                  <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                  <div className="space-y-2 text-sm leading-7 text-muted-foreground">
                    {section.content.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>

    <Footer />
  </div>
);

export default TermsAndConditions;