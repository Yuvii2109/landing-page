import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import TopBar from "@/components/spark/TopBar";
import Navbar from "@/components/spark/Navbar";
import Footer from "@/components/spark/Footer";

const sections = [
  {
    title: "1. Introduction",
    content: [
      'Welcome to Sparkolympiads ("we", "us", "our"). This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you participate in Sparkolympiads—whether via our website, registration forms, mobile app, or other services.',
    ],
  },
  {
    title: "2. Information We Collect",
    content: [
      "Personal Information: Provided by you: name, email, phone number, school or institution, age/grade, date of birth, location.",
      "Optional demographic details (e.g., gender).",
      "Usage & Technical Data: Device info (IP address, browser, OS), app usage logs, timestamps, cookies, and tracking data.",
    ],
  },
  {
    title: "3. How We Collect Information",
    content: [
      "Voluntary Submission: Registration forms, surveys, support requests.",
      "Automatic Collection: Analytics tools (e.g., Google Analytics), device logs, cookies.",
    ],
  },
  {
    title: "4. Purpose of Using Your Data",
    content: [
      "Manage competition registration, communication, and administration.",
      "Send updates, results, reminders, and related materials.",
      "Maintain and improve the website/app functionality, troubleshoot issues, and enhance user experience.",
      "Analyze performance trends to optimize future events.",
    ],
  },
  {
    title: "5. Legal Basis for Processing",
    content: [
      "Consent – when participating, registering, or subscribing.",
      "Contractual necessity – to fulfill event participation.",
      "Legitimate interests – for security, platform optimization, and analytics.",
    ],
  },
  {
    title: "6. Data Sharing",
    content: [
      "We do not sell personal information. We may share your data with service providers (e.g., hosting, email delivery, analytics), partners or sponsors when you explicitly consent, and legal or security authorities when required to comply with laws or protect our rights.",
    ],
  },
  {
    title: "7. Data Retention",
    content: [
      "We retain personal data only as long as needed to fulfill event administration, comply with legal obligations, resolve disputes, or enhance services. Usage and analytics data may be retained in aggregated or anonymized form.",
    ],
  },
  {
    title: "8. International Data Transfers",
    content: [
      "Your data may be transferred internationally if our servers or third-party services are outside your region. We ensure adequate safeguards like standard contractual clauses to protect your information.",
    ],
  },
  {
    title: "9. Cookies & Tracking",
    content: [
      "Essential cookies for account, registration, and login functions.",
      "Analytics cookies (e.g., Google Analytics) to measure and improve use.",
      "You can manage or disable cookies via browser settings or built-in tools.",
    ],
  },
  {
    title: "10. User Rights",
    content: [
      "Depending on your region (GDPR, CCPA, etc.), you may have rights to access, correct, or delete your personal data; object to or restrict processing; and withdraw consent.",
    ],
  },
  {
    title: "11. Children’s Data",
    content: [
      "We do not knowingly collect data from children under 13 without verifiable parental consent. Parents/guardians can request access, correction, or deletion of children’s data.",
    ],
  },
  {
    title: "12. Data Security",
    content: [
      "We implement appropriate technical and organizational measures: encryption, access controls, secure servers. However, no system is fully secure—please use strong, unique credentials.",
    ],
  },
  {
    title: "13. External Links",
    content: [
      "Our site/app may link to external sites/services. We are not responsible for their privacy practices. Please review their Privacy Policies independently.",
    ],
  },
  {
    title: "14. Policy Updates",
    content: [
      'We may update this policy; the “Last updated” date will reflect changes. Significant modifications will be announced via email or prominent platform notices.',
    ],
  },
  {
    title: "15. Contact Information",
    content: [
      "EDXSO LLP",
      "14 DSIDC Computer Complex, Scheme 1, Okhla Industrial Area Phase II, New Delhi-110020 India",
      "Email: info@sparkolympiads.com",
      "Phone: +91 8447477275",
    ],
  },
];

const PrivacyPolicy = () => (
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Privacy Policy</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Sparkolympiads Privacy Policy</h1>
            <p className="mt-3 text-sm text-muted-foreground">Last updated: 27-06-2025</p>

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

export default PrivacyPolicy;