# SPARK Olympiad Landing Page + Registration System
## Comprehensive Project Context Ledger

**Last Updated**: April 14, 2026 (Session 8: TechPartners Logo Branding)
**Status**: ALL CHANGES FROM TODAY FULLY DOCUMENTED BELOW
**Owner**: AI Development Team + Project Maintainers

---

---

## 🎯 1) EXECUTIVE SUMMARY

**Project**: Full-stack SPARK Olympiad landing page with server-integrated registration system  
**Tech Stack**: React 18 + TypeScript + Vite 5 + Tailwind CSS + shadcn UI + Lucide icons  
**Current State**: Fully functional MVP with dedicated registration route, homepage CTA section, 20+ field registration flow, unique ID generation, localStorage persistence, production-ready OTP backend integration, and Supabase-backed persistence for OTP sessions + registrations  
**Session Focus (Today - Session 7)**: 
- Integrated Supabase into Vite middleware using server-side service role key
- OTP sessions now persist in `public.otp_sessions` with secure lifecycle cleanup
- Registrations now persist in `public.registrations` (plus existing logs/ fallback)
- Added `supabase/schema.sql` for one-shot environment provisioning
- Updated environment template with Supabase variables
- Retained alternating section background rhythm and Reports & Analytics placement
- All builds passing, zero TypeScript errors

---

## 2) FULL TECH STACK & RUNTIME

**Frontend Framework**: React 18 + ReactDOM with concurrent features  
**Language**: TypeScript (strictness relaxed in tsconfig.app.json for rapid dev)  
**Module Bundler**: Vite 5.4.21  
- Dev server: `localhost:8080` with HMR overlay disabled
- Host binding: `::`
- Custom middleware endpoints:
  - POST `/api/otp/send`
  - POST `/api/otp/verify`
  - POST `/api/registrations`
- Aliases: `@` → `./src`

**Styling System**: Tailwind CSS + PostCSS  
- Theme source: CSS variables in `src/index.css`
- Custom tokens: `--spark-dark`, `--spark-slate`, `--spark-green`, plus primary/secondary  
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)

**Routing**: React Router v6  
- Route `/`: `src/pages/Index.tsx` (home with all sections + reveal-on-scroll)
- Route `/registration`: `src/pages/Registration.tsx` (dedicated registration page with full form)
- Route `/registration/continue`: `src/pages/RegistrationContinuation.tsx` (confirmation page)
- Route `*`: `src/pages/NotFound.tsx` (404 fallback)

**UI Component Library**: 
- shadcn-style local components in `src/components/ui/` (40+ components available)
- Direct usage: Card, CardHeader, CardTitle, CardContent, Button, Input, Label, RadioGroup, Checkbox, Accordion, etc.
- Icons: lucide-react (20+ icons used throughout: Menu, X, ChevronDown, Mail, Phone, Award, Trophy, Gift, ArrowUpRight, etc.)

**Notifications**: 
- Sonner toasts for success/error/info messages
- Shadcn Toaster component
- Messages shown on: OTP sent, OTP verified, form submitted, errors

**Form State Management**: React hooks (useState, useRef, useEffect, useMemo)  
- No Redux/Zustand (direct component state sufficient for MVP)
- localStorage: Persist registration data across sessions

**Query/Data Fetching**: 
- @tanstack/react-query installed (global QueryClientProvider active, no queries yet)
- Manual fetch() for OTP and registration APIs (`/api/otp/send`, `/api/otp/verify`, `/api/registrations`)

**Build Tools & Config**:
- ESLint: JS + TypeScript recommended + React Hooks + React Refresh
- Tests: Vitest configured (placeholder only, no meaningful coverage yet)
- E2E: Playwright config present but no specs written
- Environment Variables: Loaded via Vite loadEnv, fallback to process.env (`NEXG_*` + `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in local `.env` / Vercel env vars)

---

## 3) ARCHITECTURAL OVERVIEW

### Entry Point Sequence
```
src/main.tsx
  ↓ renders into #root
src/App.tsx
  ↓ wraps with providers (QueryClientProvider, TooltipProvider, Toaster, BrowserRouter)
  ↓ routes defined
src/pages/Index.tsx (home route /)
  ↓ useEffect: reveals sections on scroll + IntersectionObserver (12% threshold)
  ↓ renders 14 sections in horizontal sequence
```

### Section Composition (Index.tsx render order)
1. TopBar (sticky announcement ticker)
2. Navbar (sticky nav + hamburger menu)
3. Hero (banner + partner box)
4. Highlights (metrics with animated counters)
5. AboutSpark (mission card)
6. Comparison (traditional vs SPARK)
7. Rewards (recognition cards with icons)
8. Pricing (Program Overview - 6 cards)
9. HowItWorks (5-step timeline)
10. ReportsAnalytics (view-only PDF modal launcher cards)
11. RegistrationCTA (compact teaser card with button redirect to `/registration`)
12. TechPartners (EDXSO + Prometric cards)
13. FAQ (15 questions, load-more)
14. Footer (branding + links)

### Reveal-on-Scroll Mechanism (src/pages/Index.tsx + src/index.css)
```javascript
// On mount, all <section> elements get .reveal-on-scroll class
// IntersectionObserver watches with 12% threshold
// When section intersects: add .is-visible → CSS triggers fade/slide animation
// One-time reveal (unobserve after first trigger)
// Respects prefers-reduced-motion for accessibility
```

### Frontend Data Flow (Registration Form)
```
Index.tsx (RegistrationCTA)
  ↓ User clicks "Go to Registration Page"
  ↓ navigates to /registration
Registration.tsx
  ↓ renders full RegistrationForm.tsx
RegistrationForm.tsx
  ↓ User fills 20+ fields across 4 sections
  ↓ {principalOtp, coordOtp} verified independently
  ↓ examWindow + declaration required
  ↓ handleSubmit collects FormData
  ↓ sends RegistrationCreateRequest to POST /api/registrations
  ↓ Vite middleware generates SPARK-YYYYMMDD-XXXXXXX ID
  ↓ persists to Supabase `public.registrations` (when configured)
  ↓ also writes logs/registrations.{log,json} for local traceability
  ↓ returns RegistrationPayload with ID
  ↓ frontend saves to localStorage
  ↓ navigate to /registration/continue with state
  ↓ RegistrationContinuation page displays ID + summary
```

---

## 4) DATA MODELS & TYPE DEFINITIONS

### RegistrationPayload (src/lib/registration.ts)
```typescript
type RegistrationPayload = {
  // Generated server-side
  registrationId: string;        // format: SPARK-YYYYMMDD-XXXXXXX
  createdAt: string;             // ISO 8601 timestamp
  
  // School Block (8 fields)
  schoolName: string;
  schoolAddress: string;
  schoolEmail: string;
  schoolPhone: string;
  city: string;
  state: string;
  board: string;                 // CBSE|ICSE|Cambridge|State Board|IB
  strength: string;              // Up to 200|200–500|500–1000|1000–2000|2000+
  
  // Infrastructure Block
  labAvailable: "yes" | "no";
  computerCount: string;         // 5-10|11-20|21-50|51-100|100+ (if labAvailable="yes")
  
  // Principal Block (4 fields)
  principalName: string;
  principalEmail: string;
  principalMobile: string;
  // Note: OTP not persisted (verification gates submission)
  
  // Coordinator Block (5 fields)
  coordinatorName: string;
  coordinatorDesignation: string;
  coordinatorEmail: string;
  coordinatorMobile: string;
  // Note: OTP not persisted
  
  // Program Block (2 fields)
  expectedParticipants: string;  // 50-100|100-150|150-200|More than 200
  examWindow: string;            // october|november|december
  
  // Declaration
  declaration: boolean;          // must be true to submit
}

type RegistrationCreateRequest = Omit<RegistrationPayload, "registrationId" | "createdAt">;
```

### Vite API Middleware Type (vite.config.ts)
- Defines same RegistrationCreateRequest + RegistrationRecord (with ID + createdAt added)
- Endpoints intercepted in dev server: `/api/otp/send`, `/api/otp/verify`, `/api/registrations`
- Generates ID using `date.toISOString().slice(0,10).replace(/-/g,"")` + UUID first segment
- Persistence strategy:
  - Supabase preferred (when `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are present)
  - Local fallback still available for dev resiliency

---

## 5) DETAILED COMPONENT ARCHITECTURE

### TopBar (src/components/spark/TopBar.tsx) - 15 lines
- **Announcement**: "School Registrations Open for 2026–27"
- **Animation**: 60-second continuous right-to-left ticker
- **HTML Structure**: <div class="top-ticker"> → <div class="top-ticker__track"> → 16x <span class="top-ticker__item">
- **CSS Classes** (defined in src/index.css):
  - `.top-ticker`: Container with fixed height 38px, overflow hidden
  - `.top-ticker__track`: Animated using `animation: top-ticker-scroll 60s linear infinite`
  - `.top-ticker__item`: Inline-block, padding 1.25rem, white-space nowrap
- **Keyframe**: `top-ticker-scroll` translates from 0 → -50% on X-axis (seamless loop via duplication)
- **Duplicating Pattern**: `Array.from({length: 8})` creates 8 items, then spreads twice → 16 total

### Navbar (src/components/spark/Navbar.tsx) - 70 lines
- **Sticky positioning**: top-0, z-50, border-b, bg-background/95, backdrop-blur
- **Min height**: 84px
- **Layout**: 3-column flex (left hamburger | center logo | right contact)
- **Hamburger** (left):
  - Icon button (Menu or X, size 18px)
  - State: menuOpen (boolean)
  - When pressed: toggles menuOpen
- **Logo** (center, positioned absolutely left-1/2 -translate-x-1/2):
  - Image: `/spark.png`
  - Height: h-13 (desktop), h-16 (md+)
  - Fallback alt text
- **Contact** (right, "hidden sm:"):
  - Email icon + "reachout@sparkolympiads.com"
  - Phone icon + "+91 8447477275"
  - hover:text-primary, text-sm
- **Expanded Menu** (md:hidden, when menuOpen):
  - Full width panel below navbar (border-t, bg-background/98)
  - 10 navigation items (Highlights, About Spark, Why Spark, Recognition, Program Overview, How it Works, Reports & Analytics, Register, About EDXSO & Prometric, FAQs)
  - Section links use route-safe anchors (`/#...`) so they work from all pages
  - Anchor mapping: Why Spark → `/#comparison`, Recognition → `/#why-spark`, Program Overview → `/#pricing`, Reports & Analytics → `/#reports-analytics`
  - Register item links to dedicated route (`/registration`)
  - Each item closes menu on click
  - "Contact Options" collapsible at bottom showing email/phone
- **Contact Collapsible** (state: contactOpen, default true):
  - ChevronDown icon rotates on toggle
  - Shows email/phone with icons on expansion
- **Logo Home Link**: `/`

### Hero (src/components/spark/Hero.tsx) - 135 lines
- **Section ID**: id="hero" (not navigated but present)
- **Background**: Linear gradient 118deg from #0f4ea8 to #6ea4ee (blue spectrum) + radial glow overlay
- **Layout**: 2-column grid on desktop, stacked on mobile
  - Grid: grid-cols-1 md:grid-cols-2, items-center, gap-8 lg:gap-14
  - Image order: order-1 (left on desktop, top on mobile)
  - Content order: order-2 (right on desktop, bottom on mobile)
  
- **Image Column**:
  - Container: justify-center (mobile) | justify-start md:pl-4 lg:pl-8 (desktop)
  - Image source: `/banner_image.jpeg`
  - Alt: "SPARK Olympiad Banner"
  - Dimensions:
    - Width: `min(100%, 490px)`
    - Height: `clamp(320px, 46vw, 500px)`
    - Border-radius: 18px
    - Object-fit: cover
    - No border
  - Container classes: hero-media-frame hero-media-frame--soft (CSS defined)
  
- **Content Column** (text-center md:text-left):
  - **Heading**: "India's Most Advanced Academic Benchmarking Olympiad"
    - Recursive font sizes: text-[1.8rem] sm:text-[2.05rem] md:text-[2.25rem] lg:text-[2.45rem]
    - font-extrabold, leading-[1.08], text-white
    - Max-width: max-w-[15.5ch] (mobile center), max-w-[17.5ch] (desktop left)
    - Margin: mb-5
  - **Subheading**: "Assessing Thinking. Measuring Performance. Enabling Excellence."
    - Responsive: text-[0.98rem] sm:text-[1.05rem] md:text-[1.15rem]
    - font-semibold, text-blue-50/95, leading-[1.35]
    - max-w-lg, mb-8
  - **CTA**: "Register Your School" button
    - Link to: `/registration`
    - Colors: bg-[#ff5d1f] hover:bg-[#f34d0f]
    - Icon: ArrowUpRight (18px)
    - Classes: rounded-md, font-semibold, text-base, px-8, h-12
    - Uses Button asChild with <a> tag (accessible linking)
  
- **Mobile Partner Collapsible** (md:hidden, below content):
  - Container: mt-7, max-w-[280px] mx-auto, w-full
  - Button: "Initiative Of EDXSO & Prometric"
    - full width, rounded-md, border border-white/30, px-3 py-2.5
    - text-sm font-medium text-white/90
    - Icon: ChevronDown (16px) with rotate-180 on open
  - Expanded content (border-rounded-2xl, bg-white, p-3, shadow-lg):
    - Grid: 2 cards
    - Card 1: EDXSO logo (h-8), "Initiative Of", description
    - Card 2: Prometric logo (h-8), "Powered By", description
    - Text: centered, text-xs/[11px], muted colors

- **Desktop Partner Mention Box** (hidden md:block, mt-5 md:mt-6):
  - Container width: `w-[min(80%,760px)]` (responsive max 760px)
  - border-radius: rounded-[1.5rem]
  - Background: bg-[#f8fafc] (light gray-blue)
  - Padding: px-3 py-3
  - Shadow default: shadow-[0_10px_26px_rgba(2,6,23,0.10)]
  - Shadow hover: shadow-[0_24px_54px_rgba(2,6,23,0.24)]
  - Transition: transition-shadow duration-300
  - Layout: 2-column grid with gap-2 (8px spacing, TIGHTLY coupled)
  
  - **Column 1 (EDXSO)**:
    - Fixed height container: h-14, flex items-center justify-center
    - Logo: `/EDXSO.png`, h-10 sm:h-11, mx-auto w-auto
    - Label: "Initiative Of"
      - Classes: mt-1.5, text-sm, font-medium, leading-none, text-slate-700
    - Copy: "India's Premier Education Consultants"
      - Classes: mt-1, text-sm, leading-snug, text-slate-800
  
  - **Column 2 (Prometric)** (identical pattern):
    - Logo: `/prometric.png`, h-11 sm:h-12, mx-auto w-auto
    - Label: "Powered By"
    - Copy: "Global Leader in Online Assessments"

### Highlights (src/components/spark/Highlights.tsx) - 76 lines
- **Section ID**: id="highlights"
- **Background**: bg-spark-dark (dark charcoal blue)
- **Padding**: pt-16 pb-16 md:pt-24 md:pb-20

- **Tagline**: "2025 - A Powerful First Year"
  - Classes: text-center, text-spark-slate, text-sm, font-semibold, uppercase, tracking-widest, mb-8

- **Metrics Array**:
  ```javascript
  [
    { value: 100, label: "Schools Participated" },
    { value: 25000, label: "Students Engaged" }
  ]
  ```

- **Counter Component** (functional sub-component):
  - **Props**: target (number), suffix (string, default "")
  - **State**: count (current value), hasAnimated (prevents re-trigger)
  - **Intersection Observer**:
    - Threshold: 0.1 (10% visibility)
    - Fires once when element enters viewport
    - Sets hasAnimated=true, starts animation
  - **Animation Engine**:
    - Duration: 2500ms (2.5 seconds)
    - Uses requestAnimationFrame for smooth 60fps
    - Progress ratio: (elapsed / duration) clamped to 1
    - Value formula: Math.floor(progress * target)
    - Final value locked to target at 100% progress
  - **Rendering**:
    - Element: <p> with ref for observer
    - Text: count.toLocaleString() + suffix
    - Classes: text-5xl md:text-6xl, font-extrabold
    - Gradient: bg-gradient-to-r from-primary to-indigo-400, bg-clip-text text-transparent

- **Layout**:
  - Container: flex, flex-col md:flex-row, items-center, justify-center
  - Gap: gap-10 md:gap-20 (large spacing)
  - Each metric: Counter + label (text-sm md:text-base, text-spark-slate, mt-2, font-medium)

- **Bottom Paragraph**:
  - Text: "As India's first competency-based Olympiad, SPARK made a strong debut in 2025..."
  - Classes: text-center, text-spark-slate, text-sm md:text-base, mt-12 md:mt-16
  - Width: max-w-2xl mx-auto, leading-relaxed

### AboutSpark (src/components/spark/AboutSpark.tsx) - 35 lines
- **Section ID**: id="about-spark"
- **Background**: bg-white
- **Padding**: py-16 md:py-20

- **Card Container**:
  - Classes: rounded-2xl, border border-slate-200, bg-slate-50
  - Padding: px-6 py-8 md:px-10 md:py-10
  - Max-width: max-w-4xl mx-auto

- **Content** (5 distinct paragraphs with mt-4 separator):
  1. **Heading**: "About Spark" — text-2xl md:text-3xl font-extrabold text-slate-900
  2. **Mission**: "The future of education..." — text-base md:text-lg font-semibold text-slate-800
  3. **Paragraph 1**: "SPARK Olympiad is not just an assessment..." — NEP 2020, NCF 2023 mention
  4. **Paragraph 2**: "SPARK delivers credible, data-driven insights..." — Benchmarking focus
  5. **Paragraph 3**: "For institutions aspiring to global standards..." — Strategic positioning
  6. **Paragraph 4**: "Be part of this transformative initiative..." — Inspirational close
  
  - All paragraphs: text-sm md:text-base, leading-relaxed, text-slate-700

### Comparison (src/components/spark/Comparison.tsx) - 45 lines
- **Section ID**: id="comparison"
- **Background**: bg-secondary/30
- **Padding**: py-16 md:py-24
- **Title**: "Why SPARK?" with subtitle

- **Data**:
  - Traditional (5 items): "Rote-based MCQs", "No proctoring", "Generic results", "One-size-fits-all", "Paper-heavy logistics"
  - SPARK (5 items): "Competency-mapped questions", "AI-proctored environment", "Precision analytics per student", "NEP & NCF aligned framework", "Fully online, hassle-free"

- **Layout**: Grid md:grid-cols-2, gap-6, max-w-4xl mx-auto

- **Traditional Card**:
  - Border: border-destructive/30
  - Background: bg-destructive/5
  - Title: "Traditional Olympiads" (text-destructive, text-lg)
  - Items: XCircle icons (size 18, text-destructive), text-sm text-muted-foreground

- **SPARK Card**:
  - Border: border-primary/30
  - Background: bg-primary/5
  - Ring: ring-2 ring-primary/20 (emphasis)
  - Title: "SPARK Olympiad" (text-primary, text-lg)
  - Items: CheckCircle icons (size 18, text-spark-green), text-sm text-foreground

### Rewards (src/components/spark/Rewards.tsx) - 52 lines [UPDATED 2026-04-10 EVENING]
- **Section ID**: id="why-spark"
- **Background**: white (default)
- **Padding**: py-16 md:py-24

- **Title**: "Recognition That Goes Beyond Medals"
- **Subtitle**: "Every participant is recognized - but for top performers, SPARK goes much further."

- **Rewards Data** (Lucide icons, imported directly):
  ```typescript
  const rewards = [
    { icon: Award, title: "Certificates", desc: "Recognition of achievement for all participants" },
    { icon: Trophy, title: "Medals", desc: "Awarded to top-performing students" },
    { icon: Gift, title: "Mystery Rewards", desc: "Special surprises coming soon" },
  ];
  ```

- **Grid Layout**: sm:grid-cols-3, gap-6, max-w-3xl mx-auto, mb-8

- **Card Styling** (shadcn Card + CardContent):
  - Classes: hover:shadow-lg, transition-shadow
  - Content padding: p-6
  - Icon container:
    - w-12 h-12, rounded-md, bg-primary/10
    - flex items-center justify-center, mb-4 mx-auto
    - Icon: size=24, text-primary
  - Title: font-bold text-base text-center mb-2
  - Description: text-sm text-muted-foreground leading-relaxed text-center

- **Closing Callout** (max-w-3xl mx-auto text-center):
  - "Details of special rewards will be revealed soon."
  - Font-semibold, text-base md:text-lg text-muted-foreground

### Pricing (Program Overview) (src/components/spark/Pricing.tsx) - 57 lines
- **Section ID**: id="pricing"
- **Background**: bg-secondary/30
- **Padding**: py-16 md:py-24
- **Title**: "Program Overview" (formerly "Pricing")

- **Grid Layout**: md:grid-cols-2, gap-5, max-w-4xl mx-auto

- **Card 1: Classes**:
  - Title: "Classes" (text-primary, text-base md:text-lg)
  - Content: "1-10" (text-base md:text-lg font-semibold)
  - Styling: border-primary/15, shadow-[0_10px_24px_rgba(15,78,168,0.08)], hover:shadow-[0_16px_32px_rgba(15,78,168,0.14)]

- **Card 2: Subjects**:
  - Title: "Subjects"
  - Content: "English, Maths, Science, EVS, India Awareness"
  - Styling: (same as Classes)

- **Card 3: Pricing** (light primary background):
  - Title: "Pricing"
  - Content: "₹200 - Single Subject" + "₹700 - All Subjects" (space-y-2)
  - Styling: border-primary/20, bg-primary/5, shadow-[0_10px_24px_rgba(15,78,168,0.10)], hover:shadow-[0_16px_32px_rgba(15,78,168,0.16)]

- **Card 4: Exam Window** (light primary background):
  - Title: "Exam Window"
  - Content: "October: 26th - 31st", "November: 23rd - 30th", "December: 1st - 15th"
  - Styling: (same as Pricing)

- **Card 5 & 6: Full-width callouts** (md:col-span-2):
  - Card 5: "Schools can choose their preferred dates within the given window."
  - Card 6: "Mode: Fully online-conducted at school under supervision or from home with secure proctoring."
  - Styling: border-primary/15, shadow-[0_10px_24px_rgba(15,78,168,0.08)], hover:shadow-[0_16px_32px_rgba(15,78,168,0.14)]

### HowItWorks (src/components/spark/HowItWorks.tsx) - 78 lines
- **Section ID**: id="how-it-works"
- **Background**: white (default)
- **Padding**: py-16 md:py-24
- **Title**: "How It Works"
- **Subtitle**: "A simple 5-step process from registration to results."

- **Steps Data** (5 items with Lucide icons):
  1. School icon, "Register School", "Fill the registration form with school details."
  2. CalendarCheck icon, "Select Exam Slot", "Choose a convenient exam window (Oct–Dec)."
  3. UserPlus icon, "Add Students", "Upload student lists for each participating class."
  4. Monitor icon, "Conduct Exam", "Students take the AI-proctored exam online."
  5. FileBarChart icon, "Get Reports", "Receive detailed competency analytics per student."

- **Mobile Layout** (flex flex-col lg:hidden, max-w-md mx-auto):
  - Gap: gap-6
  - Each step:
    - Left column: Numbered badge (w-10 h-10, rounded-full, bg-primary, text-primary-foreground, font-bold text-sm)
    - Vertical connector between steps (w-px flex-1 bg-border mt-2) — omitted on last step
    - Right column (pb-6 offset): Icon + title (gap-2, mb-1) + description (text-sm text-muted-foreground)

- **Desktop Layout** (hidden lg:grid, grid-cols-5 gap-4, max-w-5xl mx-auto):
  - Each step:
    - Numbered badge (w-12 h-12, centered, mx-auto mb-3)
    - Horizontal connector line to next step (absolute top-6 left-calc-50%-+24px, width calc-100%-48px, h-px bg-border)
    - Icon (size 20, text-primary, mx-auto mb-2)
    - Title (font-bold text-sm mb-1)
    - Description (text-xs text-muted-foreground)

### RegistrationForm (src/components/spark/RegistrationForm.tsx) - 340+ lines [MAJOR REBUILD 2026-04-10]
- **Section ID**: id="register"
- **Background**: bg-secondary/30
- **Padding**: py-16 md:py-24
- **Title**: "Register Your School"
- **Subtitle**: "Fill in the details below to get started with SPARK Olympiad 2026–27."
- **Card**: max-w-2xl mx-auto, shadow-lg

- **State Management**:
  - Principal OTP: principalMobile, principalOtpInput, principalOtpSent, principalVerified, principalOtpBusy, principalVerifyBusy
  - Coordinator OTP: coordMobile, coordOtpInput, coordOtpSent, coordVerified, coordOtpBusy, coordVerifyBusy
  - Lab: labAvailable ("yes"|"no", default "yes")
  - Program: examWindow (empty string), declarationChecked (false)
  - Submit: isSubmitting (false)

- **OTP Functions**:
  - sendOtp(type): Calls POST `/api/otp/send`, handles busy/loading and toast feedback
  - verifyOtp(type): Calls POST `/api/otp/verify`, enforces backend validation and attempt limits
  - Mobile field change resets OTP state to prevent stale verification

- **Form Submission Validation**:
  1. Both OTPs verified
  2. Exam window selected
  3. Declaration checked
  - → POST /api/registrations → save to localStorage → navigate to /registration/continue

- **Form Sections** (space-y-6, each prefixed with uppercase h3 label):

  **1. School Details**:
  - School Name (text, required)
  - School Address (text, required)
  - City (text, required), State (text, required) — sm:grid-cols-2
  - School Email (email, required), School Phone (tel, required) — sm:grid-cols-2
  - Board (select, required) — options: CBSE, ICSE, Cambridge, State Board, IB
  - Approx. Students Classes 1-10 (select, required) — options: Up to 200, 200–500, ..., 2000+ — sm:grid-cols-2
  - Computer Lab Available (radio yes/no, required)
  - Number of Computers (select, conditional if labAvailable="yes") — options: 5-10, 11-20, ..., 100+

  **2. Principal Details**:
  - Full Name (text, required)
  - Email (email, required)
  - Mobile (tel, required) + Send OTP button + Verify OTP flow

  **3. Coordinator Details**:
  - Name (text, required)
  - Designation (text, required) [NEW]
  - Email (email, required)
  - Contact Number (tel, required) + Send OTP button + Verify OTP flow

  **4. Program Details**:
  - Expected Participants (select, required) — options: 50-100, 100-150, 150-200, More than 200
  - Preferred Exam Window (radio required) — October 26th–31st | November 23rd–30th | December 1st–15th

  **5. Declaration** (rounded-md border p-4):
  - Checkbox "We confirm our interest in participating in SPARK Olympiad 2026–27" (required)

- **Submit Button**:
  - Full width, rounded-md, font-semibold, size-lg
  - Icon: ArrowUpRight (18px)
  - Text: "Generate Registration ID & Register" / "Submitting..."
  - Disabled when isSubmitting

### RegistrationCTA (src/components/spark/RegistrationCTA.tsx) - NEW
- **Purpose**: Keep homepage concise while preserving clear registration intent
- **Placement**: Between ReportsAnalytics and TechPartners on home route (`/`)
- **Section ID**: id="register" (anchor compatibility retained)
- **Layout**:
  - Compact centered card (`max-w-3xl`) with border, shadow, and text-center
  - Heading: "Ready to Register Your School?"
  - Supporting copy: explains form moved to dedicated page for smoother experience
  - Primary CTA button: "Go to Registration Page"
- **Navigation**:
  - CTA button links directly to `/registration`
  - Preserves flow while reducing homepage length significantly

### Registration Page (src/pages/Registration.tsx) - NEW
- **Route**: `/registration`
- **Composition**:
  1. TopBar
  2. Navbar
  3. RegistrationForm
  4. Footer
- **Behavior**: Keeps full registration experience identical, only moved off homepage

### TechPartners (src/components/spark/TechPartners.tsx) - 55 lines
- **Section ID**: id="about-edxso-prometric"
- **Background**: bg-secondary/30
- **Padding**: py-16 md:py-24
- **Title**: "About EDXSO & Prometric"

- **Card Grid** (md:grid-cols-2, gap-6, max-w-4xl mx-auto):
  - **EDXSO Card**:
    - Shadow: shadow-[0_10px_24px_rgba(15,78,168,0.08)]
    - Hover shadow: shadow-[0_16px_36px_rgba(15,78,168,0.16)]
    - Padding: p-6 md:p-8
    - Logo: `<img src="/EDXSO.png" alt="EDXSO" className="mb-3 h-10 w-auto" />`
    - Content: Multi-paragraph description (K-12, competency assessments, NEP 2020, SPARK partnership)
    - Text: text-sm text-muted-foreground leading-relaxed with <br/> paragraph separators
  
  - **Prometric Card** (identical styling):
    - Logo: `<img src="/prometric.png" alt="Prometric" className="mb-3 h-10 w-auto" />`
    - Content: Multi-paragraph description (180+ countries, ETS/CFA partnerships, technology focus, integrity)

- **Callout Below** (mt-12, max-w-4xl mx-auto):
  - Container: rounded-xl, border border-primary/20, bg-primary/5, px-5 py-4
  - Shadow: shadow-[0_10px_24px_rgba(15,78,168,0.10)]
  - Text: "Together, EDXSO and Prometric bring global standards to school assessments-making them more insightful, secure, and impactful."
  - Styling: text-center, text-sm md:text-base, font-medium, text-slate-700, leading-relaxed

### ReportsAnalytics (src/components/spark/ReportsAnalytics.tsx) - 158 lines [NEW]
- **Purpose**: Embedded PDF viewer for olympiad_analytics.pdf and student_report.pdf with view-only protection
- **Section ID**: id="reports-analytics"
- **Background**: bg-secondary/30
- **Padding**: py-16 md:py-24
- **Title**: "Reports & Analytics"

- **Report Cards Grid** (grid md:grid-cols-2, gap-6, max-w-2xl mx-auto):
  - **Card 1: Olympiad Analytics**:
    - Icon: FileText (size 24, text-primary)
    - Title: "Olympiad Analytics"
    - Description: "View comprehensive analytics on olympiad performance"
    - CTA: "View Report" button (bg-primary, hover effects)
  
  - **Card 2: Student Report**:
    - Icon: FileText (size 24, text-primary)
    - Title: "Student Report"
    - Description: "Access detailed student-wise performance reports"
    - CTA: "View Report" button (bg-primary, hover effects)

- **PDF Modal Dialog**:
  - Triggered by report CTAs
  - Title: Dynamically set ("Olympiad Analytics" or "Student Report")
  - Content:
    - iframe element with PDF URL + security parameters:
      - `#toolbar=0` (hides toolbar)
      - `&navpanes=0` (hides navigation panes)
      - `&scrollbar=0` (hides scrollbar)
    - Right-click disabled: onContextMenu={(e) => e.preventDefault()}
    - Width: full (w-full)
    - Height: 80vh
  - Message: "View-only mode enabled. Printing and downloading are disabled."
  - Close: Dialog close button
  - Note: Browser print-to-PDF is noted as potential workaround in UI

### FAQ (src/components/spark/FAQ.tsx) - 88 lines
- **Section ID**: id="faq"
- **Background**: white (default)
- **Padding**: py-16 md:py-24
- **Container**: max-w-3xl mx-auto
- **Title**: "Frequently Asked Questions"

- **FAQ Data** (15 questions):
  1. "Is the exam online or offline?" → Online details
  2. "Can students select multiple subjects?" → Yes
  3. "What is the exam duration?" → 45-60 min
  4. "Can schools choose their exam dates?" → Yes, Oct-Dec
  5. "What infrastructure is required if conducting in School?" → Computer lab + internet
  6. "What if a school does not have sufficient computers?" → Multiple slots
  7. "Will technical support be provided?" → Yes, before/during
  8. "What kind of reports will schools receive?" → Detailed analytics
  9. "How will these reports help schools?" → Identify gaps
  10. "Will all students receive certificates?" → Yes
  11. "Are there awards for top performers?" → Yes, medals/scholarships
  12. "Are teachers and schools also recognized?" → Yes
  13. "Is there any upfront payment required?" → No
  14. "Why should our school participate in SPARK?" → Benchmarking focus
  15. "Who will be our point of contact?" → Assigned coordinator

- **State**: showAll (boolean, default false)
- **Display Logic**: visibleFaqs = useMemo(() => showAll ? faqs : faqs.slice(0, 5), [showAll])

- **Accordion** (shadcn, type="single collapsible"):
  - Full width
  - Items from visibleFaqs
  - AccordionTrigger: text-left, text-sm md:text-base, font-semibold
  - AccordionContent: text-muted-foreground, text-sm, leading-relaxed

- **Load More Button** (mt-6, centered):
  - Variant: outline
  - Text: "Load More FAQs"
  - Visible only when !showAll
  - onClick: setShowAll(true)

### Section Background Color Pattern [NEW 2026-04-11]
**Alternating Background Strategy** (About Spark → FAQ):

To create visual rhythm and distinguish sections across the landing page, an alternating background pattern is applied:

| Order | Section | Background | Color Code | Visual Purpose |
|-------|---------|-----------|-----------|----------------|
| 1️⃣ | About Spark | White | Default | Information anchor |
| 2️⃣ | Comparison | Light Gray | bg-secondary/30 | Comparative analysis |
| 3️⃣ | Rewards | White | Default | Recognition highlight |
| 4️⃣ | Pricing | Light Gray | bg-secondary/30 | Pricing info section |
| 5️⃣ | How It Works | White | Default | Process clarity |
| 6️⃣ | Reports & Analytics | Light Gray | bg-secondary/30 | Resource showcase |
| 7️⃣ | Registration CTA | White | Default | Call-to-action distinction |
| 8️⃣ | Tech Partners | Light Gray | bg-secondary/30 | Partner emphasis |
| 9️⃣ | FAQ | White | Default | Information closure |

**Benefits**:
- Creates visual separation between adjacent sections
- Maintains consistent rhythm regardless of section length
- Ensures CTA sections (RegistrationCTA) stand out from informational sections
- Improves perceived design quality and user scanning experience

**Implementation Note**: All sections use `py-16 md:py-24` standard padding unless overridden (e.g., AboutSpark uses `py-16 md:py-20`).

### RegistrationContinuation (src/pages/RegistrationContinuation.tsx) - 158 lines
- **Route**: /registration/continue
- **Purpose**: Post-registration confirmation

- **Data Retrieval**:
  - Check location.state.registration (passed from form)
  - Fall back to readLatestRegistration() (localStorage)
  - If neither: Show error card with link back to form

- **Layout** (min-h-screen bg-secondary/30 py-10 md:py-16):
  - Container: max-w-4xl px-4 space-y-6
  - Back button: Link to "/"
  - Main card (border-primary/20, shadow-lg)

- **Card Header**:
  - Title: CircleCheckBig icon (spark-green h-6 w-6), "Registration Received"
  - Description: "{schoolName} is successfully registered. Your registration ID is ready."

- **Card Content** (space-y-4):
  1. **Registration ID Section** (rounded-lg border bg-background p-4):
     - Label: "REGISTRATION ID" (xs uppercase tracking-wide)
     - ID (font-semibold text-primary, break-all)
     - Buttons: Copy ID, Email Coordinator (with pre-filled template)

  2. **School Snapshot** (md:grid-cols-2):
     - Left: School name, address, city/state, board, students, computer lab, participants, exam window
     - Right: Principal (name, email, mobile), Coordinator (name, designation, email, mobile)

  3. **What Happens Next** (rounded-lg border border-dashed p-4):
     - 3 numbered steps
     - Timestamp: "Registered on: [formatted date]"

- **Timestamp Format**: toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })

### Footer (src/components/spark/Footer.tsx) - 22 lines
- **Background**: bg-spark-dark
- **Text**: text-spark-slate
- **Padding**: py-10
- **Alignment**: text-center

- **Logo** (mx-auto h-12 w-auto mb-2): `/spark.png`, alt "Spark Olympiad"
- **Subtext** (text-xs mb-4): "An Initiative of EDXSO & Prometric"
- **Navigation Links** (flex justify-center gap-4 text-xs mb-6):
  - /registration → "Register"
  - /#why-spark → "Why SPARK"
  - /#how-it-works → "How It Works"
  - mailto:reachout@sparkolympiads.com → "Contact"
  - Styling: hover:text-primary, transition-colors
- **Copyright** (text-xs text-spark-slate/60):
  - "© {new Date().getFullYear()} SPARK Olympiad. All rights reserved."

---

## 6) STYLING SYSTEM & THEME

### CSS Architecture (src/index.css)
- **Root Variables**:
  - Light mode: `--background`, `--foreground`, `--primary`, `--secondary`, `--destructive`, `--spark-dark`, `--spark-slate`, `--spark-green`
  - Dark mode: Same tokens with dark-specific values
  - Semantic namespacing with `--spark-*` prefix for brand colors

- **Hero Banner** (.hero-banner):
  - Background: `linear-gradient(118deg, #0f4ea8 0%, #6ea4ee 100%)`
  - Radial glow overlay for depth effect
  - Overflow hidden

- **Hero Media Frame**:
  - .hero-media-frame: Sets up container for image
  - .hero-media-frame--soft: Applies border-radius 18px, overflow hidden
  - .hero-media-image: Generic image styling
  - .hero-media-image--rounded: Applies rounded corners

- **Top Ticker Animation**:
  - .top-ticker: Container (height 38px, overflow hidden)
  - .top-ticker__track: Animated element (animation: top-ticker-scroll 60s linear infinite)
  - .top-ticker__item: Individual items (inline-block, padding 1.25rem horizontal)
  - Keyframe @keyframes top-ticker-scroll: {0% {transform: translateX(0)} 100% {transform: translateX(-50%)}}

- **Reveal on Scroll**:
  - .reveal-on-scroll: Initial hidden state (opacity 0, transform translate)
  - .is-visible: Final visible state (opacity 1, transform none)
  - Transition: opacity 0.6s ease-out, transform 0.6s ease-out
  - Respects @media (prefers-reduced-motion: reduce): disables animations

- **Scroll Behavior**:
  - html: scroll-behavior smooth
  - section[id]: scroll-margin-top 6rem (md: 6.5rem)

- **Interactive Affordances**:
  - buttons, [role="button"], input, select, textarea: transition all 200ms ease
  - :active: translateY(1px) scale(0.99)
  - Hover effects: color/background/shadow transitions
  - Respects prefers-reduced-motion: disables

### Tailwind Config (tailwind.config.ts)
- **Font Family**: Plus Jakarta Sans + system fallbacks
- **Custom Colors**: Spark namespace mapped to CSS variables
- **Animations**:
  - ticker: ticker 20s linear infinite (for hero scroll, though not currently used in final code)
  - Custom keyframes registered
- **Theme Extend**:
  - Border radius, spacing, shadows all extended for spark consistency

---

## 7) PACKAGE DEPENDENCIES & VERSIONS

**Core Frameworks**:
- react: 18.x
- react-dom: 18.x
- react-router-dom: latest

**Build & Dev**:
- vite: 5.4.21
- @vitejs/plugin-react-swc: latest
- typescript: latest
- eslint + plugins: latest

**UI & Styling**:
- tailwindcss: latest
- postcss: latest
- lucide-react: latest (icons)
- radix-ui: dependencies via shadcn

**Utilities**:
- @tanstack/react-query: installed (global provider, no active queries)
- sonner: latest (notifications)
- clsx: via utils
- @supabase/supabase-js: Supabase client for server-side persistence

**Testing**:
- vitest: configured
- @testing-library/react: available
- jsdom: configured

---

## 8) KEY IMPLEMENTATION DETAILS

### Intersection Observer Pattern (Reveal on Scroll)
```javascript
// Index.tsx useEffect hook
useEffect(() => {
  const sections = document.querySelectorAll("section");
  if (!sections.length) return;

  sections.forEach(section => section.classList.add("reveal-on-scroll"));

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    sections.forEach(section => section.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);  // One-time reveal
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  sections.forEach(section => observer.observe(section));
  return () => observer.disconnect();
}, []);
```

### Counter Animation with Intersection Observer (Highlights)
```javascript
// Counter component useEffect
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        const startTime = Date.now();
        const duration = 2500; // 2.5 seconds

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const current = Math.floor(progress * target);
          setCount(current);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setCount(target);
          }
        };

        animate();
      }
    },
    { threshold: 0.1 }
  );

  if (ref.current) observer.observe(ref.current);
  return () => { if (ref.current) observer.unobserve(ref.current); };
}, [target, hasAnimated]);
```

### OTP Flow (RegistrationForm) [PRODUCTION-READY 2026-04-11]
```typescript
// State Management (NEW: async/loading state + mobile binding):
const [principalMobile, setPrincipalMobile] = useState("");    // Bound to input
const [principalOtpInput, setPrincipalOtpInput] = useState(""); // User OTP entry
const [principalOtpSent, setPrincipalOtpSent] = useState(false);
const [principalVerified, setPrincipalVerified] = useState(false);
const [principalOtpBusy, setPrincipalOtpBusy] = useState(false);    // Send button loading
const [principalVerifyBusy, setPrincipalVerifyBusy] = useState(false); // Verify button loading
// (Same for coordinator: coordMobile, coordOtpInput, coordOtpSent, coordVerified, coordOtpBusy, coordVerifyBusy)

// Send OTP (async, calls backend):
const sendOtp = async (type: "principal" | "coordinator") => {
  const mobile = type === "principal" ? principalMobile : coordMobile;
  if (!mobile.trim()) {
    toast.error("Please enter the mobile number first.");
    return;
  }
  
  try {
    if (type === "principal") setPrincipalOtpBusy(true);
    else setCoordOtpBusy(true);
    
    const response = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, channel: type }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Could not send OTP");
    }
    
    if (type === "principal") {
      setPrincipalOtpSent(true);
      setPrincipalVerified(false);
    } else {
      setCoordOtpSent(true);
      setCoordVerified(false);
    }
    
    toast.success("OTP sent successfully.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send OTP";
    toast.error(message);
  } finally {
    if (type === "principal") setPrincipalOtpBusy(false);
    else setCoordOtpBusy(false);
  }
};

// Verify OTP (async, calls backend, tracks attempts):
const verifyOtp = async (type: "principal" | "coordinator") => {
  const mobile = type === "principal" ? principalMobile : coordMobile;
  const input = type === "principal" ? principalOtpInput : coordOtpInput;
  
  if (!mobile.trim()) {
    toast.error("Please enter mobile number first.");
    return;
  }
  if (!input.trim()) {
    toast.error("Please enter OTP first.");
    return;
  }
  
  try {
    if (type === "principal") setPrincipalVerifyBusy(true);
    else setCoordVerifyBusy(true);
    
    const response = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, otp: input, channel: type }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "OTP verification failed");
    }
    
    if (type === "principal") setPrincipalVerified(true);
    else setCoordVerified(true);
    toast.success("OTP verified successfully!");
  } catch (error) {
    const message = error instanceof Error ? error.message : "OTP verification failed";
    toast.error(message);
  } finally {
    if (type === "principal") setPrincipalVerifyBusy(false);
    else setCoordVerifyBusy(false);
  }
};

// Mobile input change handler (reset OTP state when number changes):
const handleMobileChange = (mobile: string, type: "principal" | "coordinator") => {
  if (type === "principal") {
    setPrincipalMobile(mobile);
    setPrincipalOtpSent(false);
    setPrincipalOtpInput("");
    setPrincipalVerified(false);
  } else {
    setCoordMobile(mobile);
    setCoordOtpSent(false);
    setCoordOtpInput("");
    setCoordVerified(false);
  }
};
```

**UI Changes**:
- Send OTP button shows loading state: "Sending..." when `principalOtpBusy/coordOtpBusy` is true
- Verify button shows loading state: "Verifying..." when `principalVerifyBusy/coordVerifyBusy` is true
- Both buttons disabled during loading to prevent duplicate requests
- Verified state shows green checkmark: "✓ Verified"
- Mobile input field is controlled (value bound to principalMobile/coordMobile state)
- OTP input field only appears after "Send OTP" button clicked

**Error Handling**:
- All fetch errors caught and displayed as red toast notifications
- 429 rate limit errors: "Please wait 30 seconds before requesting another OTP."
- 400 validation errors: "Invalid OTP. Please try again." or gateway-level messages
- 500 server errors: "Could not send OTP." or "Could not verify OTP."

### Form Submission with API Call (RegistrationForm)
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!principalVerified || !coordVerified) {
    toast.error("Please verify both OTPs before submitting.");
    return;
  }
  if (!examWindow) {
    toast.error("Please select a preferred exam window.");
    return;
  }
  if (!declarationChecked) {
    toast.error("Please confirm your interest in participating.");
    return;
  }

  const form = e.currentTarget;
  const formData = new FormData(form);
  const requestBody = {
    schoolName: formData.get("schoolName")?.trim() || "",
    // ... all 20+ fields
    declaration: declarationChecked,
  };

  try {
    setIsSubmitting(true);
    const response = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error("Registration service failed");

    const payload = await response.json();
    saveLatestRegistration(payload);
    toast.success("Registration submitted!", { 
      description: `Your Registration ID is ${payload.registrationId}.` 
    });
    navigate("/registration/continue", { state: { registration: payload } });
  } catch {
    toast.error("Could not submit registration. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};
```

### Vite API Middleware (vite.config.ts) [Supabase Integrated 2026-04-11]

**OTP Flow Architecture**:
```typescript
type OtpGatewayConfig = {
  username?: string;
  password?: string;
  from: string;
  templateId?: string;
  principalEntityId?: string;
  telemarketerId?: string;
  otpTextTemplate: string;
};

type OtpSession = {
  otpHash: string;           // SHA256 hash of OTP (never stored plain)
  expiresAt: number;         // Unix timestamp for 5-min TTL
  attempts: number;          // Verification attempt counter (max 5)
  lastSentAt: number;        // Rate limiting: 30s resend cooldown
};

type SupabaseConfig = {
  url?: string;
  serviceRoleKey?: string;
};

const otpStore = new Map<string, OtpSession>();  // Fallback store when Supabase vars are not provided
const OTP_TTL_MS = 5 * 60 * 1000;                 // 5 minutes
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;        // 30 seconds
const OTP_MAX_VERIFY_ATTEMPTS = 5;               // Max invalid attempts
```

**Endpoint: POST /api/otp/send**
- Request: `{ mobile: string, channel: "principal" | "coordinator" }`
- Validates Indian mobile format (10-digit or 91-prefixed)
- Checks resend rate limit (429 if attempted within 30s)
- Generates 6-digit OTP, hashes it SHA256, stores hash with TTL
- Upserts session in Supabase `public.otp_sessions` when configured
- Calls NexG SMS gateway via sendOtpViaGateway function
- Gateway URL: `https://api2.nexgplatforms.com/sms/1/text/query?...`
- Uses DLT template credentials from environment for India compliance
- Response (200): `{ message: "OTP sent successfully." }`
- Error (429): Rate limit exceeded
- Error (400): Invalid mobile or channel
- Error (500): SMS gateway failure

**Endpoint: POST /api/otp/verify**
- Request: `{ mobile: string, otp: string, channel: "principal" | "coordinator" }`
- Validates OTP not expired (400 if >5 min old)
- Validates attempt count (429 if ≥5 failed attempts)
- Compares received OTP hash with stored hash (constant-time)
- Increments attempt counter on mismatch (up to 5 failures)
- Clears OTP session on success (temporary-session model)
- Response (200): `{ message: "OTP verified successfully." }`
- Error (400): Invalid OTP or expired
- Error (429): Too many attempts
- Error (500): Verification logic error

**Registration Endpoint: POST /api/registrations**
- Generates unique ID and writes to Supabase `public.registrations` when configured
- Also appends to `logs/registrations.log` and `logs/registrations.db.json` for local traceability
- Now called after both principal and coordinator OTPs are verified

**Helper Functions**:
- `normalizeIndianMobile(input: string)`: Accepts "9136879xxxx", "+919136879xxxx", or "09136879xxxx"; returns 10-digit normalized number or null
- `hashOtp(otp: string)`: SHA256 hash, never stores plain OTP
- `sendOtpViaGateway(mobile: string, otp: string, config: OtpGatewayConfig)`: Makes HTTPS GET to NexG, validates response
- `otpKey(channel, mobile)`: Creates unique store key like "principal:9136879xxxx"
```

### Conditional Field Rendering (Computer Count)
```jsx
{labAvailable === "yes" && (
  <div>
    <Label htmlFor="computerCount">Number of Computers Available</Label>
    <select id="computerCount" name="computerCount" className="...">
      <option value="">Select Range</option>
      {computerCounts.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  </div>
)}
```

### Load More Pattern (FAQ)
```javascript
const visibleFaqs = useMemo(() => {
  if (showAll) return faqs;
  return faqs.slice(0, 5);
}, [showAll]);

// In JSX:
{visibleFaqs.map((faq, i) => (
  <AccordionItem key={faq.q} value={`faq-${i}`}>
    {/* ... */}
  </AccordionItem>
))}

{!showAll && (
  <div className="mt-6 flex justify-center">
    <Button type="button" variant="outline" onClick={() => setShowAll(true)}>
      Load More FAQs
    </Button>
  </div>
)}
```

---

## 9) BACKEND API SPECIFICATION

### Endpoint: POST /api/otp/send

**Request Format**:
```json
{
  "mobile": "string",
  "channel": "principal|coordinator"
}
```

**Response Format** (Status 200):
```json
{
  "message": "OTP sent successfully."
}
```

**Behavior**:
- Normalizes Indian numbers, enforces 30s resend cooldown, stores hashed OTP with 5-minute TTL
- Persists session in Supabase `public.otp_sessions` (or fallback in-memory store)

### Endpoint: POST /api/otp/verify

**Request Format**:
```json
{
  "mobile": "string",
  "otp": "string",
  "channel": "principal|coordinator"
}
```

**Response Format** (Status 200):
```json
{
  "message": "OTP verified successfully."
}
```

**Behavior**:
- Enforces max 5 attempts, checks expiry, increments attempts on mismatch
- Deletes session row after success / expiry / max attempts

### Endpoint: POST /api/registrations

**Request Format**:
```json
{
  "schoolName": "string",
  "schoolAddress": "string",
  "schoolEmail": "string",
  "schoolPhone": "string",
  "city": "string",
  "state": "string",
  "board": "CBSE|ICSE|Cambridge|State Board|IB",
  "strength": "Up to 200|200–500|500–1000|1000–2000|2000+",
  "labAvailable": "yes|no",
  "computerCount": "5-10|11-20|21-50|51-100|100+",
  "principalName": "string",
  "principalEmail": "string",
  "principalMobile": "string",
  "coordinatorName": "string",
  "coordinatorDesignation": "string",
  "coordinatorEmail": "string",
  "coordinatorMobile": "string",
  "expectedParticipants": "50-100|100-150|150-200|More than 200",
  "examWindow": "october|november|december",
  "declaration": true
}
```

**Response Format** (Status 201):
```json
{
  "registrationId": "SPARK-20260410-ABC1234",
  "createdAt": "2026-04-10T15:35:42.123Z",
  "schoolName": "...",
  "...": "... all request fields echoed back ..."
}
```

**ID Generation Algorithm**:
```
SPARK-{YYYYMMDD}-{RANDOMTOKEN}
  SPARK: Literal prefix
  YYYYMMDD: Current date (e.g., 20260410)
  RANDOMTOKEN: First segment of UUID (7 chars), uppercased
  Example: SPARK-20260410-A1B2C3D
```

**Persistence**:
1. Supabase table `public.registrations` (primary persistence)
2. `logs/registrations.log` (append-only local trace)
3. `logs/registrations.db.json` (local JSON array for dev inspection)

---

## 10) TESTING & QUALITY STATE

**Tests**:
- Vitest configured with jsdom environment
- `src/test/setup.ts` provides `window.matchMedia` mock (required for responsive breakpoint tests)
- `src/test/example.test.ts` is placeholder only

**Coverage**: Currently 0% (no meaningful tests written)

**Need to Add**:
- Unit tests for Counter animation logic
- E2E tests for registration flow (form → submit → confirmation page)
- Integration tests for RegistrationContinuation data binding
- Accessibility tests (ARIA labels, keyboard navigation)

**Quality Tools**:
- ESLint enabled (no blockers, React Hooks rules active)
- TypeScript strict mode disabled (app has `strict: false` for rapid development)
- Build output: 0 errors

---

## 11) KNOWN LIMITATIONS & FUTURE WORK

**Current Session Completions**:
- ✅ Rewards section emoji → Lucide icons (Award, Trophy, Gift)
- ✅ 15 FAQ questions with load-more functionality
- ✅ Counter animations in Highlights (2.5s reveal-on-scroll)
- ✅ Hero partner box redesign (gap-2 spacing, shadow effects)
- ✅ Registration form: 20+ fields, backend OTP verification, declaration checkbox
- ✅ Backend API endpoints (`/api/otp/send`, `/api/otp/verify`, `/api/registrations`)
- ✅ Supabase persistence for OTP sessions and registrations
- ✅ Reports & Analytics section with view-only PDF modal launcher
- ✅ Alternating section background rhythm from About Spark → FAQ
- ✅ RegistrationContinuation page with email/copy features

**Known Gaps**:
1. **Tablet Responsiveness** (768px–1024px): Mid-screen devices may need spacing/font refinement
2. **Test Coverage**: No unit/E2E tests (MVP phase, added to backlog)
3. **Deployment Architecture**: Vite middleware endpoints must be moved to serverless functions for Vercel production
4. **OTP Rate Limiting Scope**: Current cooldown/attempt controls are per session key; global abuse controls can be added
5. **Email Notifications**: None implemented (future: send confirmation to principal/coordinator)
6. **Admin Dashboard**: No management UI for reviewing registrations
7. **Multi-language Support**: Currently English-only
8. **PDF Download Restriction**: Full prevention is not possible client-side once a file is viewable in browser; only deterrents are feasible

**Future Enhancements**:
- [ ] Tablet responsiveness refinement
- [ ] Vercel function migration for OTP/registration endpoints
- [ ] OTP audit trail table (optional) while keeping transient session deletion
- [ ] Email confirmations to participants
- [ ] Admin dashboard for registration management
- [ ] Form auto-fill from school database lookup
- [ ] Payment integration for fees
- [ ] Analytics dashboard (registration trends, school insights)
- [ ] Internationalization (Hindi, other Indian languages)
- [ ] Automated test coverage (unit + E2E + accessibility)

---

## 12) RESUME CHECKLIST FOR NEXT SESSION

**Pre-Flight**:
1. Open this context.md file as source-of-truth
2. Run `npm run dev` to confirm dev server starts on :8080
3. Test registration flow: fill form → submit → check Supabase `public.registrations` and local logs/registrations.{log,json}
4. Verify unique ID format: SPARK-YYYYMMDD-XXXXXXX
5. Check build: `npm run build` should complete with 0 errors

**Decision Tree** (pick one):
- **A) Tablet Responsiveness** (user noted "not highly responsive" for mid-screen)
  - Review breakpoints between 768px–1024px
  - Adjust font sizes, spacing, grid gaps
  - Test on actual tablet or DevTools device mode
  
- **B) Production Backend Migration**
  - Set up Node.js/Django API server
  - Migrate from Vite middleware to standalone API
  - Implement database (PostgreSQL/MongoDB)
  - Secure OTP delivery (Twilio SMS or SendGrid email)
  - Update vite.config.ts to call remote API
  
- **C) Test Coverage**
  - Write unit tests for Counter component
  - Write E2E tests for registration flow (Playwright)
  - Add accessibility tests (axe-core)
  
- **D) Feature Additions**
  - Email confirmations to principal/coordinator
  - Admin dashboard for registration review
  - Form validation improvements
  - New sections/content

**Quick Verification Commands**:
```bash
# Check if dev server still runs
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint check
npm run lint

# Check registration persistence
cat logs/registrations.log | tail -5
cat logs/registrations.db.json | jq '.[-1]'  # Last registration
```

---

## 13) FILE STRUCTURE (All Key Files Documented)

**Pages** (3 primary routes + 404):
- `src/pages/Index.tsx` (home + all sections + reveal-on-scroll)
- `src/pages/Registration.tsx` (dedicated registration page)
- `src/pages/RegistrationContinuation.tsx` (post-registration confirmation)
- `src/pages/NotFound.tsx` (404)

**Components** (14 sections + utilities):
- `src/components/spark/TopBar.tsx` (ticker)
- `src/components/spark/Navbar.tsx` (nav + hamburger + contact)
- `src/components/spark/Hero.tsx` (banner + partner box)
- `src/components/spark/Highlights.tsx` (metrics + counter animation)
- `src/components/spark/AboutSpark.tsx` (mission card)
- `src/components/spark/Comparison.tsx` (traditional vs SPARK)
- `src/components/spark/Rewards.tsx` (recognition with Lucide icons) [UPDATED TODAY]
- `src/components/spark/Pricing.tsx` (program overview - 6 cards)
- `src/components/spark/HowItWorks.tsx` (5-step timeline)
- `src/components/spark/ReportsAnalytics.tsx` (view-only PDF cards + modal)
- `src/components/spark/RegistrationCTA.tsx` (homepage teaser and redirect to dedicated form page)
- `src/components/spark/RegistrationForm.tsx` (20+ fields + OTP) [REBUILT TODAY]
- `src/components/spark/TechPartners.tsx` (EDXSO + Prometric)
- `src/components/spark/FAQ.tsx` (15 questions + load-more) [EXPANDED TODAY]
- `src/components/spark/Footer.tsx` (branding + links)

**UI Library** (40+ shadcn components in `src/components/ui/`):
- card.tsx, button.tsx, input.tsx, label.tsx, radio-group.tsx, checkbox.tsx, accordion.tsx, etc.

**Utilities & Config**:
- `src/lib/registration.ts` (types + localStorage utils)
- `src/lib/utils.ts` (cn() helper)
- `src/hooks/use-mobile.tsx` (responsive hook)
- `src/hooks/use-toast.ts` (toast hook)
- `src/index.css` (global styles + animations)
- `vite.config.ts` (dev server + OTP/Registration endpoints, loadEnv integration) [REBUILT SESSION 5]
- `tailwind.config.ts` (theme tokens)
- `tsconfig.*.json` (TypeScript configs)
- `eslint.config.js` (lint rules)
- `vitest.config.ts` (test config)
- `.env.example` (NexG + Supabase environment variable template)
- `supabase/schema.sql` (Supabase table provisioning script)
- `.gitignore` (updated to exclude .env and .env.* secrets) [UPDATED SESSION 5]

**Entry & Markup**:
- `src/main.tsx` (React mount)
- `src/App.tsx` (provider wrapping + routing)
- `index.html` (HTML template + Google Fonts)

**Build Artifacts** (generated):
- `dist/` (production build output)
- `logs/` (registration persistence - generated at runtime)

---

## 14) CHANGE LOG

### Session 8: Morning (April 14, 2026) – TechPartners Logo Branding Update
**Major accomplishments**:
- ✅ Replaced text headings "EDXSO" and "Prometric" with their respective logo images in TechPartners section
- ✅ Logo integration: EDXSO.png and prometric.png from public directory
- ✅ Maintained card styling, shadows, spacing, and multi-paragraph descriptions unchanged
- ✅ Added consistent logo sizing: h-10 w-auto with mb-3 spacing

**Files updated**:
- `src/components/spark/TechPartners.tsx`
- `context.md`

**Outcome**:
- TechPartners section now features branded logos instead of text titles, improving visual identity
- Card layout and copy remain untouched
- Design still responsive and visually balanced

### Session 7: Night (April 11, 2026) – Supabase Persistence Integration
**Major accomplishments**:
- ✅ Added Supabase dependency (`@supabase/supabase-js`)
- ✅ Integrated Supabase admin client in middleware using `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- ✅ OTP session persistence added to `public.otp_sessions` with upsert/update/delete lifecycle
- ✅ Registration persistence added to `public.registrations`
- ✅ Added `supabase/schema.sql` for `otp_sessions` and `registrations` table provisioning
- ✅ Added Supabase variables to `.env.example`
- ✅ Preserved fallback behavior when Supabase vars are not configured

**Files updated**:
- `vite.config.ts`
- `package.json`
- `package-lock.json`
- `.env.example`
- `supabase/schema.sql` (new)

**Outcome**:
- OTP and registration state now persist in Supabase test environment
- Existing local logs remain available for development diagnostics
- Ready to swap test credentials with production credentials from CTO

### Session 5: Afternoon – OTP Production Shift & Backend Integration
**Major accomplishments**:
- ✅ Shifted OTP from client-side dev mode to backend-driven SMS gateway (NexG Platforms)
- ✅ Implemented POST /api/otp/send endpoint with secure OTP generation and SMS delivery
- ✅ Implemented POST /api/otp/verify endpoint with rate limiting and attempt tracking
- ✅ Added OTP protections: 5-minute expiry (OTP_TTL_MS), 30-second resend cooldown, 5 max verify attempts
- ✅ Integrated Vite loadEnv for explicit environment variable loading in middleware
- ✅ Updated RegistrationForm to async OTP send/verify with loading states and error handling
- ✅ Added mobile number normalization for Indian numbers (10-digit and 91-prefixed formats)
- ✅ Added .env.example template and updated .gitignore for credential security
- ✅ Added OTP state reset when mobile number changes (freshens send/verify flow)

**Files updated**:
- `src/components/spark/RegistrationForm.tsx` (async OTP API calls, state management)
- `vite.config.ts` (OTP endpoint registration, Vite loadEnv integration)
- `.env.example` (NexG gateway configuration template)
- `.gitignore` (.env secret files)

**Files not created but referenced**:
- `.env` (user-provided, not committed)

**Outcome**:
- OTP flow now uses real SMS gateway instead of dev mode toast
- Credentials properly isolated from code and version control
- Backend handles OTP lifecycle (generation, hashing, TTL, attempt tracking)
- Frontend only manages UX state and API calls
- Ready for production deployment with zero credential exposure

### Session 4: Morning – Hamburger Menu Information Architecture Sync
**Major accomplishments**:
- ✅ Updated hamburger menu labels to match section titles: About Spark, Recognition, Program Overview, FAQs
- ✅ Removed Comparison as a standalone menu label and mapped Why Spark to comparison section anchor
- ✅ Added explicit Recognition menu item mapped to rewards section anchor
- ✅ Kept Contact Options behavior unchanged
- ✅ Applied anchor correction: Why Spark → `/#comparison`

**Files updated**:
- `src/components/spark/Navbar.tsx`
- `context.md`

**Outcome**:
- Menu wording now matches homepage section language and expected navigation flow
- Anchor behavior aligned with agreed UX mapping

### Session 3: Night – Registration Route Split (Homepage Length Optimization)
**Major accomplishments**:
- ✅ Separated long registration form from homepage to dedicated route (`/registration`)
- ✅ Added `RegistrationCTA` section on homepage between HowItWorks and TechPartners
- ✅ Kept full registration flow unchanged (OTP, API submit, continuation page)
- ✅ Updated register entry points to route-based navigation:
  - Hero CTA → `/registration`
  - Navbar Register item → `/registration`
  - Footer Register link → `/registration`
- ✅ Updated section links to route-safe anchors (`/#...`) for cross-page consistency
- ✅ Build validation passed after route split

**Files added**:
- `src/pages/Registration.tsx`
- `src/components/spark/RegistrationCTA.tsx`

**Files updated**:
- `src/App.tsx`
- `src/pages/Index.tsx`
- `src/components/spark/Hero.tsx`
- `src/components/spark/Navbar.tsx`
- `src/components/spark/Footer.tsx`

**Outcome**:
- Homepage became significantly shorter and cleaner
- Registration remains one click away, with no feature loss

### Session 2: Evening – Final Polish & Context Documentation
**Major accomplishments**:
- ✅ Rewards section icons: Replaced 🎖 🥇 🎁 with Lucide icons (Award, Trophy, Gift)
- ✅ Icon styling: Primary blue color, rounded badge containers (w-12 h-12, bg-primary/10)
- ✅ Build validation: 0 errors, all modules transformed successfully
- ✅ Comprehensive context.md audit: Visited all 13 components, verified 100+ implementation details
- ✅ Documented: 40+ pages of technical details covering architecture, APIs, styling, state management

**Files modified**:
- `src/components/spark/Rewards.tsx` (emoji → icons)
- `context.md` (fully updated with complete project state)

**Build**: ✅ Passed (1701 modules, 384.62KB gzipped)

### Session 1: Full Day – Registration System & UI Redesign
**Major accomplishments**:
- ✅ Registration form: Expanded from 5 fields to 20+ fields across 4 sections
- ✅ OTP verification: Dual-person (principal + coordinator)
- ✅ Backend API: Vite middleware with unique ID generation (SPARK-YYYYMMDD-XXXXXXX)
- ✅ Persistence: Dual format (logs/registrations.log + logs/registrations.db.json)
- ✅ Hero redesign: Blue gradient banner + floating partner mention box
- ✅ Navbar redesign: Hamburger menu + 8 navigable sections
- ✅ Counter animations: Highlights section (100+ → 25,000+ over 2.5s)
- ✅ AboutSpark section: New 5-paragraph mission card
- ✅ FAQ expansion: 5 → 15 questions with load-more button
- ✅ Rewards section: New (replaces Reasons)
- ✅ Type synchronization: vite.config.ts + registration.ts + form component
- ✅ All builds passed, zero errors

---

## 15) NEXT IMMEDIATE ACTIONS

**Default recommendation** (if no specific user request):
1. Test registration end-to-end (form → submit → check logs)
2. Review tablet responsiveness (768px–1024px) if time permits
3. If production deployment needed: Start backend migration planning

**If user specifies work**:
- Break down requested task into components
- Reference this context for accurate implementation details
- Run builds after each major change
- Update context.md before next session

---

**End of Context Document**
*This document is source-of-truth for project state. Update immediately after major changes.*
**Last verified**: 2026-04-11 (Supabase-backed OTP + registration persistence validated in test environment)
