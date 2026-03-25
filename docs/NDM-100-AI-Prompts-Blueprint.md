# 🏛️ NDM Student Movement — 100 AI Prompts Blueprint
> **Project:** NDM Student Movement Website  
> **Stack:** React + Tailwind CSS + JavaScript  
> **Purpose:** Complete development guide using AI-assisted code generation  
> **Color Theme:** Deep Green `#006A4E` | White `#FFFFFF` | Red `#DC143C`

---

## 📁 TABLE OF CONTENTS

1. [Project Setup & Architecture](#1-project-setup--architecture) — Prompts 1–10
2. [Global Styles & Design System](#2-global-styles--design-system) — Prompts 11–20
3. [Navigation & Layout](#3-navigation--layout) — Prompts 21–30
4. [Home Page Sections](#4-home-page-sections) — Prompts 31–45
5. [About, Leadership & Activities](#5-about-leadership--activities) — Prompts 46–60
6. [News, Gallery & Join Us](#6-news-gallery--join-us) — Prompts 61–72
7. [Contact, Footer & Utilities](#7-contact-footer--utilities) — Prompts 73–82
8. [Performance & Accessibility](#8-performance--accessibility) — Prompts 83–90
9. [SEO & Analytics](#9-seo--analytics) — Prompts 91–95
10. [Testing & Deployment](#10-testing--deployment) — Prompts 96–100

---

## 1. Project Setup & Architecture

### Prompt 1 — Vite + React + Tailwind Bootstrap
```
Create a new React project using Vite with Tailwind CSS v3, React Router v6, and Framer Motion pre-installed. Configure the tailwind.config.js to include a custom color palette:
- primary: { DEFAULT: '#006A4E', dark: '#004d38', light: '#00835f' }
- accent: { DEFAULT: '#DC143C', dark: '#b01030' }
- gold: '#F0C040'
Output the full vite.config.js, tailwind.config.js, postcss.config.js, index.html, and src/main.jsx files.
```

### Prompt 2 — Folder Structure
```
Design a scalable React project folder structure for a multi-page organization website called "NDM Student Movement". Include folders for: components/, pages/, hooks/, context/, data/, assets/, utils/, and styles/. For each folder, list the files it should contain with a one-line description. Output as a clean directory tree.
```

### Prompt 3 — React Router Setup
```
Build a complete React Router v6 setup for an 8-page website. Pages: Home, About, Leadership, Activities, News, Gallery, JoinUs, Contact. Use createBrowserRouter with a root Layout component that includes a Navbar and Footer. Add scroll-to-top behavior on route change. Use lazy loading with React.lazy and Suspense for all page components.
```

### Prompt 4 — Global Context (Dark Mode + Auth)
```
Create a React Context called AppContext that manages:
1. darkMode (boolean) with toggle function + localStorage persistence
2. mobileMenuOpen (boolean) with toggle function
3. currentPage (string) synced with React Router location
4. isLoading (boolean) for page transitions

Use useReducer internally. Export a useApp() hook. Show the provider wrapping in main.jsx.
```

### Prompt 5 — Theme Constants File
```
Create a src/constants/theme.js file for the NDM Student Movement project. Export:
- COLORS object with all brand colors as hex values
- FONTS with display ('Playfair Display') and body ('DM Sans') options
- BREAKPOINTS as px values (sm, md, lg, xl)
- SPACING scale (xs through 2xl)
- TRANSITIONS object with duration + easing presets (fast, normal, slow, bounce)
- SHADOWS (sm, md, lg, xl) using green-tinted box-shadow values
```

### Prompt 6 — Data Layer
```
Create a src/data/index.js file that exports mock data arrays for:
1. navLinks — label, href, icon (emoji), hasDropdown
2. stats — value (number), label, suffix, icon
3. leaders — name, role, image, bio, social links (fb, tw, li)
4. activities — title, icon, description, date, frequency, color
5. newsArticles — id, title, excerpt, date, tag, image, author, readTime
6. galleryImages — id, src, caption, category
7. districts — 64 Bangladesh districts as array
8. footerLinks — grouped by category

Use realistic Bangladesh-specific content.
```

### Prompt 7 — Custom Hooks Collection
```
Create a src/hooks/index.js file exporting these custom React hooks:
1. useScrollY() — returns current scroll position
2. useInView(ref, threshold) — returns boolean when element enters viewport
3. useCounter(target, duration, trigger) — animated number counter
4. useDebounce(value, delay) — debounced value
5. useLocalStorage(key, defaultValue) — persisted state
6. useMediaQuery(query) — responsive breakpoint detection
7. useLockBodyScroll() — prevent scroll when modal open
8. useScrollAnimation() — applies fade-up class to .fade-up elements

Each hook should be properly typed with JSDoc comments.
```

### Prompt 8 — Environment Config
```
Set up environment variable configuration for the NDM project. Create:
1. .env.local with variables: VITE_API_URL, VITE_GOOGLE_MAPS_KEY, VITE_GA_TRACKING_ID, VITE_FORMSPREE_ID
2. src/config/env.js that reads and validates these variables with fallbacks
3. .env.example file for documentation
4. .gitignore that properly excludes .env files
Show how to use config values safely in a component.
```

### Prompt 9 — API Service Layer
```
Create a src/services/api.js module for the NDM Student Movement website. Include:
1. submitJoinForm(data) — POST to Formspree
2. submitContactForm(data) — POST to contact endpoint
3. subscribeNewsletter(email) — POST to newsletter service
4. fetchNews() — GET latest news (mock with realistic delay)
5. fetchGallery() — GET gallery images

Each function should handle loading states, error states, and return { data, error, loading }. Use fetch API with proper headers and error handling.
```

### Prompt 10 — Animation Configuration
```
Set up a Framer Motion animation configuration file for the NDM website at src/config/animations.js. Define and export:
1. fadeUp — fade in from below
2. fadeIn — simple opacity fade
3. slideInLeft / slideInRight
4. staggerContainer — parent container for staggered children
5. staggerItem — child for stagger effect
6. scaleOnHover — hover scale + shadow
7. pageTransition — page enter/exit animation
8. counterAnimation — number count-up spring
9. navbarReveal — navbar entry on mount

Use Framer Motion v10 syntax with proper TypeScript-friendly structure.
```

---

## 2. Global Styles & Design System

### Prompt 11 — CSS Variables & Reset
```
Write a comprehensive src/styles/globals.css file for the NDM Student Movement website. Include:
1. :root CSS custom properties for all colors, fonts, spacing, shadows, border-radius
2. Dark mode variables under body.dark { ... }
3. CSS reset (modern, Tailwind-compatible)
4. Base typography styles (h1–h6, p, a, lists)
5. Custom scrollbar styling (thin, green-themed)
6. Smooth scroll behavior
7. Selection color overrides (green highlight)
8. Print styles
9. High contrast media query support
```

### Prompt 12 — Typography System
```
Design a complete typography system for the NDM Student Movement website using:
- Display font: 'Playfair Display' (700, 900)
- Body font: 'DM Sans' (300, 400, 500, 600, 700)
- Optional mono: 'JetBrains Mono' for code elements

Create:
1. Google Fonts import string
2. Typography CSS classes (.text-display-xl through .text-body-sm)
3. Responsive fluid font sizes using clamp()
4. Line-height and letter-spacing scale
5. Tailwind extend config for custom fontFamily
Output as ready-to-use CSS + tailwind.config snippet.
```

### Prompt 13 — Button Component System
```
Build a reusable Button component in React for the NDM Student Movement site. Create variants:
1. primary (green background)
2. danger (red background)
3. outline-green
4. outline-red
5. ghost (transparent)
6. gold (CTA variant)

Props: variant, size (sm|md|lg), leftIcon, rightIcon, loading (shows spinner), disabled, fullWidth, as (renders as <a> when href provided).

Use Tailwind classes + Framer Motion for hover/tap animations. Include proper ARIA attributes.
```

### Prompt 14 — Card Component Library
```
Create a reusable Card component library for the NDM website. Build these variants as sub-components:
1. Card.Base — wrapper with shadow, border-radius, hover lift
2. Card.News — image top, tag badge, date, title, excerpt, read more
3. Card.Leader — profile photo, name, role, social icons, bio tooltip
4. Card.Activity — icon, title, badge, description, date
5. Card.Stat — animated number, label, icon
6. Card.Gallery — image with overlay and zoom icon

Each should accept className for extension. Use forwardRef where appropriate.
```

### Prompt 15 — Badge & Tag Components
```
Create a Badge component and Tag component for the NDM Student Movement site.

Badge props: variant (success|danger|warning|info|default), size, dot (animated pulse dot), outline
Tag props: color (custom hex), closable (with onClose), icon

Add these badge variants with Bangladesh-themed colors:
- "Live Event" — red with pulse
- "Achievement" — gold
- "Campaign" — green
- "Breaking" — red, bold

Use Tailwind + smooth transitions. Include keyboard accessibility for closable tags.
```

### Prompt 16 — Icon System
```
Set up a consistent icon system for the NDM Student Movement website. 
1. Install and configure react-icons (choose specific packs: fi for Feather, bi for BoxIcons, hi for Heroicons)
2. Create src/components/ui/Icon.jsx wrapper with size prop (xs, sm, md, lg, xl), color prop, aria-hidden default
3. Create an icons constants file mapping semantic names to icon components:
   - nav: home, about, leadership, activities, news, gallery, join, contact
   - social: facebook, twitter, youtube, instagram, linkedin
   - ui: menu, close, arrow, check, alert, search, phone, email, location, calendar

Show usage examples.
```

### Prompt 17 — Loading States
```
Create a comprehensive Loading component system for the NDM site:
1. PageLoader — full screen with NDM logo + spinning ring + progress bar
2. Skeleton — animated shimmer skeleton for cards, text, images
3. ButtonSpinner — inline spinner for form submit buttons
4. ContentPlaceholder — configurable skeleton grid for news/gallery sections
5. ProgressBar — top-of-page navigation progress indicator

All should respect prefers-reduced-motion. Use CSS animations (no JS required for basic states). Style with green/red brand colors.
```

### Prompt 18 — Toast Notification System
```
Build a Toast notification system for the NDM website:
1. ToastContext with useToast() hook
2. Methods: toast.success(msg), toast.error(msg), toast.info(msg), toast.warning(msg)
3. Toast container (fixed, top-right)
4. Individual Toast component with: icon, message, auto-dismiss (5s), manual close, progress bar
5. Max 4 toasts visible, stack with animation

Use Framer Motion for slide-in/out. Accessible with role="alert" and aria-live="polite". Show the form submission flow using toasts.
```

### Prompt 19 — Modal System
```
Create a reusable Modal component for the NDM website that supports:
1. Standard modal (title, content, footer with buttons)
2. Image modal (lightbox variant)
3. Confirmation modal (with danger variant)
4. Full-screen mobile modal

Features: backdrop blur, scroll lock, ESC key close, focus trap, smooth animation with Framer Motion, stacked modal support.

Include useModal() hook with open/close/toggle functions. Show example: gallery lightbox and delete confirmation.
```

### Prompt 20 — Form Component Library
```
Build a Form component library for the NDM Student Movement join/contact forms:
1. Input — text, email, tel, password with label, error, icon, helper text
2. Select — custom-styled dropdown with options
3. Textarea — auto-resize with character count
4. Checkbox — custom styled with label
5. RadioGroup — with horizontal/vertical layout
6. FormGroup — label + input + error wrapper
7. FieldError — animated error message
8. SubmitButton — loading + success states

All components use react-hook-form integration. Show district selection as example.
```

---

## 3. Navigation & Layout

### Prompt 21 — Sticky Navbar Component
```
Build a professional sticky Navbar for the NDM Student Movement website with:
1. Logo (NDM monogram + full name)
2. Desktop nav links with animated underline on hover
3. "Join Us" CTA button (red)
4. Dark mode toggle (moon/sun icon)
5. Background transition: transparent → glass blur on scroll
6. Top announcement bar (red) dismissible
7. Smooth hide-on-scroll-down, show-on-scroll-up behavior
8. Active link highlighting based on scroll position (Intersection Observer)
9. Mobile hamburger → full-screen overlay menu

Use Framer Motion. Full ARIA support. Green/white/red color scheme.
```

### Prompt 22 — Mobile Navigation Overlay
```
Create a full-featured mobile navigation overlay for the NDM site that:
1. Slides in from the right (Framer Motion)
2. Shows logo at top + close button
3. Animated nav links with stagger (each item fades in)
4. Social media icons row
5. Join Us + Contact buttons at bottom
6. Handles nested dropdown menus with expand/collapse
7. Locks body scroll when open
8. Closes on backdrop click or ESC key
9. Shows current active page indicator

Use green gradient background with white text. Accessible focus management.
```

### Prompt 23 — Breadcrumb Component
```
Create a Breadcrumb component for the NDM site that:
1. Auto-generates from React Router location
2. Supports custom label overrides via props
3. Shows Home icon for root
4. Truncates long paths on mobile
5. Uses structured data (JSON-LD BreadcrumbList schema)
6. Animated separator (→ in brand green)
7. Last item is current page (non-clickable, bold)

Style with subtle gray background strip, Tailwind classes. Show usage in About and News detail pages.
```

### Prompt 24 — Root Layout Component
```
Build the root Layout component for the NDM Student Movement site that:
1. Wraps all pages with Navbar + Footer
2. Manages page transition animation (Framer Motion AnimatePresence)
3. Includes a back-to-top button (appears after 400px scroll)
4. Handles scroll position restoration on navigation
5. Injects page-specific meta tags via React Helmet
6. Shows page loading progress bar (NProgress style)
7. Contains skip-to-main-content accessibility link

Show integration with React Router Outlet. Include the back-to-top button with smooth animation.
```

### Prompt 25 — Dropdown Menu Component
```
Create an accessible dropdown menu component for the NDM navbar. Requirements:
1. Trigger: hover on desktop, click on mobile
2. Animated dropdown panel (scale + fade with Framer Motion)
3. Support nested menu items with icons and descriptions
4. Keyboard navigation (arrow keys, Enter, Escape)
5. Click outside to close
6. Green top border accent, white background, shadow

Example dropdowns:
- "About" → Organization, History, Vision & Mission, Leadership
- "Programs" → All Activities, Events, Campaigns, Scholarships

Full WAI-ARIA menu pattern compliance.
```

### Prompt 26 — Footer Component
```
Build a comprehensive Footer for the NDM Student Movement website with:
1. Newsletter signup bar (full-width, green background) with email input + subscribe button + success state
2. Main footer grid (4 columns): Brand info + logo, Quick Links, Programs, Contact
3. Social media icons with hover color effects (Facebook→blue, Twitter→cyan, YouTube→red, Instagram→pink)
4. Bottom bar: copyright, legal links, Bangladesh flag emoji
5. Dark footer background (#1a2e28) with proper contrast
6. Responsive: 4 cols → 2 cols → 1 col
7. Animated footer links (slide on hover)

Include real Bangladesh contact details format.
```

### Prompt 27 — Scroll Progress Indicator
```
Create a scroll progress indicator for the NDM website:
1. Thin bar at the very top of the viewport (position: fixed, top: 0, z-index: 9999)
2. Width transitions from 0% to 100% as user scrolls the page
3. Color: linear-gradient from green (#006A4E) to red (#DC143C)
4. Smooth transition (no jitter)
5. Only visible on article/detail pages (not homepage)
6. 3px height, no border-radius

Use requestAnimationFrame for performance. Include a useScrollProgress hook that returns 0–100 value.
```

### Prompt 28 — Sidebar Component (Mobile Drawer)
```
Build a reusable Drawer/Sidebar component for the NDM site that can be used for:
1. Mobile navigation
2. Filter panel for Gallery page
3. News category sidebar

Props: side (left|right), width, overlay (boolean), persistent (boolean for desktop)
Features: Framer Motion slide animation, backdrop, swipe to close on mobile, keyboard accessible

Show it configured as both the mobile nav drawer and as a filter sidebar for gallery image categories (All, Events, Campaigns, Community).
```

### Prompt 29 — Pagination Component
```
Create a Pagination component for the NDM News/Blog page:
1. Previous / Next buttons with arrows
2. Page number pills (show 5 at a time with ellipsis)
3. Active page: green background, white text
4. Responsive: show fewer pages on mobile
5. URL-synced (updates ?page= query param)
6. Keyboard navigable
7. Shows "Showing X–Y of Z results" text

Include a usePagination hook that calculates page ranges. Show integration with a NewsPage component that filters articles by page.
```

### Prompt 30 — Scroll-Spy Navigation
```
Implement scroll-spy for the NDM single-page sections. Create a useScrollSpy hook that:
1. Tracks which section (home, about, leadership, activities, news, gallery, contact) is in view
2. Updates the active navbar link accordingly
3. Uses IntersectionObserver with 40% threshold
4. Debounces updates for performance
5. Returns activeSection string

Show how to:
1. Apply active styles to navbar links (red underline)
2. Use it in a floating section indicator (dots on the side) — optional progress dots showing which section user is on
```

---

## 4. Home Page Sections

### Prompt 31 — Hero Section
```
Build a stunning Hero section for the NDM Student Movement homepage:
1. Full-viewport height
2. Background: dark overlay gradient on a high-quality background image (youth/leadership theme)
3. Animated badge: pulsing red dot + "NATIONAL DEMOCRATIC MOVEMENT" text
4. Headline: "Empowering Future Leaders of Bangladesh" — 'Playfair Display', bold, with "Future Leaders" in gold
5. Subheading: organization description
6. Two CTA buttons: "🔥 Join the Movement" (red) and "Learn More →" (glass)
7. Three quick stats below (50K+ Members, 64 Districts, 18 Years)
8. Scroll indicator arrow at bottom

Use Framer Motion stagger animations. Mobile-first. WCAG AA contrast.
```

### Prompt 32 — News Ticker / Announcement Bar
```
Build a live news ticker for the NDM website (below the navbar):
1. Dark green background (#004d38)
2. Left side: "BREAKING" label in red box
3. Right: marquee-style scrolling text with news items
4. Items: upcoming events, achievements, announcements
5. Pause on hover
6. Smooth infinite loop (CSS animation, no JS library)
7. Each item separated by red dot
8. Font: 'DM Sans' 0.82rem, white text

Make it accessible: aria-live="polite", role="marquee". Provide the CSS @keyframes ticker animation.
```

### Prompt 33 — Animated Stats Counter
```
Create an animated statistics counter section for the NDM homepage with 4 stats:
- 50,000+ Active Members
- 64 Districts Covered  
- 1,200+ Programs Run
- 18 Years of Service

Features:
1. Count-up animation triggered by IntersectionObserver (starts when visible)
2. Each stat: large number (Playfair Display), label, subtle icon
3. Dividers between stats on desktop
4. Smooth easing (ease-out-expo) for the counter
5. Background: slightly tinted off-white strip with top/bottom green border
6. Mobile: 2x2 grid

Use requestAnimationFrame for smooth animation. Include the useCounter hook.
```

### Prompt 34 — Featured Programs Grid
```
Create a "Featured Programs" section for the NDM homepage. Design:
1. Section heading with red label + green title
2. 3-column card grid (→ 1 col mobile):
   - Card has: emoji icon, program name, short description, frequency badge, "Learn More" link
   - Hover: lift + green top border appears
   - Alternating red/green top border color
3. "View All Programs →" button below grid
4. Background: white

Programs to feature: Leadership Training, Digital Skills Lab, Green Campus Drive, Academic Support, Rights Awareness, Community Service.

Animate cards in with stagger using Intersection Observer.
```

### Prompt 35 — Latest News Preview
```
Build a "Latest News" section for the NDM homepage showing 3 news cards:
1. Section heading with link to full news page
2. Horizontal card: image left, content right (on desktop)
3. Card content: colored tag badge (Event/Achievement/Campaign), date, headline, excerpt, "Read more →"
4. Image: hover zoom effect (overflow:hidden + scale transform)
5. Featured article (first): larger card spanning full width
6. Mobile: stacked cards

Animate with fade-up on scroll. Lazy-load images. Include placeholder skeleton while loading.
```

### Prompt 36 — Mission Banner
```
Create an impactful full-width "Mission Banner" section for the NDM homepage between stats and programs:
1. Background: deep green (#004d38) with subtle pattern overlay (diagonal lines or dots)
2. Large centered quote: "Together We Build a Democratic Bangladesh" — Playfair Display, white, 2.8rem
3. Red underline decorative element below quote
4. Two columns below quote: Vision statement | Mission statement
5. Subtle animated red-to-green gradient line as divider
6. CTA row: "Learn About NDM" (outline white) + "See Our Impact" (red solid)

Full-width, padding 5rem vertical. Animate quote in with fade + scale.
```

### Prompt 37 — Testimonials / Voices Section
```
Build a "Member Voices" testimonials section for NDM:
1. Auto-rotating carousel (every 5 seconds)
2. Each testimonial: avatar, name, role/university, quote text, location badge
3. Navigation: dot indicators + prev/next arrows
4. Pause on hover or focus
5. Mobile: single card, swipe-able
6. Design: off-white background, green quote marks (large, decorative), italic text

Create 6 testimonial entries with realistic Bengali names, universities (DU, BUET, RU, CU), and inspiring quotes about how NDM helped them grow.

Include keyboard navigation and ARIA for the carousel.
```

### Prompt 38 — CTA Join Section (Homepage)
```
Create a high-conversion "Call to Action" join section for the NDM homepage:
1. Two-column layout: left = compelling text, right = mini signup form
2. Left: bold headline "Be Part of the Change", subtext, 3 bullet benefits (✅)
3. Right: compact form with Name, Email, District dropdown, Submit button
4. Form success state: animated checkmark + thank you message
5. Background: dark green with subtle radial gradient
6. Decorative: faint map of Bangladesh outline in background (SVG)

Use react-hook-form for validation. Form submits to Formspree. Include error states for each field.
```

### Prompt 39 — Partners / Supporters Strip
```
Create a "Trusted Partners & Supporters" logo strip for the NDM homepage:
1. Subtle heading: "Our Partners & Supporters"
2. Horizontally scrolling logo strip (CSS marquee animation, pause on hover)
3. 8 partner logos (use placeholder rectangles with org names)
4. Grayscale logos that become full-color on hover
5. Smooth infinite scroll loop
6. Light gray background, subtle top/bottom border

Partner names: Ministry of Education, UNDP Bangladesh, British Council, BGMEA, A2i, BASIS, University Grants Commission, Dhaka University.
```

### Prompt 40 — District Map Section
```
Create a "We Cover All 64 Districts" section for the NDM homepage:
1. Heading + counter: "Active in 64 Districts"
2. Simple Bangladesh district visualization using SVG or a CSS grid of district badges
3. Filter tabs: All | Dhaka Division | Chittagong | Sylhet | Rajshahi | Khulna | Barisal | Rangpur | Mymensingh
4. Each district as a pill badge: green if active, gray if not, tooltip with member count
5. "Find Your District Unit →" CTA
6. Alternative: show a table/grid of districts with member counts

Use useFilter hook to handle tab filtering. Animate badges on tab switch.
```

### Prompt 41 — Video Section
```
Create a "Watch Our Story" video section for the NDM homepage:
1. Full-width section with dark green background
2. Centered thumbnail with play button overlay (large red play circle)
3. Click opens video in modal/lightbox
4. Support YouTube embed URL
5. Modal: backdrop blur, video iframe, close button
6. Caption: "NDM in Action — Watch the Documentary"
7. Below video: 3 quick achievement highlights (icon + text)

Handle: scroll lock on modal open, ESC to close, pause video on close. Show the custom play button CSS animation (pulsing ring).
```

### Prompt 42 — Event Countdown Timer
```
Build an "Upcoming Event" countdown timer component for the NDM homepage:
1. Target: "NDM National Convention 2026" — Date: April 25, 2026
2. Shows: Days, Hours, Minutes, Seconds remaining (updates every second)
3. Each unit: large number + label in separate box
4. Design: red background cards with white numbers (Playfair Display)
5. When event passes: shows "Thank you for joining us!"
6. Includes event details: date, venue (Dhaka), registration link
7. Animated flip effect on number change (CSS)

Use useEffect with setInterval. Clean up on unmount. Mobile: 2x2 grid of time units.
```

### Prompt 43 — Impact Timeline
```
Create an "Our Journey" timeline section for the NDM homepage/about page:
Year-by-year milestones from 2007 to 2026:
- 2007: Founded at Dhaka University
- 2009: Expanded to 10 districts
- 2012: First national convention
- 2015: 10,000 members milestone
- 2018: Digital Skills Lab launched
- 2020: COVID relief — 50,000 families helped
- 2022: 50,000 member milestone
- 2024: All 64 districts covered
- 2026: National convention with 15,000 attendees

Design: vertical timeline with alternating left/right cards on desktop, single column on mobile. Year in green circle. Animate each item as user scrolls.
```

### Prompt 44 — Social Feed / Highlights Strip
```
Create a Social Media Highlights strip for the NDM homepage:
1. Heading: "Follow Us on Social Media"
2. 4 image cards in a row (simulated Instagram posts)
3. Each card: square image, hover overlay with like count + comment count
4. Click opens link to actual Instagram/Facebook
5. Below: 4 social stat boxes (Facebook Followers, Twitter Followers, YouTube Subscribers, Instagram Followers)
6. Instagram grid animation: staggered fade-in
7. "Follow @NDMBangladesh" CTA button (red)

Use realistic social stats: 125K FB, 48K Twitter, 32K YouTube, 67K Instagram.
```

### Prompt 45 — Quick Links Grid
```
Build a "Quick Access" section for the NDM homepage with 8 quick-link cards:
1. Join Us | 2. Find Branch | 3. Events | 4. Scholarships | 5. News | 6. Downloads | 7. Gallery | 8. Contact

Each card: icon (large emoji or react-icon), label, short description, colored hover background
Design: 4x2 grid on desktop, 2x4 on tablet, 2x4 on mobile
Hover: icon bounces, background fills with green, text turns white
Include keyboard navigation (tab through cards, Enter to activate)
Animation: stagger reveal on scroll
```

---

## 5. About, Leadership & Activities

### Prompt 46 — About Page Layout
```
Build the full About page for NDM Student Movement with these sections:
1. Page Hero: background image, "About NDM" heading, breadcrumb
2. Overview section: 2-column (image + text with Vision/Mission cards)
3. History section: timeline component
4. Values section: 6 core values as icon cards
5. Leadership message: quote with photo (President)
6. Call to action strip

Create the page as src/pages/About.jsx using all the sub-components already built. Use React Helmet for SEO meta tags. Animate sections with IntersectionObserver.
```

### Prompt 47 — Core Values Section
```
Design a "Our Core Values" section for the About page with 6 values:
1. Democracy — Equal voice for all
2. Integrity — Transparent in all actions
3. Excellence — Highest academic standards
4. Unity — Strength through solidarity
5. Service — Nation before self
6. Innovation — Modern solutions to old problems

Design: 3x2 grid of cards. Each card: colored gradient background (green shades), icon (emoji), value name, short description. Hover: scale + shadow. Mobile: 2 columns. Animate with Framer Motion stagger.
```

### Prompt 48 — Organization Structure Chart
```
Create an organizational structure/hierarchy chart for NDM using React and SVG or a CSS tree layout:

Levels:
- National President → General Secretary
- Vice Presidents (3) → Secretaries (6)
- Divisional Presidents (8 divisions) → District Presidents (64)

Design: clean org chart with green connecting lines, white boxes with names/roles, collapse/expand on click for divisions.
Alternative: use a simple indented list with toggle for mobile.

Add a legend explaining the hierarchy levels. Include print button.
```

### Prompt 49 — Leadership Page
```
Build the full Leadership page for NDM with:
1. Page hero: "Our Leadership" heading
2. Filter tabs: National | Divisional | District Level
3. Card grid: photo, name, role, division/district, short bio, social links
4. Featured leader banner (President) — full-width with large photo
5. Hover: flip card effect showing bio on back
6. Search input to filter leaders by name or role

Use LEADERS data array. Implement flip card with CSS transform-style: preserve-3d. Include skeleton loading states.
```

### Prompt 50 — Leader Profile Card (Flip Effect)
```
Create a Leader Profile Card component with CSS 3D flip animation:

Front face:
- Professional photo (full card height)
- Name overlay at bottom (dark gradient)
- Role badge

Back face (green background):
- Name + Role
- Short bio (2-3 lines)
- University/District
- Social links (Facebook, LinkedIn, Twitter)
- "View Profile" button

Props: name, role, image, bio, university, social, onClick

Animation: smooth 0.6s flip on hover. Touch-friendly (tap to flip on mobile). Keyboard accessible (Enter/Space to flip).
```

### Prompt 51 — Activities Page Layout
```
Build the Activities/Programs page for NDM with:
1. Page hero section
2. Category filter tabs: All | Education | Environment | Rights | Technology | Community
3. Activity cards grid (filtered by category)
4. Featured campaign banner (full-width, current campaign)
5. Upcoming events list (date, title, location, register button)
6. Past activities timeline

Implement the category filter with smooth transition (fade cards in/out). Include URL query param sync (?category=education). Mobile-first responsive.
```

### Prompt 52 — Event Card Component
```
Create an Event Card component for the NDM Activities page:

Props: title, date, time, location, category, image, registrationUrl, isPast, attendees

Design:
- Image header with category badge overlay
- Date badge (red box: day + month abbreviation)
- Title, location (📍), time (🕐)
- Attendees count with avatar stack (3 faces + "+X more")
- Registration button: "Register Now" (active) or "View Recap" (past)
- Hover: lift + shadow + image zoom

States: upcoming (green border), ongoing (red badge "LIVE"), past (grayscale)

Include countdown timer for upcoming events.
```

### Prompt 53 — Campaign Detail Page
```
Build a Campaign Detail page for NDM (e.g., "Green Bangladesh Campaign"):
1. Hero: full-width campaign image + overlay text + "Current Campaign" badge
2. Campaign stats bar: Trees Planted, Campuses Covered, Volunteers, Days Remaining
3. Campaign description with rich text
4. Progress tracker: "Goal: 10,000 trees | Achieved: 7,234" — animated progress bar
5. How to participate: 3-step guide
6. Photo gallery: recent activities
7. Share buttons: Facebook, Twitter, WhatsApp
8. Volunteer signup form (name, phone, district, date available)
```

### Prompt 54 — History Timeline Component
```
Create a detailed History Timeline component for the NDM About page:

Style: Vertical timeline, alternating left/right on desktop, single-side on mobile
Line: thin vertical green line, year nodes as green circles

Each node has:
- Year (green circle)
- Decade/era label (e.g., "Founding Era")
- Event title (bold)
- 2-3 line description
- Optional image thumbnail (hover to zoom)

NDM milestones from 2007–2026. Add a "Current Year" blinking indicator at the bottom. Animate each item as it enters viewport (slide in from alternating sides).
```

### Prompt 55 — Awards & Recognition Section
```
Create an "Awards & Recognition" section for the NDM About page:
1. Heading: "Recognition We've Earned"
2. Trophy card grid (3 columns):
   - Trophy emoji/icon
   - Award name
   - Awarding organization
   - Year
   - Short description

Awards to include:
- Best Student Organization 2023 (University Grants Commission)
- National Youth Service Award 2022 (Ministry of Youth)
- Green Champion Award 2021 (Environment Ministry)
- Digital Innovation Award 2024 (BASIS)
- Community Service Excellence 2020 (UNDP Bangladesh)

Design: gold/green color scheme, subtle shimmer on trophy icon.
```

### Prompt 56 — Scholarship Program Section
```
Build a "Scholarship Programs" section for the Activities page:
1. Hero strip: "NDM Academic Excellence Scholarships"
2. Three scholarship tiers:
   - Full Scholarship (৳50,000/year) — for top 10 students
   - Merit Scholarship (৳25,000/year) — for top 50 students  
   - Need-Based Grant (৳15,000/year) — for 200 students
3. Eligibility criteria list
4. Application process: 4-step visual guide
5. Application deadline countdown
6. "Apply Now" form or redirect link
7. Past recipients testimonials (3 cards)

Use Bangladeshi Taka (৳) symbol. Include last date urgency indicator.
```

### Prompt 57 — Volunteer Registration System
```
Create a Volunteer Registration feature for NDM Activities:
1. Multi-step form (3 steps):
   - Step 1: Personal info (name, age, university, district)
   - Step 2: Areas of interest (checkbox: Education, Environment, Technology, etc.)
   - Step 3: Availability (days of week, hours per week, transport)
2. Progress bar between steps
3. Step validation before advancing
4. Final review screen before submit
5. Success screen with volunteer ID generation

Use react-hook-form with Zod validation. Store progress in localStorage (resume if tab closed). Mobile-friendly step layout.
```

### Prompt 58 — Activities Search & Filter
```
Implement a search and filter system for the NDM Activities page:
1. Search bar: full-text search across title + description
2. Category filter: pill buttons (All, Education, Environment, Technology, Rights, Community)
3. Date filter: dropdown (All Time, This Month, This Year, Past Events)
4. Sort: Most Recent, Oldest, A-Z
5. Results count: "Showing 12 of 34 activities"
6. No results state: illustration + "No activities found" + reset button

Implement with useReducer for filter state. Debounce search input (300ms). Animate result changes with Framer Motion layout transitions.
```

### Prompt 59 — Downloadable Resources Page
```
Create a "Downloads & Resources" section for the NDM website:
1. Category tabs: Forms | Publications | Reports | Media Kit | Press Releases
2. Resource cards: PDF icon, document name, date, file size, download button
3. Membership form (PDF download)
4. Annual report 2025 (PDF)
5. NDM logo pack (ZIP)
6. Press kit (PDF)
7. Policy documents

Design: clean list view with hover highlight. Include file type badges (PDF, ZIP, DOCX). Track download count (display only, no backend needed). Simulate download with a notification toast.
```

### Prompt 60 — Leaders' Blog / Thought Leadership
```
Create a "From Our Leaders" thought leadership blog section for NDM:
1. Featured article: large card with author photo, headline, excerpt (President's message)
2. Grid of 4 secondary articles: smaller cards with author avatar, role badge, date, 2-line excerpt
3. Category filter: Leadership | Policy | Youth | Environment | Technology
4. "Subscribe to Leaders' Insights" email widget
5. Social share on each article

Design: editorial magazine layout. Author avatar + role badge prominent. Green serif typography for article titles. Include a ReadingTime component (calculated from word count).
```

---

## 6. News, Gallery & Join Us

### Prompt 61 — News / Blog Page
```
Build the full News/Blog page for NDM:
1. Page hero
2. Featured article (top): full-width card with large image
3. Main grid: 3-column article cards
4. Sidebar (desktop): Categories, Recent Posts, Tags, Newsletter widget
5. Pagination: load more button (infinite scroll or traditional)
6. Filter: All | Events | Achievements | Campaigns | Press Releases

Implement with mock data (9+ articles). Include reading time estimate. Lazy-load images. SEO: each card links to /news/:slug route.
```

### Prompt 62 — Article Detail Page
```
Create a News Article Detail page for NDM:
1. Article hero: full-width image + headline overlay
2. Author info bar: avatar, name, role, date published, reading time
3. Article body: rich text with green headings, pull quotes (red left border), inline images
4. Share bar: sticky on desktop (fixed left), inline on mobile (Facebook, Twitter, WhatsApp, Copy Link)
5. Tags: clickable tag pills
6. Related articles: 3-card grid at bottom
7. Comment section placeholder (UI only)
8. Breadcrumb: Home > News > Article Title

Add JSON-LD Article schema for SEO.
```

### Prompt 63 — Gallery Page with Filtering
```
Build the Gallery page for NDM with:
1. Page hero
2. Filter tabs: All | Events | Campaigns | Leadership | Community | Awards
3. Masonry image grid (CSS columns or Masonry.js)
4. Each image: caption overlay on hover, category badge
5. Lightbox: full-screen view, prev/next navigation, swipe on mobile, keyboard arrows, download button
6. "Load More" button (shows 12 initially, loads 6 more)
7. Image count per category in tab badges

Use IntersectionObserver for lazy loading. Implement keyboard trap in lightbox. Include accessibility: role="dialog" aria-modal="true" for lightbox.
```

### Prompt 64 — Lightbox Component
```
Build a fully-featured Lightbox component for the NDM gallery:
Props: images (array of {src, caption, category}), initialIndex, onClose

Features:
1. Backdrop: rgba(0,0,0,0.92) blur
2. Full-size image display with object-fit contain
3. Caption bar at bottom
4. Prev/Next arrows (sides)
5. Thumbnail strip at bottom (scroll to current)
6. Keyboard: ← → to navigate, ESC to close
7. Touch: swipe left/right on mobile
8. Image counter: "5 / 24"
9. Download button
10. Loading spinner while image loads

Focus trap, body scroll lock, ARIA: role="dialog" aria-label="Image gallery".
```

### Prompt 65 — Join Us Page
```
Build the comprehensive "Join NDM" page with:
1. Hero: "Become Part of the Movement" — inspiring background, bold headline
2. Benefits section: 6 benefits of joining (leadership, network, training, scholarship access, recognition, impact)
3. Membership tiers:
   - General Member (free)
   - Active Member (free + participation requirement)
   - Executive Member (invitation only)
4. Registration form: multi-step or single (Name, Email, Phone, DOB, University, District, Level, Motivation)
5. FAQ accordion section (8 questions)
6. Testimonials strip (3 members)

Full form validation with react-hook-form + Zod. Success confirmation email mention.
```

### Prompt 66 — Multi-Step Join Form
```
Create a 4-step Join NDM registration form:

Step 1 — Personal Info: Full Name, Date of Birth, Gender, Phone, Email
Step 2 — Academic Info: University/College, Department, Year, Student ID
Step 3 — Location: Division, District, Upazila, Address
Step 4 — Motivation: Why join (textarea), Which programs interest you (multi-checkbox), How did you hear about NDM (select)

Features:
- Progress indicator (4 steps, filled circles)
- Form state preserved between steps
- Validation per step (can't advance if invalid)
- Review screen before submit
- Animated step transitions (slide left/right)
- Mobile-optimized input types (tel, email, date)
```

### Prompt 67 — FAQ Accordion Component
```
Create an FAQ Accordion component for the NDM Join page with these questions:
1. Who can join NDM Student Movement?
2. Is there any membership fee?
3. What are the benefits of joining?
4. How long does the application take to process?
5. Can I join if I'm not a university student?
6. Are there opportunities for leadership roles?
7. How do I find my district unit?
8. Can international students join?

Design: clean accordion with + → × icon rotation, smooth height animation, green border on open item, one item open at a time. ARIA: role="button" aria-expanded on triggers.
```

### Prompt 68 — Membership Benefits Section
```
Create a "Why Join NDM?" benefits section with visual design:
6 benefit cards in a 3x2 grid:
1. 🎓 Leadership Training — Free workshops quarterly
2. 🌐 National Network — Connect with 50,000+ members
3. 💰 Scholarship Access — Annual scholarships for active members
4. 📜 Certificate Programs — Recognized leadership certificates
5. 🗣️ Amplified Voice — Represent students at national forums
6. 🌿 Real Impact — Drive change in your community

Design: each card has large icon, title, description. Hover: green fill, white text. "Most Popular" badge on Leadership Training. Animate with stagger on scroll.
```

### Prompt 69 — Member Dashboard (UI Only)
```
Design a Member Dashboard UI (front-end only, no auth needed) for NDM members:
1. Sidebar: logo, nav (Dashboard, Profile, Events, Certificates, Messages, Settings)
2. Main content: Welcome header with member name + avatar
3. Stats row: Member ID, Membership Type, Events Attended, Certificates Earned
4. Upcoming events widget (next 3)
5. Recent activity feed
6. Announcements card
7. Quick actions: Register for event, Download Certificate, Update Profile

Use green sidebar (#004d38), white main area. Fully responsive. Mock with hardcoded sample data.
```

### Prompt 70 — Certificate Generator (UI)
```
Create a "Download Certificate" feature for NDM members (UI only):
1. Certificate preview: A4 landscape orientation
2. Design: NDM logo, Bangladesh flag colors border, participant name in Playfair Display, event name, date, President's digital signature, unique certificate ID
3. Two types: Participation Certificate, Leadership Excellence Certificate
4. "Download as PDF" button (use html2canvas + jsPDF)
5. "Share on LinkedIn" button (generates LinkedIn certification share URL)

Build the certificate as HTML/CSS that looks professional when printed/exported. Include a print stylesheet.
```

### Prompt 71 — Photo Upload Component
```
Create a Profile Photo Upload component for the NDM membership form:
1. Drag & drop zone with dashed border + upload icon
2. Click to browse files
3. Preview: shows selected image with crop overlay
4. Validation: max 2MB, JPEG/PNG only
5. Error states: file too large, wrong format
6. Basic crop UI: drag to reposition + zoom slider
7. Remove/change option after selection
8. Loading state during "upload"

Use the browser's FileReader API. No external libraries. Mobile: opens native camera/gallery. Show base64 preview.
```

### Prompt 72 — Referral System (UI)
```
Create a "Refer a Friend" UI for NDM members on the Join/Dashboard page:
1. Unique referral link display with copy button (+ toast "Copied!")
2. Social share: WhatsApp, Facebook, Twitter pre-filled message
3. Referral stats: Friends Referred (5), Friends Who Joined (3), Reward Points (150)
4. Referred friends list: avatar + name + status (Pending/Joined)
5. Reward tiers: 1 referral = 50 points, 5 = badge, 10 = T-shirt

Design: card-based, gamification feel. Progress bar toward next reward. Green checkmarks for joined, yellow for pending.
```

---

## 7. Contact, Footer & Utilities

### Prompt 73 — Contact Page
```
Build the full Contact page for NDM with:
1. Page hero: "Get In Touch" heading
2. Contact info cards: Address (📍), Phone (📞), Email (📧), Office Hours (🕐)
3. Google Maps embed (Dhaka, Bangladesh)
4. Contact form: Name, Email, Subject (select), Message, Submit
5. Response time notice: "We typically respond within 24 hours"
6. Social media links row
7. Download vCard button (NDM contact info)
8. "Find Your Local Branch" district search widget

Form connects to Formspree. Success/error toast notifications.
```

### Prompt 74 — Interactive Map Component
```
Create an interactive "Find Your Branch" map/search for the NDM contact page:
1. Search input: type district name → filters results
2. Division tabs: click to filter by division
3. Results list: District name, Branch address, Phone, President name, Status (Active/New)
4. Clicking a result: highlights it + scrolls to top of list
5. "Contact This Branch" button on each result
6. Google Maps iframe that updates to show selected district (approximate coordinates)

Data: include all 8 divisions with 2-3 districts each. Mobile: list view, no map iframe.
```

### Prompt 75 — Dark Mode Implementation
```
Implement a complete dark mode system for the NDM website:
1. Toggle button in navbar (moon/sun with smooth icon transition)
2. System preference detection (prefers-color-scheme: dark)
3. Persistence in localStorage
4. CSS custom properties approach (redefine --green, --bg, --text in body.dark)
5. Dark mode colors:
   - Background: #0a1a14
   - Surface: #0f2218
   - Border: #1e3d2d
   - Text: #e8f0ec
   - Subtext: #8aab9a
6. Transition: 0.3s ease on all color properties
7. Images: slight brightness reduction (filter: brightness(0.85))

Show the React context setup + the CSS custom properties approach.
```

### Prompt 76 — Search Functionality
```
Build a site-wide search feature for NDM:
1. Search icon in navbar → expands to search bar (Framer Motion)
2. Keyboard shortcut: Ctrl+K / Cmd+K to open
3. Real-time results as user types (debounced 200ms)
4. Searches across: News, Activities, Pages, Leaders
5. Results grouped by type with icons
6. Keyboard navigation of results (arrow keys)
7. "No results" state with suggestions
8. ESC to close
9. Recent searches (localStorage)

Implement as a command palette style overlay. Full ARIA combobox pattern.
```

### Prompt 77 — Cookie Consent Banner
```
Create a GDPR-compliant Cookie Consent banner for the NDM website:
1. Appears at bottom of screen on first visit
2. Message: brief explanation of cookie use
3. Buttons: "Accept All", "Reject All", "Customize"
4. Customize modal: toggle switches for Analytics, Marketing, Preferences
5. Persistence: store choice in localStorage for 365 days
6. If accepted: load Google Analytics
7. Link to Privacy Policy
8. Accessible: focus management, keyboard navigable

Design: dark green background, white text, matches brand. Slide up animation on appear.
```

### Prompt 78 — Print Styles
```
Create a comprehensive print stylesheet for the NDM website in src/styles/print.css:
1. Hide: navbar, footer, sidebars, CTAs, social buttons, animations
2. Show: main content, article body, contact info
3. Add NDM logo + "www.ndmstudent.org" header to every page
4. Page break rules (avoid breaking inside cards)
5. Black & white friendly (remove background colors, keep borders)
6. Font size adjustments for print
7. Show URL after links: a[href]::after { content: " (" attr(href) ")"; }
8. A4 page size optimization

Show @media print rules and explain how to import in main CSS.
```

### Prompt 79 — Error Pages
```
Create custom error pages for the NDM website:
1. 404 Not Found:
   - Illustration: lost student with NDM flag
   - "Page Not Found" heading
   - "The page you're looking for doesn't exist"
   - Back to Home button + Search bar
   - Related links (About, Join, Contact)
2. 500 Server Error:
   - Different illustration
   - "Something went wrong"
   - Retry button + Contact Us link
3. Offline page (PWA):
   - No connection illustration
   - "You're offline"
   - Show cached content if available

Use React Router's errorElement. Animate illustration with subtle float.
```

### Prompt 80 — Accessibility Enhancements
```
Implement comprehensive accessibility features for the NDM website:
1. Skip to main content link (visible on focus)
2. Focus indicators: visible 3px ring in green
3. All images: meaningful alt text
4. ARIA landmarks: header, nav, main, aside, footer
5. ARIA live regions for: form errors, toast messages, filter results
6. Keyboard-only navigation test: document tab order
7. Color contrast audit: ensure WCAG AA (4.5:1 for text)
8. Reduced motion: @media (prefers-reduced-motion: reduce) for all animations
9. Screen reader testing checklist

Output: accessibility checklist + code examples for each enhancement.
```

### Prompt 81 — Progressive Web App Setup
```
Convert the NDM website into a Progressive Web App (PWA):
1. public/manifest.json: name, short_name, icons (192 + 512), theme_color (#006A4E), background_color (#ffffff), display: standalone
2. Service Worker (sw.js): cache-first strategy for static assets, network-first for API calls
3. Offline fallback page
4. Install prompt: custom "Add to Home Screen" banner (after 30 seconds)
5. Register service worker in main.jsx
6. App icons: NDM logo in all required sizes

Use Vite PWA plugin (vite-plugin-pwa). Include the workbox configuration.
```

### Prompt 82 — Social Sharing Component
```
Create a reusable Social Sharing component for NDM news articles and events:
1. Share button: click → shows share modal or native share (Web Share API if available)
2. Platforms: Facebook, Twitter/X, WhatsApp, LinkedIn, Copy Link
3. Pre-filled messages: "[Article Title] — Read on NDM Student Movement: [URL]"
4. WhatsApp: opens native app with pre-filled message
5. Copy Link: clipboard API + success toast
6. Open Graph meta tags setup for rich previews
7. Share count display (mock: random between 10-500)

Design: circular icon buttons with platform colors on hover. Animate the share popup.
```

---

## 8. Performance & Accessibility

### Prompt 83 — Image Optimization
```
Implement image optimization for the NDM website:
1. Lazy loading: native loading="lazy" + IntersectionObserver fallback
2. WebP format detection and serving
3. Responsive images: srcset for 400w, 800w, 1200w
4. Placeholder: LQIP (Low Quality Image Placeholder) or blur-up technique
5. Error fallback: broken image → NDM logo placeholder
6. Progressive JPEG loading effect

Create an OptimizedImage component that wraps <img> with all these features. Show before/after Lighthouse scores explanation. Include blur-up CSS animation.
```

### Prompt 84 — Code Splitting & Lazy Loading
```
Implement code splitting for the NDM React app to improve initial load time:
1. Lazy load all page components with React.lazy + Suspense
2. Route-based code splitting with React Router
3. Component-level lazy loading for heavy components (Gallery lightbox, Map)
4. Dynamic import for rarely-used features (Certificate PDF generator)
5. Prefetch on hover: preload next likely page when user hovers nav link
6. Vite bundle analysis setup (rollup-plugin-visualizer)

Show the bundle size before/after with estimates. Include loading fallback UI for each lazy component.
```

### Prompt 85 — Performance Optimization Checklist
```
Create a comprehensive performance optimization implementation for the NDM website:
1. Font optimization: font-display: swap, preconnect to Google Fonts
2. Critical CSS inlining (above-the-fold styles)
3. Debounce scroll event handlers
4. Memoize expensive components with React.memo
5. useCallback for event handlers passed as props
6. useMemo for filtered/sorted lists
7. Virtualize long lists (react-virtual for 64 districts list)
8. Avoid layout thrashing in animations

Output: annotated code examples for each optimization + explanation of why it matters for NDM's mobile-heavy Bangladesh audience.
```

### Prompt 86 — Form Validation System
```
Build a comprehensive form validation system for NDM using react-hook-form + Zod:

Validation rules:
- Name: min 3 chars, max 50, letters only
- Email: valid format + disposable domain check
- Phone: Bangladesh format (+880 or 01XXXXXXXXX)
- District: required, must be one of 64 valid districts
- Message: min 20 chars, max 500
- Student ID: alphanumeric, 6-12 chars

Features:
1. Real-time validation (onBlur mode)
2. Animated error messages (shake + fade in)
3. Success indicators (green checkmark per field)
4. Submit button disabled until form valid
5. Field-level loading (for async email check)
```

### Prompt 87 — Internationalization Setup (Bangla/English)
```
Set up i18n (internationalization) for the NDM website with English and Bengali support:
1. Install and configure i18next + react-i18next
2. Translation files: public/locales/en/common.json + public/locales/bn/common.json
3. Language switcher component (EN/বাংলা toggle in navbar)
4. Translate: navbar links, hero section, stats labels, footer
5. Bengali font: 'Hind Siliguri' from Google Fonts
6. Right-to-left detection (Bengali is LTR, but setup for future Arabic)
7. Persist language choice in localStorage

Show the translation key structure and the useTranslation hook usage in components.
```

### Prompt 88 — Analytics Integration
```
Integrate analytics for the NDM website:
1. Google Analytics 4 (gtag.js) via Vite plugin
2. Page view tracking with React Router (track on route change)
3. Custom events:
   - join_form_started
   - join_form_completed
   - newsletter_subscribed
   - gallery_image_viewed
   - cta_clicked (with button label)
   - social_share (with platform)
4. Analytics hook: useAnalytics() with trackEvent(name, params)
5. Cookie consent check before loading GA

Show the gtag configuration and the custom hook implementation.
```

### Prompt 89 — Error Boundary Implementation
```
Implement comprehensive Error Boundaries for the NDM React app:
1. Global ErrorBoundary wrapping the entire app
2. Section-level error boundaries (News section won't break whole page)
3. Error UI: friendly "Something went wrong in this section" with retry button
4. Error logging: console.error + send to monitoring service (Sentry-ready)
5. Async error handling for API calls
6. Network error detection and user-friendly messages
7. "Try Again" button that resets the error boundary

Create an ErrorBoundary class component + useErrorHandler hook for function components.
```

### Prompt 90 — Testing Setup
```
Set up a testing environment for the NDM React project:
1. Install: Vitest, React Testing Library, MSW (Mock Service Worker)
2. Configure vitest.config.js
3. Write tests for:
   - Navbar: renders all links, hamburger toggles mobile menu
   - Counter: animates to target value
   - JoinForm: validates required fields, shows errors, submits successfully
   - NewsCard: renders title, date, tag correctly
   - Lightbox: opens on image click, closes on ESC
4. MSW handlers for: POST /join, POST /contact, POST /newsletter
5. Coverage report setup

Output: full test files + configuration.
```

---

## 9. SEO & Analytics

### Prompt 91 — SEO Configuration
```
Implement comprehensive SEO for the NDM Student Movement website:
1. React Helmet for dynamic meta tags per page
2. Open Graph tags: title, description, image, url, type
3. Twitter Card tags
4. Canonical URLs
5. JSON-LD structured data:
   - Organization schema
   - BreadcrumbList
   - Event schema for events
   - Article schema for news
6. XML Sitemap generation (list all URLs)
7. robots.txt

Create a useSEO(pageConfig) hook that sets all tags. Show configuration for Home, About, News, and Join pages.
```

### Prompt 92 — Open Graph Image Generator
```
Create a dynamic Open Graph image generator for NDM news articles:
1. When sharing a news article, generate a branded OG image
2. Template: NDM branded background (green), article title (large), author name, NDM logo, date
3. Use: @vercel/og or canvas-based approach
4. API endpoint (if using Next.js) or pre-generated images
5. Fallback: static default OG image for home/about pages

For static React (Vite): create a script that generates OG images from article data using node-canvas. Output to public/og-images/.
```

### Prompt 93 — Sitemap & robots.txt
```
Generate a complete sitemap.xml and robots.txt for the NDM website:

sitemap.xml — include:
- / (Home) — priority 1.0, weekly
- /about — 0.8, monthly
- /leadership — 0.8, monthly
- /activities — 0.9, weekly
- /news — 0.9, daily
- /news/:slug — 0.7, monthly (generate for each article)
- /gallery — 0.7, weekly
- /join — 0.9, monthly
- /contact — 0.6, monthly

robots.txt — allow all, disallow /dashboard, /admin. Sitemap location.

Output the raw XML and txt. Show how to serve them from Vite's public/ folder.
```

### Prompt 94 — Performance Monitoring
```
Set up performance monitoring for the NDM website:
1. Core Web Vitals measurement using web-vitals library
2. Report LCP, FID/INP, CLS, FCP, TTFB to console (dev) and GA4 (prod)
3. Custom performance marks for:
   - Hero section paint time
   - Gallery image load time
   - Form submit response time
4. Performance budget: Fail build if JS bundle > 300KB
5. Lighthouse CI setup for automated audits

Create a src/utils/performance.js module. Show the reportWebVitals integration in main.jsx.
```

### Prompt 95 — Structured Data / Schema.org
```
Implement all Schema.org structured data for NDM website pages:
1. Home: Organization schema (name, logo, address, social links, contactPoint)
2. About: AboutPage schema
3. News listing: CollectionPage with ItemList
4. Article detail: Article schema (headline, author, datePublished, image, publisher)
5. Events: Event schema (name, startDate, location, organizer, offers)
6. Contact: LocalBusiness + ContactPage
7. Join page: WebPage with potentialAction (JoinAction)

Output as JSON-LD script tags using React Helmet. Validate against Google's Rich Results Test.
```

---

## 10. Testing & Deployment

### Prompt 96 — Unit Tests (Components)
```
Write unit tests for the following NDM components using Vitest + React Testing Library:

1. Navbar.test.jsx:
   - Renders logo text "NDM"
   - All 7 nav links are present
   - Hamburger button toggles mobile menu
   - Join Us button has correct href

2. Counter.test.jsx:
   - Starts at 0
   - Reaches target value after animation
   - Triggers only when visible

3. JoinForm.test.jsx:
   - Shows error on empty submit
   - Validates phone format
   - Shows success message on valid submit

4. NewsCard.test.jsx:
   - Renders title, date, tag
   - Image has alt text
   - Link is accessible
```

### Prompt 97 — Integration Tests
```
Write integration tests for NDM's key user flows:

1. Complete Join Form flow:
   - Fill all fields → Submit → See success message
   - Submit with invalid email → See error
   - Submit empty form → See all required field errors

2. Gallery lightbox flow:
   - Click image → Lightbox opens
   - Click next → Second image shown
   - Press ESC → Lightbox closes
   - Click backdrop → Closes

3. Dark mode flow:
   - Toggle dark mode → body.dark class added
   - Refresh page → dark mode persists from localStorage

Use MSW to mock form submissions.
```

### Prompt 98 — Deployment Configuration
```
Create a complete deployment configuration for the NDM Student Movement website:

1. Vercel deployment:
   - vercel.json with routes for SPA (catch-all to index.html)
   - Environment variables setup in Vercel dashboard
   - Build command: npm run build
   - Output directory: dist

2. Netlify alternative:
   - _redirects file: /* /index.html 200
   - netlify.toml with build settings

3. GitHub Actions CI/CD pipeline:
   - On push to main: lint → test → build → deploy
   - Lighthouse CI check (fail if score < 90)
   - Bundle size check

4. Domain setup: ndmstudent.org with SSL

Output all configuration files.
```

### Prompt 99 — Documentation
```
Write comprehensive documentation for the NDM Student Movement codebase:

1. README.md:
   - Project overview
   - Tech stack
   - Prerequisites
   - Installation steps
   - Available scripts
   - Environment variables
   - Project structure
   - Deployment guide
   - Contributing guidelines

2. COMPONENTS.md:
   - List all components with props table
   - Usage examples for Navbar, Button, Card, Modal, Form

3. CHANGELOG.md:
   - v1.0.0 initial release

4. Code style guide:
   - Component naming conventions
   - File organization rules
   - CSS class naming
   - Git commit message format

Format all in clean Markdown.
```

### Prompt 100 — Full Stack Upgrade Path
```
Provide a comprehensive plan for upgrading the NDM Student Movement website from a static React site to a full-stack application:

Frontend (keep):
- React + Vite + Tailwind (current)

Add:
1. Backend: Node.js + Express API or Next.js App Router
2. Database: PostgreSQL (Supabase hosted) with schema for: members, events, news, contacts
3. Auth: NextAuth.js or Supabase Auth (member login)
4. CMS: Sanity.io for news/blog/events management by non-technical staff
5. File storage: Cloudinary for gallery images (upload + optimize)
6. Email: Resend.com for join confirmations, newsletters
7. Payment: (future) SSL Commerz for Bangladesh-local donations

Provide:
- Database schema (SQL)
- API endpoints list
- Migration strategy from current static site
- Cost estimate (monthly, in BDT)
```

---

## 🏁 Quick Reference Card

| Category | Prompts | Focus |
|---|---|---|
| Setup & Architecture | 1–10 | Vite, Router, Context, Data, Hooks |
| Design System | 11–20 | CSS, Typography, Buttons, Cards, Forms |
| Navigation & Layout | 21–30 | Navbar, Mobile Menu, Footer, Scroll |
| Home Page | 31–45 | Hero, Stats, News, CTA, Timeline |
| About & Leadership | 46–60 | Pages, Timeline, Team Cards, Awards |
| News, Gallery, Join | 61–72 | Blog, Lightbox, Multi-step Form |
| Contact & Utils | 73–82 | Map, Dark Mode, PWA, Sharing |
| Performance | 83–90 | Images, Lazy, i18n, Testing |
| SEO | 91–95 | Meta, Schema, Sitemap, Analytics |
| Deploy | 96–100 | Tests, CI/CD, Docs, Full Stack |

---

## 💡 Usage Tips

1. **Use prompts sequentially** — later prompts assume earlier ones are complete
2. **Specify your AI tool** — these prompts work with Claude, GPT-4o, or GitHub Copilot
3. **Iterate** — after getting output, follow up with "now make it responsive" or "add dark mode support"
4. **Combine prompts** — e.g., Prompt 13 (Button) + Prompt 38 (CTA Section) together
5. **Add context** — prefix any prompt with: "In the context of the NDM Student Movement React project with green/white/red color scheme..."

---

*© 2026 NDM Student Movement — All Rights Reserved*  
*This blueprint is for internal development use only.*
