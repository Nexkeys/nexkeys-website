# NexKeys Agency — v2.0

Next.js 15 · TypeScript (strict) · Tailwind · shadcn-style UI · Framer Motion · React Three Fiber · Firebase v10

This folder is **self-contained**. When the rebuild is complete you can copy `nexkeys/`
out to its own location and delete the legacy site — nothing here reaches outside itself.
All asset paths are `/images/...` (served from `public/`), all imports use the `@/` alias.

---

## Quick start

```bash
cd nexkeys
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run typecheck    # tsc --noEmit
```

---

## Design system

**Two golds, one black, one atmosphere.**

| Token | Value | Use |
|---|---|---|
| `gold` | `#C9A227` | Primary. Buttons, links, accents, focus rings |
| `gold-light` / `bright` / `dark` / `deeper` | `#E8BC2C` `#F0CC50` `#8B6914` `#5A4209` | Gradient stops, hovers |
| `midnight-gold` | `#1A1509` | Section grounds — black *with gold in it* |
| `midnight-2/3/edge/lit` | `#241C0E` `#332815` `#4A3A18` `#7A5F1E` | Elevated midnight surfaces, borders, accent |
| `bg` | `#050508` | Base ground |

The legacy `#f8c03e` used by the old admin panel and internship portal is **gone** — one
gold site-wide (plan §4.3).

**Typography:** Bebas Neue (display) · Syne (headings) · DM Sans (body), all self-hosted
via `next/font` — no render-blocking `<link>`, zero CLS.

**Whitespace:** `py-section` = `clamp(80px,12vw,160px)`. Roughly 40% more breathing room
than the legacy site. This is deliberate — do not tighten without a reason.

---

## Structure

```
app/            routes (App Router)
components/
  nav/          liquid-nav
  hero/         hero, nk-monogram, particle-field (GLSL)
  sections/     marquee, stats, bento, process, testimonials, cta, project-card,
                internship-portal
  forms/        internship-form, waitlist-form
  motion/       reveal, magnetic, counter
  shared/       custom-cursor, site-footer, footer-storm, scroll-to-top, cookie-consent
  providers/    lenis-provider
  ui/           section-header
hooks/          use-capabilities
lib/            firebase, internship, types, utils
lib/data/       tracks, projects, testimonials, services, team
public/images/  projects, team, blog, services, tracks, brand, icons, tool-stack,
                clients, fx
```

---

## Signature pieces

**Liquid navbar** (`components/nav/liquid-nav.tsx`)
Gooey SVG-filter blob that morphs between links, spring `layoutId` pill, glass that
thickens on scroll, and **hidden navigation** — it retracts on scroll-down and returns on
scroll-up once past the hero. Mobile morphs into a circular-reveal full-screen panel.

**Footer storm** (`components/shared/footer-storm.tsx`)
Procedural gold lightning on canvas. Every bolt is generated at runtime by recursive
midpoint displacement, with forks, a three-pass glow (bloom → mid → hot core), sheet-
lightning wash, and irregular multi-flash timing. No two strikes are alike. Layered over
`/images/fx/gold-lightning.jpg`.

**Particle field** (`components/hero/particle-field.tsx`)
The original GLSL vertex/fragment shaders from `vfx.js:193–241`, ported verbatim to R3F.
Dynamically imported and desktop-only — never enters a phone bundle.

**NK monogram** (`components/hero/nk-monogram.tsx`)
Kept from the legacy site, rebuilt with real perspective: the assembly tilts toward the
pointer with rings, glow, letters and chips at separate `translateZ` depths.

---

## Performance & accessibility guarantees

- `useCapabilities()` (ports `vfx.js:31–35`) gates every expensive effect on touch,
  viewport, reduced-motion and core count. WebGL, the cursor halo and the storm all ask
  it first.
- `prefers-reduced-motion` is honoured by **every** animation, including the storm and
  the particle field.
- The custom cursor only hides the native cursor **after it mounts** and confirms a fine
  pointer — fixes the legacy bug where a JS failure left users cursorless (plan §4.10).
- All imagery goes through `next/image` with explicit `sizes`.
- Legacy `.html` URLs 301 to the new routes (`next.config.mjs`) — no inbound link 404s.

---

# CHANGELOG

## [2.0.0-alpha.8] — 2026-08-09 · Cookie consent: reject option

### Added — a real choice, not just "Accept"
- **Reject button**, same size as Accept, side by side, one click each. Making
  reject harder to reach than accept — buried in a sub-panel or styled as a
  faint text link — is a dark pattern and explicitly non-compliant under GDPR,
  which the NDPR mirrors.
- `lib/consent.ts` — typed consent state, separate from the banner so anything
  that might set a non-essential cookie can check it without importing UI.
  Exposes `getConsent()`, `setConsent()` and `hasAnalyticsConsent()`, plus a
  `nk:consent-change` window event.
- `hasAnalyticsConsent()` defaults to **false** when no choice has been made.
  Opt-in, not opt-out: silence is not consent.
- Backwards compatible: earlier builds stored the string `'true'` for accepted,
  which is still honoured, so returning visitors are not asked twice.

### Changed — banner copy
Was *"By continuing to visit this site you agree to our use of cookies."*
Consent-by-continuing is not valid consent once a reject option exists, and it
directly contradicted the button next to it. Now states that essential cookies
are always on and the rest is the visitor's choice.

### Honest note on what Reject currently does
This site sets **no** tracking or advertising cookies today. Firebase Analytics
is deliberately not initialised — `lib/firebase.ts` calls only `getFirestore()`
and `getAuth()`, and the `measurementId` in the config is unused (plan O17).
So there is currently nothing for "reject" to switch off.

That is exactly why `hasAnalyticsConsent()` exists. **If analytics is ever added
(O17), it must be gated on that call** — otherwise the reject button becomes a
lie, which is worse than not offering one.

### Verified
- `tsc --noEmit` — clean.
- `next build` — 21 routes, exit 0, zero warnings.
- Confirmed by grep that nothing calls `getAnalytics`.

---

## [2.0.0-alpha.7] — 2026-08-08 · Deployment fix

### Fixed — Vercel build failed on `npm install` (ERESOLVE)

```
peer date-fns@"^2.28.0 || ^3.0.0" from react-day-picker@8.10.2
Found: date-fns@4.4.0
```

`date-fns` was pinned to `^4.1.0`, outside the peer range
`react-day-picker@8` accepts. Pinned to **`^3.6.0`**.

**Why it passed locally and failed on Vercel:** the local `node_modules` was
installed incrementally, so npm never re-resolved the tree. Vercel installs from
scratch, which is where strict peer resolution actually runs. Verified by
deleting `node_modules` and reinstalling — reproducing the failure condition
rather than trusting the incremental result.

**Why the downgrade is safe:** nothing in this codebase imports `date-fns`. All
date formatting uses native `toLocaleDateString`. It is present solely as
`react-day-picker`'s peer, so the major version is that library's concern, not
ours. `npm ls` confirms a single deduped `date-fns@3.6.0`.

- Removed `date-fns` from `optimizePackageImports` — listing a package we never
  import achieves nothing.

### Verified
- Clean `rm -rf node_modules && npm install` — exit 0, no ERESOLVE.
- `tsc --noEmit` — clean.
- `next build` — 21 routes, exit 0, zero warnings.

---

## [2.0.0-alpha.6] — 2026-08-07 · Conversion gaps closed · Security rules

### Fixed — 1,613 words of work copy that had been silently dropped
The first pass generated `PROJECT_DETAILS` with `description: ''` for every
entry **and never rendered it**, so all 16 long-form project write-ups from
legacy `work.html` were missing — a direct violation of N1 ("every word of copy
carries over verbatim").

- `scripts/extract-work-details.mjs` (`npm run extract:work`) parses the 16
  `.project-item` blocks and emits `lib/data/project-details.ts`.
  **Matching is by URL, not by position** — the card order in `work.html` and in
  `lib/data/projects.ts` are not guaranteed to agree, and index matching would
  have silently attached the wrong write-up to the wrong project.
  `<br><br>` is split BEFORE tags are stripped, otherwise the two paragraphs of
  each entry merge into one run-on block.
- Verified: **16/16 matched, 1,613 words, 2 paragraphs each, 0 unmatched.**
- `components/sections/work-details.tsx` renders them as alternating rows with a
  slow scroll parallax on the visual, reduced-motion aware.
- The stale, never-rendered `PROJECT_DETAILS` export and its `ProjectDetail`
  type were deleted rather than left to mislead.

### Added — Admin filter-category manager
Restores legacy `addFilterCategory` / `removeFilterCategory`, which the first
admin pass had replaced with a hard-coded list.

- Add, remove and count usage per category; names are slugified so ids stay
  URL-safe, with a live preview of the resulting id.
- **Removing a category strips it from every project that used it.** Leaving the
  id behind would orphan projects behind a filter button that no longer exists —
  exactly the class of state that caused the legacy §4.2 bug.
- A project can never be left with zero categories; it would be unreachable
  behind every filter.
- Removal is confirm-gated and names the affected project count.

### Added — `firestore.rules`
The previous ruleset had two serious holes:

- **`availability` was world-writable** (`allow read, write: if true`). Anyone
  could clear `bookedSlots` to double-book every slot, or fill it to block the
  calendar outright. It cannot simply require auth — public booking writes here —
  so writes are now constrained to *"add exactly one slot"*: nothing removable,
  no new fields, capped at 16, legacy `slots` pinned unchanged.
- **`request.auth != null` is not "admin".** With Email/Password sign-up
  enabled, any member of the public could register and then read every booking
  and every internship application (names, emails, WhatsApp numbers, locations)
  and write blog posts, page content and settings. Replaced with `isAdmin()`,
  backed by a custom claim or an `admins/{uid}` document.
- `bookings` and `internshipApplications` creates are now field-pinned with
  size and format limits, and `status` is fixed server-side — an applicant
  could previously submit themselves as `accepted`.
- Dropped the `documents/{...}` rule: no such collection exists in this codebase.
- Unlisted collections fail closed, which matters because the admin Firestore
  viewer accepts an arbitrary collection name.

> **After deploying, grant yourself admin or you will be locked out of your own
> panel** — add `admins/<your-uid>` in the console, or set the custom claim and
> sign out and back in.

### Changed — build hygiene & rules follow-up
- `duration-[900ms]` → `[transition-duration:900ms]` in `app/about`. Tailwind
  cannot tell whether the shorthand means transition- or animation-duration and
  warned on every build; the other three image hovers already used the explicit
  form. **Build log is now warning-free.**
- Re-added a `documents/{id}` rule, **admin-only**. The collection exists in the
  live database but nothing in this codebase reads it, so it is locked rather
  than left world-readable — if it were meant to be public, something would be
  fetching it. Still reachable via the admin Firestore viewer.
- `to-dos.md` added at the repo root and **gitignored** — admin setup, launch
  checklist, accepted trade-offs and deferred opportunities.

### Verified
- `tsc --noEmit` — clean.
- `next build` — 21 routes, exit 0, zero warnings. `/work` 3.04 → 4.05 kB with
  the write-ups.
- `npm run check:routes` — green (10 declared / 15 static / 1 dynamic).
- `npm run audit:responsive` — **81/81, zero horizontal overflow**, re-run after
  the new `/work` section rather than assumed to still hold.

---

## [2.0.0-alpha.5] — 2026-08-07 · Phase 9 · Measured responsive audit

### Added — `scripts/audit-responsive.mjs` (`npm run audit:responsive`)
Drives headless Chromium over 9 routes × 9 viewports (128 · 320 · 375 · 390 ·
414 · 768 · 1024 · 1280 · 1920) and **measures** §10.3 rather than assuming it:
horizontal overflow with the culprit element named, tap-target size, and body
text size.

**Result: 81/81 combinations with zero horizontal overflow (N20).**

Three things the harness itself had to learn, each of which had produced a
believable-but-false result:

- **HTTP status is asserted before anything is measured.** The first "all
  green" run was against a server returning 500 on every route — an 86-byte
  error page trivially has no overflow, no small targets and no small text. A
  green audit against a broken build is worse than no audit, because it is
  believed. It now also fails a route that renders fewer than 10 elements.
- **A crash or navigation failure is reported, not swallowed.** One page is used
  per route and rebuilt if the renderer dies, so a mid-run crash cannot silently
  truncate results.
- **`networkidle` and `load` are unusable here** — Firestore holds a socket open
  and WebGL/font subresources keep `load` pending, so both burned their full
  timeout on every navigation. Off-origin requests are blocked outright; layout
  comes from our own CSS and DOM.

### Fixed — real bugs the audit found
- **`next/image` was proxying thum.io through our own server.** Ten of sixteen
  projects have no local thumbnail, so each card became a blocking upstream
  fetch — observed as `upstream image response timed out` with page loads
  stalling for a minute. Remote sources are now `unoptimized`, handing the
  request straight to the browser; the designed gradient shows underneath.
  Same treatment for admin-authored blog covers, which are arbitrary hosts.
  `/` load time went from timing out to **2.5s**.
- **`overflow-wrap` moved to `body` and raised to `anywhere` under 400px.**
  The tag-list version missed the legal contact cards (their links sit in a
  plain `<div>`) and an email address widened `/privacy` by 11px at **320px** —
  a real iPhone SE width. `break-word` was also the wrong value: it does not
  reduce min-content width, so flex/grid items still reserved room for the
  longest unbroken word. `anywhere` does.
- **`min-width: 0` on flex/grid items** in the brief form, booking form and
  legal contact cards. A `<select>` keeps an intrinsic width from its longest
  option, and grid items default to `min-width: auto` — together they pushed
  `/contact` ~12px wide from 390px to 1280px.
- **Horizontal reveal on a right-edge element.** `<Reveal direction="left">` on
  the brief form starts it 28px to the RIGHT and eases back, so every load
  briefly widened the document. Now vertical.
- **Hard `px` minimums that could not shrink** — the NK monogram
  (`clamp(220px,…)`) and its lettering (`clamp(120px,…)`) got the same `min()`
  escape hatch as the type scale; unchanged at ≥320px.
- Nav wordmark `min-w-0 truncate` + responsive size; carousel controls wrap.

### Fixed — accessibility
- Tap targets raised to the 44px floor: nav links (were 36px), nav wordmark and
  CTA, footer social icons (40px), legal TOC entries (37px), carousel arrows.
- Carousel pagination dots are hidden below 400px — supplementary controls with
  prev/next and swipe still available.

### Known and accepted
- Carousel dots are 6px wide targets. Supplementary, with equivalent
  alternatives (prev/next, swipe, keyboard), per WCAG 2.5.8.
- Eyebrow labels render at 10–11px **at 128px only**; at 320px and above they
  are 11px as designed.

---

## [2.0.0-alpha.4] — 2026-08-07 · Global phone · Admin panel

### Added — International phone number (internship goes global)
- `lib/data/countries.ts` — 195 countries with ISO 3166-1 alpha-2 codes and
  dial codes. Flags are **derived** from the ISO code via the Unicode
  regional-indicator block, so no emoji are hardcoded and the set cannot drift.
- `components/forms/phone-input.tsx` — searchable country combobox + number
  field. A real combobox (`aria-expanded`, `aria-activedescendant`, arrow /
  Home / End / Escape, focus return), because a `<select>` cannot show flags or
  a search box and 195 unsearchable options is unusable.
- Country is **pre-selected from the visitor's timezone/locale** after mount, so
  most applicants never open the dropdown. After mount specifically — doing it
  during render would desync the server and client HTML.
- Validation floor relaxed from 10 digits to 6: subscriber length varies
  worldwide (Norway 8, Nigeria 10, China 11) and the old rule would have locked
  out valid short-format countries.

**Schema decision (N2).** `whatsapp` keeps its name and its type, and now stores
the full international string (`+2348012345678`) — so existing documents and the
admin WhatsApp deep-link keep working untouched. `whatsappCountry` and
`whatsappDialCode` are **additive and optional**; pre-global applications simply
lack them, and the admin omits the flag rather than guessing one.

### Added — `/admin` (Phase 7), 6 routes
- `AdminShell` — sidebar, collapsible on mobile, on-brand `#C9A227` throughout.
  **Fixes N9:** `checking` is the initial state, so nothing but a spinner renders
  until Firebase resolves. The legacy panel rendered the whole CMS first and
  checked auth after, briefly showing the interface to anyone.
- `/admin` — dashboard (O10) with KPI tiles, recent activity, and the hiring
  toggle front and centre with optimistic update + rollback.
- `/admin/bookings` — search, status filter, optimistic status change, CSV
  export, confirm-on-delete.
- `/admin/internships` — track pills, status filter, screening answer dialog,
  WhatsApp deep-link preserved, **country flag + name per applicant**, CSV
  export including the new country fields.
- `/admin/blog` — split editor with **live preview** (O11), slug field feeding
  `/blog/[slug]`, cover-image preview, reading-time estimate.
- `/admin/content` — work-page CMS: header copy, reorder, per-project filter
  toggles. Seeds from the built-in catalogue when the CMS is empty so a first
  save cannot blank the public page.
- `/admin/firestore` — kept but **guarded** (D8 / §9.2 #11): read-only by
  default, explicit write unlock, JSON validated before any write, confirm
  dialog naming the document. The legacy `saveDocument()` wrote arbitrary fields
  to arbitrary collections with none of that.
- Every destructive action goes through `ConfirmDialog`; collections are read
  with `limit()` rather than the legacy unbounded `.orderBy().get()` (§9.2 #8).
- CSV export quotes per RFC-4180 **and** prefixes cells starting `=`, `+`, `-`
  or `@` — those are executed as formulas by Excel and Sheets, and these tables
  contain values typed by the public.

### Changed
- **`/work` is now CMS-driven** (N11 / N13) via `lib/work.ts`, with the built-in
  catalogue as fallback. Firestore wins only when it actually has projects — an
  empty or unreachable CMS must never blank the public portfolio.
- `lib/work.ts` is deliberately separate from `lib/admin.ts`: the latter imports
  `firebase/auth`, which the public page has no reason to ship.
- Route guard now understands `system`-group routes, so private `/admin/*`
  children no longer trigger "missing from the manifest" warnings.

### Verified
- `tsc --noEmit` — clean.
- `npm run check:routes` — **fully green**, 10 declared / 15 static / 1 dynamic.

---

## [2.0.0-alpha.3] — 2026-08-07 · Phase 5 + Legal

### Added — `/blog` and `/blog/[slug]` (plan §4.13 / O1)
- Posts are fetched **server-side** with ISR (`revalidate = 300`). This is the
  change that makes the blog real: the legacy version fetched from the browser
  and wrote into `innerHTML`, so a crawler received an empty grid and all of the
  meta + JSON-LD work in `blog.js:479–585` was invisible. Article text now ships
  inside the HTML.
- `/blog/[slug]` with `generateStaticParams`, per-post `generateMetadata`,
  Open Graph, Twitter cards and `BlogPosting` JSON-LD.
- `lib/blog.ts` — slug derivation (legacy posts have no `slug` field, so one is
  derived from the title with a doc-id fallback; **no data migration needed**),
  reading time, related posts, `toParagraphs`.
- Unused `blog/*` PNGs are now the fallback covers, replacing the grey
  "No Image" data-URI at `blog.js:77` (§3.4).
- Search uses `useDeferredValue` so typing stays responsive while the grid
  re-filters at lower priority.

### Added — `/about`
- Full team cards from typed data, values bento with lucide icons, stats.
- **Blog previews pull live from Firestore** (O9) — the legacy About page
  hard-coded four posts that went stale on the next publish.

### Added — `/contact`
- `lib/bookings.ts` — availability read, batched booking write, `.ics` builder
  (O8). Handles **both** availability shapes: `bookedSlots` lists what is taken,
  while the older `slots` field listed what was still OPEN and has to be
  inverted. Reading it directly would have offered slots already booked.
- Booking is written in a single `writeBatch`, so a booking can never exist
  without its availability record or vice-versa.
- Stepped flow — Date → Time → Details → Confirm (§8.5) — on `react-day-picker`,
  which brings real keyboard navigation and screen-reader semantics; the legacy
  calendar at `contact.html:356–480` was div soup with neither.
- Timezone is now **displayed**, not just captured, so a booking is unambiguous.
- `BriefForm` → EmailJS. Service and both template ids unchanged (N6). Owner
  notification is awaited; the client confirmation is best-effort so a failure
  there never tells the visitor their brief was lost.

### Added — Legal pages `/privacy`, `/terms`, `/legal`
- `scripts/extract-legal.mjs` converts the three legacy documents into a typed
  content model. Written rather than hand-transcribed because N1 requires every
  clause **verbatim**, and ~1,300 lines of dense copy is exactly where manual
  transcription silently drops a sentence. Verified: extracted word counts
  exceed the source article counts (privacy 1,898 vs 1,836; terms 2,421 vs
  2,370) since they also carry the header and meta — nothing lost.
- Copy is modelled as typed **inline nodes**, not HTML strings, so the renderer
  needs no `dangerouslySetInnerHTML` anywhere in the legal path (N24).
- One `(legal)` route group and one `LegalPage` shell replace ~1,300 duplicated
  layout lines (§8.7). Sticky scroll-spy TOC via a single IntersectionObserver —
  no scroll listener.
- Wide tables scroll inside their own container, never widening the page.
- `/legal` is a hub (policy cards + inlined Cookie Policy + commitment band),
  matching the legacy structure rather than the document shell.

### Verified
- `tsc --noEmit` — clean.
- `npm run check:routes` — only `/admin` outstanding.

---

## [2.0.0-alpha.2] — 2026-08-07 · Routing spine · Speed · The 128px floor

### Added — Routing spine
- **`lib/data/routes.ts` — one manifest, every URL.** Nav, footer, sitemap and
  the route guard all read from it. Link targets are no longer maintained in
  three places that could disagree.
- **`scripts/check-routes.mjs`** (`npm run check:routes`) — fails the build if a
  declared route has no `page.tsx`, warns if a page is missing from the
  manifest. Written because the navbar and footer were linking to seven routes
  that did not exist; `next build` compiles a `<Link>` to nowhere without
  complaint, so nothing caught it.
- `app/work/page.tsx` — **Phase 4**. Header stats, filterable grid, testimonial
  carousel, internship bridge, CTA.
- `components/sections/work-grid.tsx` — typed filter state, `layoutId` spring
  pill, `AnimatePresence` re-flow, paging, empty state.
- `app/not-found.tsx` + `app/error.tsx` — branded 404 and error boundary (O20).
- `app/sitemap.ts` + `app/robots.ts` — generated from the manifest; `/admin` is
  excluded and disallowed (O4).

### Fixed
- **§4.2 — the CMS can no longer break work filtering.** Legacy `work.js`
  rebuilt filter buttons via `innerHTML`, destroying the handlers `main.js` had
  bound inline; filtering then died silently, in production only, once the CMS
  had content. Filters are now React-bound derived state — no DOM to rebuild.
- Nav and footer links all resolve. `/work` shipped; the remaining seven are
  tracked by the route guard rather than discovered by a visitor.

### Changed — Performance
- **`useCapabilities` no longer thrashes.** It recomputed on *every* `resize`
  and returned a fresh object each time, re-rendering every consumer. Mobile
  browsers fire `resize` continuously while the URL bar collapses on scroll, so
  the whole animated tree re-rendered mid-scroll. Now: width-only (height
  changes ignored), 150 ms debounce, and structurally compared so an unchanged
  result returns the previous object reference. Biggest single scroll-jank fix.
- **Lenis retuned for responsiveness** — `duration: 1.35` → `lerp: 0.12`. A
  duration tween commits to a fixed travel time, so the page keeps gliding after
  the wheel stops: precisely the "delayed" feeling. A lerp always chases the
  current target. Touch left native — hijacking momentum scrolling is the most
  common cause of a site feeling slow on mobile.
- **Cursor hover detection delegated.** Was two listeners on every interactive
  node found at mount — hundreds of listeners, blind to anything rendered later
  (route changes, modals, filtered cards). Now one delegated pair on `document`.
- **Cursor rAF parks when idle** instead of running at 60fps while the user
  reads. `mousemove` restarts it. The dot still writes synchronously from the
  event — never lerped — so the pointer stays instant.
- **Footer storm code-split.** `SiteFooter` is a server component and imported
  the 254-line canvas directly, so it shipped in the client bundle of every
  route — including phones, where it is gated off and never draws. Now behind
  `FooterStormMount`: async chunk, requested only when capabilities allow.
  **Home page JS 21.6 kB → 6.97 kB.**
- `optimizePackageImports` for `lucide-react`, `framer-motion`, `date-fns`,
  `@react-three/drei` — barrel-file tree shaking.
- `backdrop-filter` radius halved below 768px / on coarse pointers, and removed
  entirely below 400px. Mobile GPUs charge by blur radius, and the glass panels
  cover a large share of a phone viewport — this was costing more frame budget
  than every animation combined.

### Changed — Responsive floor now 128px
- **Fluid type escape hatch.** `clamp(72px, 12vw, 180px)` never goes below
  72px, so a 128px viewport rendered 72px type into a ~108px column and blew the
  layout sideways. The floor is now viewport-relative itself:
  `clamp(min(72px, 20vw), 12vw, 180px)`. At ≥360px the `min()` resolves to the
  px value and the scale is **byte-for-byte identical** — phone and desktop
  design untouched. Below that it keeps shrinking instead of hitting a wall.
- Container gutter fluid: `clamp(0.625rem, 3.5vw, 1rem)`. A flat 1rem cost 32px
  of a 128px viewport.
- Global guards so no component has to remember them: media capped at 100%
  width, `overflow-wrap` on prose *and* headings, form controls floored at 16px
  (below that iOS auto-zooms the viewport on focus), 44px minimum tap targets by
  default, `scroll-padding-top` clearing the fixed navbar.
- Added `xxs: 320px` breakpoint; `--nav-h` drops to 60px below 400px.

### Added — Assets
- Four new images wired in from `assets/New-IMG's`: `landing-pages.jpg`,
  `team-as-a-service.jpg`, `ui-ux.jpg`, `mobile-apps.png`. All six services and
  the `mobile` / `uiux` tracks now carry real imagery.

### Verified
- `tsc --noEmit` — clean.
- `next build` — succeeds, 8 static routes.
- `npm run check:routes` — correctly fails on the 7 unbuilt routes.

---

## [2.0.0-alpha.1] — 2026-08-06 · Foundation + Home + Internship

### Added — Project foundation
- Next.js 15 App Router scaffold, TypeScript `strict`, Tailwind 3.4, PostCSS.
- Full token system in `tailwind.config.ts` incl. the new **Midnight Gold** family.
- `app/globals.css`: shadcn semantic roles, glass utilities (`glass`, `glass-strong`,
  `glass-midnight`), gold gradient text, sheen sweep, grain overlay, grid overlay,
  shimmer divider, midnight grounds, reduced-motion net.
- `next.config.mjs`: AVIF/WebP, remote patterns, 301 redirects for all 10 legacy `.html`
  URLs.

### Added — Data layer (typed, zero `any`)
- `lib/types.ts` — every model: `TrackId`, `Track`, `InternshipApplication`, `Booking`,
  `Availability`, `BlogPost`, `Project`, `Testimonial`, `Service`, `TeamMember`.
- `lib/data/tracks.ts` — **all 10 internship tracks** with exact screening questions,
  plus `TRACK_NAME_TO_ID` for resolving legacy documents.
- `lib/data/projects.ts` — all 16 projects ported verbatim from `work.html`.
- `lib/data/testimonials.ts` — all 10 testimonials, copy unchanged, highlights preserved.
- `lib/data/services.ts` — 6 services, 4 process steps, stats, marquee, values, CTA metrics.
- `lib/data/team.ts` — 2 members + site constants.
- `lib/firebase.ts` — modular v10, lazy singletons, `COLLECTIONS` map. Schema unchanged.
- `lib/internship.ts` — hiring state, application submit, waitlist, admin queries.

### Added — Components
- Liquid navbar, footer with procedural storm, custom cursor, scroll-to-top,
  cookie consent, Lenis provider (with route-change reset).
- Motion: `Reveal` / `RevealGroup` / `RevealItem`, `Magnetic`, `Counter`.
- Home: hero (monogram + particles), marquee, stats, bento services, process
  (self-drawing timeline), featured work, testimonial carousel, CTA.
- Internship: 3-step form with per-step validation, 10-track selector with animated
  screening question, review summary, success state, waitlist fallback.

### Added — Assets
- 37 files copied into `public/images/` with corrected names and extensions.
- **13 mislabelled files fixed**: files named `.svg` that were actually PNG/JPEG
  binaries are renamed to their true format (plan §3.1) — this is why they were
  unusable and unused on the legacy site.
- New imagery wired in: gold lightning (footer), AI automation + laptop (services),
  cloud-ops / dev-ops / data-science / AI (internship tracks).
- Google Search Console verification token preserved at `public/`.

### Fixed — carried over from the audit
- §4.1 Scroll reveals now actually run (legacy `animations.js` 404'd on 7 of 8 pages).
- §4.3 One gold site-wide; `#f8c03e` eliminated.
- §4.4 Hero mobile ordering works (legacy `.hero-right` rule targeted a class that
  did not exist).
- §4.8 Duplicated hero CSS collapsed to one source.
- §4.10 Cursor can no longer disappear on JS failure.
- §4.11 Single magnetic-button implementation instead of two fighting each other.
- §3.3 Local project thumbnails used; thum.io is now fallback-only.
- O3 devicon CDN dependency removed — local tool-stack assets.

### Changed — dependencies
- `@react-three/fiber` 8 → **9**, `@react-three/drei` 9 → **10** (React 19 JSX namespace).
- `framer-motion` 11 → **12** (React 19 types).

### Verified
- `tsc --noEmit` — clean, no errors.
- `next build` — succeeds. `/` 186 kB first load, `/internship` 278 kB.
  Three.js correctly code-split out of the initial bundle.

---

## Status

| Phase | Scope | State |
|:--:|---|:--:|
| 0 | Scaffold, tokens, images | ✅ Done |
| 1 | Motion primitives, capability hook | ✅ Done |
| 2 | Liquid nav, footer + storm, cursor, Lenis, chrome | ✅ Done |
| 3 | Home page — all sections | ✅ Done |
| 6 | `/internship` — 10 tracks, 3-step form, waitlist | ✅ Done |
| 4 | `/work` — 16 cards, filters, carousel | ✅ Done |
| — | Routing spine, 404/error, sitemap, robots, route guard | ✅ Done |
| — | Speed pass + 128px responsive floor | ✅ Done |
| 5 | `/about`, `/blog` + `[slug]`, `/contact` + booking | ✅ Done |
| 8 | Legal pages (`/privacy`, `/terms`, `/legal`) | ✅ Done |
| 7 | `/admin` — 6 routes, full CMS rebuild | ✅ Done |
| 9 | Mobile audit matrix, a11y pass | ✅ Done |

Run `npm run check` (typecheck + route guard) before any commit. Both are green:
every route in the manifest has a page, and every page is accounted for.

For the responsive matrix, build and serve first, then point the audit at it:

```bash
npm run build && npm run start -- -p 3000
# Warm every route first — a cold server can exceed the navigation timeout
# and report a spurious failure on the first hit of a page.
for r in / /work /about /blog /contact /internship /privacy /terms /legal; do
  curl -s -o /dev/null "http://localhost:3000$r"
done
npm run audit:responsive http://localhost:3000
```

It exits non-zero on any horizontal overflow, bad HTTP status, or empty render.
**Do not trust a green run against a server you have not confirmed is serving
200s** — the audit asserts this itself, but the reason it does is that an
earlier version reported a perfect pass against a build returning 500s.

See `../docs/Migration Plan.md` for the full specification.
