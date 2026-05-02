# SPARK Olympiad Project Context

Last updated: May 2, 2026
Scope: Full workspace context + National Achievement + School Performance + Student Insights page implementation/refinement

## 1) Project Snapshot

- App type: React + TypeScript + Vite landing site with school registration workflow.
- Primary user journey: Marketing homepage -> school registration form -> registration confirmation page.
- Backend behavior exists in two modes:
  - Vercel/serverless style handlers under api/*.
  - Standalone Node runtime in server.js for serving dist + APIs.
- Data persistence target: Supabase (registrations + OTP sessions), with partial local fallback depending on runtime mode.

## 2) Stack and Tooling

- Frontend: React 18, TypeScript, React Router v6, Tailwind CSS, shadcn/ui, Lucide icons.
- State/data: React local state, localStorage for latest registration, React Query provider included globally.
- Build/dev: Vite 5 with React SWC plugin.
- Lint/test: ESLint + Vitest scaffold; Playwright config exists.

Key files:
- src/main.tsx
- src/App.tsx
- vite.config.ts
- package.json

## 3) Route Map

Defined in src/App.tsx:
- / -> src/pages/Index.tsx
- /registration -> src/pages/Registration.tsx
- /privacy-policy -> src/pages/PrivacyPolicy.tsx
- /terms-and-conditions -> src/pages/TermsAndConditions.tsx
- /national-achievement -> src/pages/NationalAchievement.tsx
- /school-performance -> src/pages/SchoolPerformance.tsx
- /student-insights -> src/pages/StudentInsights.tsx
- /events-and-highlights -> src/pages/EventsAndHighlights.tsx
- /nation-achievement -> redirect to /national-achievement (alias route)
- /registration/continue -> src/pages/RegistrationContinuation.tsx
- /registration/admin -> src/pages/RegistrationsDashboard.tsx
- /registeration -> redirect to /registration/admin (legacy typo route)
- * -> src/pages/NotFound.tsx

## 4) Homepage Composition (Current)

Rendered by src/pages/Index.tsx in this order:
1. TopBar
2. Navbar
3. Hero
4. Highlights
5. AboutSpark
6. ReportsAnalytics
7. Comparison
8. Rewards
9. Pricing
10. HowItWorks
11. RegistrationCTA
12. TechPartners
13. FAQ
14. Footer

Behavior:
- Reveal-on-scroll animation applied to all section elements via IntersectionObserver.
- Threshold: 0.12, rootMargin: "0px 0px -8% 0px".
- If prefers-reduced-motion is enabled, sections are marked visible immediately.
- On plain route navigation to / (without hash), page scroll is reset to top.
- Hash scrolling is handled in Index.tsx by observing location.hash and scrolling target section into view.

## 5) Notable Component State (Verified)

- TopBar currently returns null (no ticker shown): src/components/spark/TopBar.tsx.
- Navbar links are hash-aware and mostly anchored to homepage sections; Register links to /registration.
- Navbar keeps a centered absolute logo with responsive image sizing; right-side contact visibility is breakpoint-gated (phone from md, email from lg) to avoid logo overlap on mid-width screens.
- Hero uses /heroimg.png and includes a yellow announcement strip + metrics card with shared counter.
- ReportsAnalytics now uses the heading "SPARK Academic Impact & Benchmark Intelligence Hub" with an additional academic-intelligence intro paragraph above the cards.
- ReportsAnalytics card titles currently are:
  - "National Recognition & Achievement Benchmarks"
  - "School Performance Analytics"
  - "Student Insight Reports"
  - "SPARK Events & Highlights"
- ReportsAnalytics CTA labels currently are:
  - "View National Achievement Trends"
  - "View School Reports"
  - "View Student Reports"
  - "View Events"
- ReportsAnalytics first CTA is enabled and routes to /national-achievement.
- ReportsAnalytics second CTA is enabled and routes to /school-performance.
- ReportsAnalytics third CTA is enabled and routes to /student-insights.
- ReportsAnalytics fourth CTA is enabled and routes to /events-and-highlights.
- ReportsAnalytics no longer shows the "PDFs are view-only..." note beneath cards.
- RegistrationCTA links to /registration.
- Footer now uses a premium multi-column layout and links to dedicated Privacy Policy and Terms & Conditions pages.

## 5.1) National Achievement Page (New)

Page file:
- src/pages/NationalAchievement.tsx

Current page behavior/state:
- Mounted route scrolls to top immediately (prevents landing mid-page from CTA navigation state).
- Reveal-on-scroll behavior mirrors homepage section reveal settings:
  - Threshold: 0.12, rootMargin: "0px 0px -8% 0px".
  - Reduced-motion accessibility path is preserved.
- Hero uses /image3.jpeg from public/ as the visual.
- Primary CTA links:
  - "Join SPARK" -> /registration
  - "Back to Home" -> /

Page sections currently implemented:
- Hero with title and intro:
  - "National Achievement & Benchmark Alignment Trends Across Spark Networks"
- Recognition Framework (4 cards)
- National Trend Snapshot (3 detailed cards):
  - National Achievement Distribution Snapshot
  - Medal & Recognition Performance Patterns
  - What This Means for Schools
- Insights From Across Participating Institutions (4 cards)
- Why It Matters for Schools (alternating timeline):
  - Steps 1,3,5 left and 2,4 right on desktop
  - Single-column fallback on mobile
  - Step cards reveal one-by-one on scroll
  - "STEP" label removed from cards
  - Center branch timeline with compact alternating cards
- Built for Forward-Looking Academic Institutions (theme-aligned feature section):
  - Feature cards now use equal-height/tidy vertical rhythm so wrapped and single-line titles stay visually aligned
  - Accent bars are pinned to the bottom of each card for consistent card geometry
  - Palette was tuned back toward the page's blue-white identity after earlier experimental color passes
- Final CTA panel with button:
  - CTA card now follows the same blue institutional palette as the page instead of a separate heavy color treatment
  - Primary button uses a higher-contrast light treatment for clearer hierarchy
  - "Join SPARK" -> /registration
  - "Back to Home" -> /

## 5.2) School Performance Page (New)

Page file:
- src/pages/SchoolPerformance.tsx

Current page behavior/state:
- Mounted route scrolls to top immediately.
- Reveal-on-scroll behavior mirrors homepage/national achievement settings:
  - Threshold: 0.12, rootMargin: "0px 0px -8% 0px".
  - Reduced-motion accessibility path is preserved.
- Hero is a two-column split with left narrative and right analytics preview panel.
- Hero CTA behavior:
  - "View School Reports" opens a same-window modal viewer for /olympiad_analytics.pdf.
  - "Register" routes to /registration.
- PDF viewer behavior:
  - Uses an in-page dialog + iframe.
  - Viewer is intentionally presented without an explicit app-level download action.
  - PDF URL uses toolbar/navpane minimization flags; browser-native behavior can still vary.

Page sections currently implemented:
- Hero: "School Performance Analytics" + analytics preview widgets.
- Analytics Capabilities (4 compact cards in a single desktop row; responsive stack on smaller screens).
- Report Preview section:
  - "Inside a Spark School Performance Report"
  - Performance overview chart grid + strength/improvement sub-cards.
  - Left blue report-module sidebar was removed in latest refinement.
- Benchmark Insights:
  - Five-step horizontal process cards with centered connector arrows on desktop.
  - Four supporting outcome cards with centered text and elevated shadows.
- Report Workflow:
  - "How Schools Use Reports" with 5 cards.
  - Cards were shortened to a compact width (`lg:max-w-[364px]`), with centered text and no inner blue bullet/dot marks.
  - The branch-style flow now keeps the numbered timeline badges in the center while the cards alternate left/right on desktop.
- Final CTA section:
  - "Want Better Visibility into School Performance?"
  - "View School Report" opens PDF viewer modal.
  - "Partner With Spark" routes to /registration.

Removed during refinement:
- "Institutions Engaging with Spark - 2025" section is no longer present.

## 5.3) Student Insights Page (New)

Page file:
- src/pages/StudentInsights.tsx

Current page behavior/state:
- Mounted route scrolls to top immediately.
- Reveal-on-scroll behavior mirrors homepage settings:
  - Threshold: 0.12, rootMargin: "0px 0px -8% 0px".
  - Reduced-motion accessibility path is preserved.
- Hero CTA behavior:
  - "View Student Reports" opens a same-window modal viewer.
  - "Register" routes to /registration.
- PDF viewer behavior:
  - Uses an in-page dialog + iframe.
  - Viewer is intentionally presented without an explicit app-level download action.
  - Current PDF URL: /student_report.pdf (with toolbar/navpane minimization flags).

Page sections currently implemented:
- Hero: "Student Insight Reports" + report snapshot card with radar + readiness tiles.
- Report Benefits (4 cards).
- Sample Preview:
  - "Inside a Spark Student Insight Report" preview card with solid blue header, readiness bars, strength/focus lists, and guidance panel.
- Competency Insights:
  - "Visibility that goes beyond scores" with 5 competency cards and a radar chart.
  - Confidence Readiness card centered on its own row.
- Final CTA panel:
  - "Ready to see a full report?" with gradient/glow background and CTA buttons.

## 5.4) Events & Highlights Page (New)

Page file:
- src/pages/EventsAndHighlights.tsx

Current page behavior/state:
- Mounted route scrolls to top immediately.
- Reveal-on-scroll behavior mirrors homepage settings:
  - Threshold: 0.12, rootMargin: "0px 0px -8% 0px".
  - Reduced-motion accessibility path is preserved.
- All cards include hover shadow + scale effects.

Page sections currently implemented (order):
- Hero: "SPARK Events & Highlights" with highlights strap; primary CTA "Explore Milestones" scrolls to the next section; secondary CTA "Partner With Spark" routes to /registration.
- Moments That Defined Spark (highlights cards):
  - Student Participation
  - Recognition Celebrations
  - Institutional Engagement
  - Community Building
- What Spark 2025 Stood For (Milestones) cards: Learning, Reach, Focus, Spirit.
- What Educators Tell Us: three testimonial cards.
- Participation Journey: five-step icon timeline.
- Building Stronger Academic Communities: image panel (public/image4.jpeg) with four engagement cards.
- Final CTA: "Be Part of the Next Spark Success Story" with single "Register School" button.

## 6) Registration Flow (Frontend)

Entry points:
- Homepage CTA: src/components/spark/RegistrationCTA.tsx
- Registration page shell: src/pages/Registration.tsx
- Form implementation: src/components/spark/RegistrationForm.tsx

Registration page route behavior:
- /registration scroll is reset to top on mount to ensure deep-link/CTA navigation starts at page top.

Form sections in RegistrationForm:
- School details (name, board, strength, lab availability, optional computer count).
- Principal details (name, email, mobile).
- Coordinator details (name/designation/email/mobile + OTP send/verify).
- Program details (expected participants + exam window).
- Declaration checkbox.

Validation gates before submit:
- Coordinator OTP must be verified.
- Exam window must be selected.
- Declaration must be checked.

Submit behavior:
- POST /api/registrations with RegistrationCreateRequest payload.
- On success: save response to localStorage key spark.registration.latest and navigate to /registration/continue.

Type model:
- src/lib/registration.ts defines RegistrationPayload and RegistrationCreateRequest.

## 7) OTP Flow

Endpoints:
- POST /api/otp/send
- POST /api/otp/verify

Frontend usage:
- RegistrationForm sends coordinator OTP requests only (channel: coordinator).

Backend logic (api/otp/send.ts, api/otp/verify.ts, api/_lib/otp.ts):
- Normalizes Indian mobile numbers to 10-digit local format.
- OTP TTL: 5 minutes.
- Resend cooldown: 30 seconds.
- Max verify attempts: 5.
- OTP stored hashed (SHA-256).
- Key format: channel:mobile.
- Gateway: NexG via GET query API, with destination sent as 91 + mobile.
- Template placeholders supported: {{OTP}}, {{NAME}}, {{SCHOOL}} plus legacy $otp/$name/$school replacements.

Persistence for OTP sessions:
- Preferred: Supabase table otp_sessions.
- Fallback: in-memory Map (process lifetime only).

## 8) Registrations API and Confirmation Email

Main handler:
- api/registrations.ts

Process:
- Generates registrationId: SPARK-YYYYMMDD-<UUID-segment>.
- Adds createdAt timestamp.
- Inserts into Supabase registrations table.
- Attempts ZeptoMail confirmation email (non-blocking for API success).
- Returns 201 + registration record payload.

Email module:
- api/_lib/email.ts
- Recipients deduped from schoolEmail, principalEmail, coordinatorEmail.
- Logs detailed send stages to logs/registration-email.log.

## 9) Dashboard Flow

Frontend page:
- src/pages/RegistrationsDashboard.tsx

Behavior:
- Basic Auth credentials entered in UI.
- Encoded token stored in sessionStorage key spark.dashboard.basicAuth.
- Fetches GET /api/dashboard/registrations with Authorization header.

Backend endpoint:
- api/dashboard/registrations.ts
- Auth check via api/_lib/auth.ts.
- Returns registration list sorted by created_at desc.

## 10) Database Schema Expectations

Defined in supabase/schema.sql:
- public.otp_sessions table + indexes.
- public.registrations table + indexes.

Important:
- APIs assume these tables already exist.
- Missing-table errors are surfaced with explicit messages.

## 11) Runtime Modes and Differences

Mode A: Serverless-style handlers
- Files: api/*.ts and api/_lib/*.ts
- Expected in Vercel or compatible serverless routing.

Mode B: Standalone Node server
- File: server.js
- Serves dist assets and API endpoints on PORT (default 5104).
- Includes local fallback save for registrations when Supabase is absent:
  - logs/registrations.log
  - logs/registrations.db.json

Notable divergence:
- api/registrations.ts returns 500 when Supabase is missing.
- server.js registration handler can fallback to local file persistence if Supabase is missing.
- ZeptoMail default endpoint differs between codepaths:
  - api/_lib/email.ts uses https://api.zeptomail.in/v1.1/email
  - server.js uses https://api.zeptomail.com/v1.1/email

## 12) Environment Variables in Use

Supabase:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_ANON_KEY (present in ecosystem but not required by server handlers)

OTP gateway (NexG):
- NEXG_USERNAME
- NEXG_PASSWORD
- NEXG_FROM
- NEXG_DLT_TEMPLATE_ID
- NEXG_DLT_PRINCIPAL_ENTITY_ID
- NEXG_DLT_TELEMARKETER_ID
- NEXG_OTP_TEXT_TEMPLATE

Email:
- ZEPTOMAIL_API_TOKEN
- ZEPTOMAIL_API_URL
- REGISTRATION_EMAIL_FROM
- REGISTRATION_EMAIL_FROM_NAME
- REGISTRATION_EMAIL_REPLY_TO

Dashboard auth:
- DASHBOARD_USERNAME
- DASHBOARD_PASSWORD

## 13) Known Risks / Gaps

- TopBar is intentionally disabled (returns null), but older notes may still describe ticker behavior.
- ReportsAnalytics has mixed state by design:
  - First CTA is active (/national-achievement)
  - Second CTA is active (/school-performance)
  - Remaining two CTAs are still intentionally disabled until their pages are built.
- Duplicate section id="register" exists in two components:
  - src/components/spark/RegistrationCTA.tsx
  - src/components/spark/RegistrationForm.tsx
  This can produce ambiguous hash scrolling behavior.
- PDF viewing is browser-native; hiding explicit download controls in UI does not guarantee hard prevention of all extraction paths.
- Principal OTP channel is supported backend-side but not used in current frontend form flow.
- Default fallback secrets still exist in code for NexG and dashboard auth if env vars are absent.
- Runtime behavior differs between serverless handlers and server.js fallback mode; operational docs should choose one canonical deployment path.
- Footer legal links now resolve to frontend routes, so any future legal copy changes should update both the page content and the footer targets together.

## 14) Testing and Quality State

- Vitest config exists and runs.
- Only placeholder example test currently present (minimal real coverage).
- Playwright config exists but no meaningful authored E2E coverage observed.

## 15) Suggested Next Context Update Triggers

Update this file whenever these change:
- Route table in src/App.tsx.
- Registration form payload/type schema in src/components/spark/RegistrationForm.tsx or src/lib/registration.ts.
- API behavior in api/registrations.ts, api/otp/*.ts, api/dashboard/registrations.ts.
- Deployment mode decision between server.js and serverless api/*.
- Section IDs and navigation anchors affecting hash-scroll behavior.
- Footer structure or legal page content/targets.
