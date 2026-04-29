import { ChevronDown, Mail, Menu, Phone, X } from "lucide-react";
import { useState } from "react";

const navSections = [
  { label: "Partner Schools", href: "/#highlights" },
  { label: "About Spark", href: "/#about-spark" },
  { label: "Reports & Analytics", href: "/#reports-analytics" },
  { label: "Why Spark", href: "/#comparison" },
  { label: "Recognition", href: "/#why-spark" },
  { label: "Program Overview", href: "/#pricing" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Register", href: "/registration" },
  { label: "About EDXSO & Prometric", href: "/#about-edxso-prometric" },
  { label: "FAQs", href: "/#faq" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(true);

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container relative flex min-h-[84px] items-center justify-between px-4">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex shrink-0 items-center justify-center rounded-md p-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
          <span className="sr-only">Menu</span>
        </button>

        <a
          href="/"
          aria-label="SPARK Olympiad home"
          className="absolute left-1/2 -translate-x-1/2 rounded-xl px-6 py-3"
        >
          <img
            src="/spark.png"
            alt="SPARK Olympiad"
            className="h-10 w-auto max-w-[42vw] object-contain sm:h-11 sm:max-w-[220px] md:h-12 md:max-w-[260px] lg:h-14"
          />
        </a>

        <div className="flex items-center gap-4">
          <a href="mailto:reachout@sparkolympiads.com" className="hidden lg:flex items-center gap-1 whitespace-nowrap text-sm transition-colors hover:text-primary">
            <Mail size={16} /> reachout@sparkolympiads.com
          </a>
          <a href="tel:+918447477275" className="hidden md:flex items-center gap-1 whitespace-nowrap text-sm transition-colors hover:text-primary">
            <Phone size={16} /> +91 8447477275
          </a>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t bg-background/98">
          <div className="container px-4 py-4">
            <div className="space-y-2">
              {navSections.map((section) => (
                <a
                  key={`${section.label}-${section.href}`}
                  href={section.href}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {section.label}
                </a>
              ))}

              <div className="pt-2">
                <button
                  onClick={() => setContactOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold hover:bg-secondary"
                  aria-expanded={contactOpen}
                >
                  Contact Options
                  <ChevronDown size={16} className={contactOpen ? "rotate-180 transition-transform" : "transition-transform"} />
                </button>

                {contactOpen && (
                  <div className="mt-1 space-y-2 pl-3 text-sm">
                    <a
                      href="mailto:reachout@sparkolympiads.com"
                      className="flex items-center gap-2 rounded-md px-2 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Mail size={15} /> reachout@sparkolympiads.com
                    </a>
                    <a
                      href="tel:+918447477275"
                      className="flex items-center gap-2 rounded-md px-2 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Phone size={15} /> +91 8447477275
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
