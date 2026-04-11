

# SPARK Olympiad 2026-27 Landing Page — Build Plan

## Decisions
- **OTP**: Client-side mock — generate random 6-digit, show in toast/console, master bypass "123456"
- **Form storage**: UI only, no persistence
- **Font**: Plus Jakarta Sans (via Google Fonts)

## Technical Approach

### Font Setup
- Add Plus Jakarta Sans from Google Fonts in `index.html`
- Update `tailwind.config.ts` with `fontFamily` for heading and body

### Color & Design System
- Update `src/index.css` CSS variables: primary to EDXSO Blue (`#2563EB`), backgrounds to white/slate-50/dark slate
- All CTAs use blue-600 with `↗` arrow icon (ArrowUpRight from lucide-react)

### File Structure
All sections built as components in `src/components/spark/`:

| Component | Section |
|-----------|---------|
| `TopBar.tsx` | Dark contact bar + "Registrations Open" |
| `Navbar.tsx` | Sticky white nav with logo + CTA |
| `Hero.tsx` | Grid pattern bg, gradient headline, badges, ticker |
| `Highlights.tsx` | Dark section with animated metric numbers |
| `Comparison.tsx` | Traditional vs SPARK side-by-side cards |
| `Reasons.tsx` | 6-card grid with Lucide icons |
| `HowItWorks.tsx` | 5-step timeline (vertical mobile, horizontal desktop) |
| `Pricing.tsx` | Subject list + two pricing cards |
| `RegistrationForm.tsx` | Full form with mock OTP UI |
| `TechPartners.tsx` | EDXSO + Prometric blocks |
| `FAQ.tsx` | Accordion with 5 questions |
| `Footer.tsx` | Copyright + links |

### Pages
- `src/pages/Index.tsx` — composes all sections in order

### Mock OTP Logic (in RegistrationForm)
- "Send OTP" generates random 6-digit code, stores in React state, shows via toast notification
- "Verify" button checks input against stored code OR master "123456"
- Simple useState-based flow, no backend

### Responsive Strategy
- Mobile-first: single column stacks everywhere
- `md:` breakpoint: 2-column grids, side-by-side comparison
- `lg:` breakpoint: 3-column grids, horizontal timeline, wider hero

### Key Libraries Already Available
- `lucide-react` for icons
- Tailwind CSS for styling
- shadcn/ui components (Accordion, Input, Select, RadioGroup, Button, Card)