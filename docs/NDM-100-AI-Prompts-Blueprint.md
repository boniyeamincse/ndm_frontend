# 🏛️ Improved NDM Student Movement — 100 AI Prompts Blueprint

This document contains rewritten prompts in a professional format designed for high-quality AI-assisted development.

---

## 1. Project Setup & Architecture

### Task 01 [x] — Prompt 1 — Vite + React + Tailwind Bootstrap
**Goal**: Initialize a React project using Vite with Tailwind CSS v3, React Router v6, and Framer Motion.
**Rules**:
- Use Vite for build and development.
- Configure Tailwind v3 with the brand color palette.
- Integrate React Router v6 and Framer Motion into the main entry point.
**Example**:
- Input: "Setup with colors #006A4E, #DC143C, #F0C040" -> Output: Full `tailwind.config.js`.
- Input: "Add routing" -> Output: `BrowserRouter` in `main.jsx`.
- Input: "Initial animations" -> Output: `framer-motion` installed.
**Deliver**: `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, and `src/main.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 02 [x] — Prompt 2 — Folder Structure
**Goal**: Design a scalable React project folder structure for "NDM Student Movement".
**Rules**:
- Follow a modular architecture (components, pages, hooks, context, etc.).
- Provide a one-line description for every major folder/file.
- Ensure the structure supports multi-page scalability.
**Example**:
- Input: "Organization website" -> Output: `components/`, `pages/`, `hooks/`.
- Input: "Scalability" -> Output: `context/`, `utils/`, `data/`.
- Input: "Directory tree" -> Output: A clean ASCII/Markdown tree.
**Deliver**: A clean directory tree with descriptions.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 03 [x] — Prompt 3 — React Router Setup
**Goal**: Build a complete React Router v6 setup for an 8-page website.
**Rules**:
- Use `createBrowserRouter` for routing.
- Implement lazy loading with `React.lazy` and `Suspense`.
- Implement a global `Layout` component with `Navbar` and `Footer`.
- Add scroll-to-top behavior on all route changes.
**Example**:
- Input: "8 pages" -> Output: Home, About, News, etc. routes.
- Input: "Suspense" -> Output: Loading fallback UI.
- Input: "Scroll behavior" -> Output: `ScrollToTop` component.
**Deliver**: `src/router/index.jsx` and the `Layout` wrapper.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 04 [x] — Prompt 4 — Global Context (Dark Mode + Auth)
**Goal**: Create an `AppContext` for managing global states.
**Rules**:
- Manage `darkMode`, `mobileMenuOpen`, `currentPage`, and `isLoading`.
- Use `useReducer` for state transitions.
- Persist `darkMode` preference in `localStorage`.
- Export a custom `useApp()` hook for easy access.
**Example**:
- Input: "Toggle dark mode" -> Output: Reducer action + localStorage update.
- Input: "Loading state" -> Output: Global Boolean state.
- Input: "Sync with router" -> Output: Page state update on location change.
**Deliver**: `AppContext.jsx` and provider implementation in `main.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 05 [x] — Prompt 5 — Theme Constants File
**Goal**: Create a central theme constants file at `src/constants/theme.js`.
**Rules**:
- Export objects for `COLORS`, `FONTS`, `BREAKPOINTS`, `SPACING`, and `TRANSITIONS`.
- Use brand-specific values (Playfair Display, DM Sans).
- Include green-tinted box-shadow variations for `SHADOWS`.
**Example**:
- Input: "Primary color" -> Output: `#006A4E`.
- Input: "Fonts" -> Output: Display and Body font families.
- Input: "Transitions" -> Output: Fast, normal, and slow presets.
**Deliver**: `src/constants/theme.js` with all exported objects.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 06 [x] — Prompt 6 — Data Layer
**Goal**: Create a `src/data/index.js` file for mock data management.
**Rules**:
- Export mock arrays for `navLinks`, `stats`, `leaders`, `activities`, and `news`.
- Include Bangladesh-specific content (64 districts, local names).
- Ensure data structures are consistent for use in card components.
**Example**:
- Input: "Leaders" -> Output: Array of objects with name, role, bio.
- Input: "Districts" -> Output: Array of 64 district names.
- Input: "Footer links" -> Output: Grouped categories of links.
**Deliver**: `src/data/index.js` with realistic content.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 07 [x] — Prompt 7 — Custom Hooks Collection
**Goal**: Create a collection of custom hooks at `src/hooks/index.js`.
**Rules**:
- Implement `useScrollY`, `useInView`, `useCounter`, and `useDebounce`.
- Implement `useLocalStorage`, `useMediaQuery`, and `useLockBodyScroll`.
- Ensure all hooks are properly typed with JSDoc comments.
**Example**:
- Input: "In view" -> Output: `IntersectionObserver` hook.
- Input: "Debounce" -> Output: Delayed value update hook.
- Input: "Lock scroll" -> Output: Modal-friendly scroll prevention.
**Deliver**: `src/hooks/index.js` with all functional hooks.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 08 [x] — Prompt 8 — Environment Config
**Goal**: Set up environment variable validation and access patterns.
**Rules**:
- Create `.env.local`, `.env.example`, and a validation wrapper.
- Validate `VITE_API_URL`, `VITE_GOOGLE_MAPS_KEY`, etc.
- Provide safe fallbacks for missing variables.
**Example**:
- Input: "API URL" -> Output: Validated config value.
- Input: ".gitignore" -> Output: Rule to exclude .env files.
- Input: "Usage" -> Output: Safe access in a component.
**Deliver**: `.env` files and `src/config/env.js`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 09 [ ] — Prompt 9 — API Service Layer
**Goal**: Create an API service layer for handling external requests.
**Rules**:
- Implement functions for submitting forms and fetching news/gallery data.
- Handle loading, error, and data states for every request.
- Use the Fetch API with proper headers and error management.
**Example**:
- Input: "Submit form" -> Output: POST request to endpoint.
- Input: "Fetch news" -> Output: Mock data with realistic delay.
- Input: "Error handling" -> Output: Consistent `{ data, error, loading }` return.
**Deliver**: `src/services/api.js` with all service functions.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 10 [ ] — Prompt 10 — Animation Configuration
**Goal**: Centralize Framer Motion animations in `src/config/animations.js`.
**Rules**:
- Define reusable variants for `fadeUp`, `fadeIn`, `slideIn`, and `stagger`.
- Include configuration for page transitions and hover effects.
- Use Typescript-friendly structure and v10+ syntax.
**Example**:
- Input: "Fade up" -> Output: `opacity: 0, y: 20` -> `opacity: 1, y: 0`.
- Input: "Stagger" -> Output: Parent and child variants.
- Input: "Page transition" -> Output: `AnimatePresence` config.
**Deliver**: `src/config/animations.js` with comprehensive exports.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

---

## 2. Global Styles & Design System

### Task 11 [ ] — Prompt 11 — CSS Variables & Reset
**Goal**: Create a comprehensive `globals.css` file with brand-specific variables and resets.
**Rules**:
- Define CSS custom properties for all brand colors, fonts, and spacing.
- Implement a modern CSS reset and basic typography styles.
- Add custom scrollbar styling and selection color overrides.
**Example**:
- Input: "Color variables" -> Output: `--brand-green: #006A4E`.
- Input: "Selection color" -> Output: Green background highlight.
- Input: "Scrollbar" -> Output: Thin, green-themed scrollbar.
**Deliver**: `src/styles/globals.css`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 12 [ ] — Prompt 12 — Typography System
**Goal**: Design a complete typography system using Playfair Display and DM Sans.
**Rules**:
- Provide Google Fonts import and Tailwind `fontFamily` extensions.
- Create typography classes for sizes and weights (xl to sm).
- Use `clamp()` for responsive fluid font sizes.
**Example**:
- Input: "Playfair Display" -> Output: Display font config.
- Input: "Responsive sizes" -> Output: `clamp()` values for h1-h6.
- Input: "Weights" -> Output: Config for light to extra-bold.
**Deliver**: Ready-to-use CSS and `tailwind.config` snippets.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 13 [ ] — Prompt 13 — Button Component System
**Goal**: Build a multi-variant reusable `Button` component with Framer Motion.
**Rules**:
- Support variants like `primary`, `danger`, `outline`, and `gold`.
- Handle states like `loading`, `disabled`, and `size`.
- Ensure accessibility with proper ARIA attributes and keyboard support.
**Example**:
- Input: "Variant: primary" -> Output: Green background button.
- Input: "Loading state" -> Output: Spinner + disabled click.
- Input: "Animation" -> Output: `scale: 0.95` on tap.
**Deliver**: `src/components/ui/Button.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 14 [ ] — Prompt 14 — Card Component Library
**Goal**: Create a library of reusable card components for news, leaders, and stats.
**Rules**:
- Use a base `Card.Base` for shared styling like shadows and radius.
- Implement specialized sub-components like `Card.News` and `Card.Leader`.
- Support hover effects (zoom, lift) and responsive layouts.
**Example**:
- Input: "News card" -> Output: Image, tag, and title structure.
- Input: "Hover lift" -> Output: `translate-y-[-4px]` on hover.
- Input: "Stat card" -> Output: Number + label + icon.
**Deliver**: `src/components/ui/Card.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 15 [ ] — Prompt 15 — Badge & Tag Components
**Goal**: Create `Badge` and `Tag` components with Bangladesh-inspired variants.
**Rules**:
- Implement variants like `success`, `danger`, `warning`, and `achievement`.
- Support features like animated pulse dots and closable functionality.
- Ensure smooth transitions and high contrast for readability.
**Example**:
- Input: "Live Event badge" -> Output: Red with pulse animation.
- Input: "Achievement badge" -> Output: Gold themed tag.
- Input: "Closable tag" -> Output: `onClose` callback + close icon.
**Deliver**: `src/components/ui/Badge.jsx` and `Tag.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 16 [ ] — Prompt 16 — Icon System
**Goal**: Set up a consistent icon system using `react-icons`.
**Rules**:
- Choose specific icon sets for UI and social media (Feather, BoxIcons).
- Create an `Icon.jsx` wrapper with size and color mapping.
- Map semantic names to icon components in a constants file.
**Example**:
- Input: "Social icons" -> Output: Facebook, Twitter, YouTube mappings.
- Input: "Icon wrapper" -> Output: Props for size and custom color.
- Input: "Usage" -> Output: `<Icon name="home" size="lg" />`.
**Deliver**: `src/components/ui/Icon.jsx` and `src/constants/icons.js`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 17 [ ] — Prompt 17 — Loading States
**Goal**: Build a system for page loaders, skeletons, and spinners.
**Rules**:
- Implement a full-screen `PageLoader` with the NDM logo.
- Create an animated `Skeleton` for placeholders in cards and text.
- Respect `prefers-reduced-motion` for all loading animations.
**Example**:
- Input: "Page loader" -> Output: Full-screen overlay with progress bar.
- Input: "Skeleton" -> Output: Shimmer animation for card layout.
- Input: "Inline spinner" -> Output: CSS-based spinner for buttons.
**Deliver**: `src/components/ui/Loading.jsx` or separate files.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 18 [ ] — Prompt 18 — Toast Notification System
**Goal**: Create a global toast system with slide-in/out animations.
**Rules**:
- Implement a `ToastContext` and a `useToast()` custom hook.
- Support `success`, `error`, `info`, and `warning` types.
- Ensure maximum of 4 concurrent toasts with auto-dismiss (5s).
**Example**:
- Input: "Success toast" -> Output: Green alert with check icon.
- Input: "Animation" -> Output: Framer Motion slide-in from right.
- Input: "Accessibility" -> Output: `aria-live="polite"` region.
**Deliver**: `src/context/ToastContext.jsx` and UI components.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 19 [ ] — Prompt 19 — Modal System
**Goal**: Implement a reusable `Modal` system with backdrop blur and animations.
**Rules**:
- Support multiple variants: standard, confirmation, and image lightbox.
- Manage features: focus trap, body scroll lock, and ESC key close.
- Export a `useModal()` hook for managing modal state.
**Example**:
- Input: "Confirmation modal" -> Output: Title, warning text, and action buttons.
- Input: "Lightbox" -> Output: Large image view with close button.
- Input: "Focus trap" -> Output: Interaction limited to the modal.
**Deliver**: `src/components/ui/Modal.jsx` and `src/hooks/useModal.js`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 20 [ ] — Prompt 20 — Form Component Library
**Goal**: Build a collection of styled form inputs for user interaction.
**Rules**:
- Create components for `Input`, `Select`, `Textarea`, and `Checkbox`.
- Integrate with `react-hook-form` and handle validation errors gracefully.
- Include a `FormGroup` wrapper for consistent label and error placement.
**Example**:
- Input: "Input with error" -> Output: Red border and error message.
- Input: "Custom select" -> Output: Styled dropdown for districts.
- Input: "Submit button" -> Output: Loading state support.
**Deliver**: Components folder at `src/components/ui/forms/`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

---

## 3. Navigation & Layout

### Task 21 [ ] — Prompt 21 — Sticky Navbar Component
**Goal**: Build a highly functional sticky navbar with mobile menu and dark mode toggle.
**Rules**:
- Implement a hide-on-scroll behavior with smooth transitions.
- Include desktop nav links with hover animations and a mobile hamburger menu.
- Integrate active link highlighting and dark mode switching.
**Example**:
- Input: "Hide on scroll" -> Output: `translate-y-[-100%]` on scroll down.
- Input: "Glass effect" -> Output: `backdrop-blur-md` on scroll.
- Input: "Mobile menu" -> Output: Full-screen overlay trigger.
**Deliver**: `src/components/layout/Navbar.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 22 [ ] — Prompt 22 — Mobile Navigation Overlay
**Goal**: Create a full-featured mobile drawer for site navigation.
**Rules**:
- Use Framer Motion for slide-in animations and staggered list items.
- Support nested sub-menus with accordion-style expand/collapse.
- Include social media icons and primary CTA buttons.
**Example**:
- Input: "Slide animation" -> Output: Drawer sliding in from the right.
- Input: "Staggered items" -> Output: Links fading in sequentially.
- Input: "Body lock" -> Output: Main site scrolling disabled when open.
**Deliver**: `src/components/layout/MobileMenu.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 23 [ ] — Prompt 23 — Breadcrumb Component
**Goal**: Build an auto-generating breadcrumb component from URL structure.
**Rules**:
- Map routes to readable labels (with overrides support).
- Truncate long paths on mobile for responsiveness.
- Inject JSON-LD `BreadcrumbList` schema for SEO.
**Example**:
- Input: `/about/leadership` -> Output: Home > About > Leadership.
- Input: "Home icon" -> Output: 🏠 link to root.
- Input: "Active page" -> Output: Bold, non-clickable current item.
**Deliver**: `src/components/ui/Breadcrumbs.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 24 [ ] — Prompt 24 — Root Layout Component
**Goal**: Create a master `Layout` wrapper for common elements and transitions.
**Rules**:
- Wrap all pages with `Navbar` and `Footer` components.
- Manage page transition animations using `AnimatePresence`.
- Include a floating "Back to Top" button and scroll position restoration.
**Example**:
- Input: "Page transition" -> Output: Fade-out old, fade-in new page.
- Input: "Meta tags" -> Output: Helmet injection for title/description.
- Input: "Progress bar" -> Output: Top-of-page navigation loading bar.
**Deliver**: `src/components/layout/Layout.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 25 [ ] — Prompt 25 — Dropdown Menu Component
**Goal**: Create an accessible dropdown for nested navigation links.
**Rules**:
- Support hover on desktop and click interaction on mobile devices.
- Adhere to WAI-ARIA menu patterns for keyboard navigation.
- Use Framer Motion for scale and opacity animations on state change.
**Example**:
- Input: "About dropdown" -> Output: History, Vision, Leadership links.
- Input: "Keyboard nav" -> Output: Arrow keys to move focus.
- Input: "Click outside" -> Output: Closes the active dropdown.
**Deliver**: `src/components/ui/Dropdown.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 26 [ ] — Prompt 26 — Footer Component
**Goal**: Build a professional multi-column footer with newsletter integration.
**Rules**:
- Include a full-width newsletter signup bar with brand colors.
- Organize links into categories (About, Programs, Social, etc.).
- Ensure a responsive layout (4 columns on desktop → 1 on mobile).
**Example**:
- Input: "Social icons" -> Output: Hover color changes for FB, Twitter, etc.
- Input: "Newsletter" -> Output: Email input + success state handling.
- Input: "Bottom bar" -> Output: Copyright + legal + flags.
**Deliver**: `src/components/layout/Footer.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 27 [ ] — Prompt 27 — Scroll Progress Indicator
**Goal**: Create a visual indicator of reading progress at the top of the viewport.
**Rules**:
- Use a `linear-gradient` transition from green to red based on scroll %.
- Optimize performance using `requestAnimationFrame` or the `useScrollProgress` hook.
- Implement conditional visibility (only visible on detail/article pages).
**Example**:
- Input: "Scroll 50%" -> Output: Bar width at 50% with transition color.
- Input: "No jitter" -> Output: Smooth CSS-driven width updates.
- Input: "Hook" -> Output: Reactive value between 0 and 100.
**Deliver**: `src/components/ui/ScrollProgress.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 28 [ ] — Prompt 28 — Sidebar Component (Mobile Drawer)
**Goal**: Build a reusable drawer for navigation, filters, or side content.
**Rules**:
- Support side configuration (`left` or `right`) and custom widths.
- Implement swipe-to-close on mobile and backdrop interaction.
- Ensure full keyboard accessibility and focus management.
**Example**:
- Input: "Left drawer" -> Output: Sliding sidebar from the left.
- Input: "Filter sidebar" -> Output: Checkboxes and radio buttons layout.
- Input: "Overlay" -> Output: Dimmed background with click-to-close.
**Deliver**: `src/components/ui/Drawer.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 29 [ ] — Prompt 29 — Pagination Component
**Goal**: Develop a pagination system for news and gallery listings.
**Rules**:
- Include previous/next buttons and numbered pills with ellipses.
- Sync the current page state with the URL query parameters.
- Provide a `usePagination` hook for range and limit calculations.
**Example**:
- Input: "Active page" -> Output: Highlighted pill with green background.
- Input: "Ellipses" -> Output: "1, 2, ..., 10" when page count is high.
- Input: "URL sync" -> Output: Updates `?page=X` on navigation.
**Deliver**: `src/components/ui/Pagination.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 30 [ ] — Prompt 30 — Scroll-Spy Navigation
**Goal**: Highlight active navigation sections as the user scrolls.
**Rules**:
- Use `IntersectionObserver` to track section visibility under a threshold.
- Update the active state in the navbar or floating indicator.
- Debounce updates to maintain high page performance.
**Example**:
- Input: "Scroll to About" -> Output: "About" link highlighted in navbar.
- Input: "Observer threshold" -> Output: 40% visibility trigger.
- Input: "Dot indicator" -> Output: Visual dots showing progress on side.
**Deliver**: `src/hooks/useScrollSpy.js` and usage example.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

---

## 4. Home Page Sections

### Task 31 [ ] — Prompt 31 — Hero Section
**Goal**: Build a stunning full-viewport Hero section with animations and CTAs.
**Rules**:
- Use a high-quality background image with a dark gradient overlay.
- Implement a staggered entrance animation for headline, subtext, and buttons.
- Include a pulsing red dot badge and a scroll indicator arrow.
**Example**:
- Input: "Hero headline" -> Output: "Empowering Future Leaders of Bangladesh".
- Input: "CTA buttons" -> Output: "Join the Movement" (red) and "Learn More" (glass).
- Input: "Stats display" -> Output: Members, Districts, and Years counter preview.
**Deliver**: `src/components/home/Hero.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 32 [ ] — Prompt 32 — News Ticker / Announcement Bar
**Goal**: Build a CSS-only marquee-style news ticker for breaking announcements.
**Rules**:
- Implement an infinite loop scrolling animation using keyframes.
- Include a "BREAKING" label in a fixed red box on the left.
- Ensure the ticker pauses on hover and is accessible to screen readers.
**Example**:
- Input: "Ticker items" -> Output: Scrolling list of upcoming events/achievements.
- Input: "Pause behavior" -> Output: `animation-play-state: paused` on hover.
- Input: "Typography" -> Output: DM Sans, white text on dark green background.
**Deliver**: `src/components/home/NewsTicker.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 33 [ ] — Prompt 33 — Animated Stats Counter
**Goal**: Create an animated counter section triggered by intersection visibility.
**Rules**:
- Use `requestAnimationFrame` or a library for smooth count-up easing.
- Trigger the animation only when the section enters the viewport.
- Design a responsive grid (2x2 on mobile, 4x1 on desktop) for the 4 key stats.
**Example**:
- Input: "Count target" -> Output: 50,000+ Active Members.
- Input: "Observer" -> Output: Animation starts when 20% visible.
- Input: "Layout" -> Output: Centered numbers with descriptive labels.
**Deliver**: `src/components/home/StatsCounter.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 34 [ ] — Prompt 34 — Featured Programs Grid
**Goal**: Create a grid displaying the organization's core programs and activities.
**Rules**:
- Use a 3-column layout on desktop that collapses into a single column on mobile.
- Implement hover states with a lift effect and dynamic top-border colors.
- Use staggered entrance animations for the program cards.
**Example**:
- Input: "Program card" -> Output: Icon, name, description, and "Learn More".
- Input: "Hover effect" -> Output: Shadow increase and border-color change.
- Input: "Categories" -> Output: Leadership, Digital Skills, Green Campus.
**Deliver**: `src/components/home/ProgramsGrid.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 35 [ ] — Prompt 35 — Latest News Preview
**Goal**: Build a section previewing the latest news articles with featured layouts.
**Rules**:
- Showcase the most recent article in a larger, full-width featured card.
- Use horizontal layouts for secondary cards on desktop.
- Implement lazy loading and skeleton states for news images.
**Example**:
- Input: "Featured article" -> Output: Large banner style card with background image.
- Input: "News list" -> Output: Tag, date, and headline for each item.
- Input: "Z-image zoom" -> Output: Subtle scale up on card hover.
**Deliver**: `src/components/home/NewsPreview.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 36 [ ] — Prompt 36 — Mission Banner
**Goal**: Design a high-impact branding banner between major sections.
**Rules**:
- Use a deep green background with a subtle geometric pattern overlay.
- feature a large, centered quote using Playfair Display typography.
- Include Vision and Mission statements in secondary columns.
**Example**:
- Input: "Main quote" -> Output: "Together We Build a Democratic Bangladesh".
- Input: "CTA buttons" -> Output: "Learn About NDM" and "Our Impact".
- Input: "Design accent" -> Output: Red-to-green gradient divider line.
**Deliver**: `src/components/home/MissionBanner.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 37 [ ] — Prompt 37 — Testimonials / Voices Section
**Goal**: Build an auto-rotating testimonial carousel with user-focused design.
**Rules**:
- Implement auto-rotation (5s) with manual overrides (dots/arrows).
- Pause the carousel on hover or keyboard focus for accessibility.
- Design cards with large decorative quote marks and italicized body text.
**Example**:
- Input: "Member quote" -> Output: Student bio and their positive experience.
- Input: "Carousel navigation" -> Output: Dot indicators and side arrows.
- Input: "Animation" -> Output: Horizontal slide between testimonial cards.
**Deliver**: `src/components/home/Testimonials.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 38 [ ] — Prompt 38 — CTA Join Section (Homepage)
**Goal**: Create a high-conversion call-to-action section with a integrated form.
**Rules**:
- Use a split layout: persuasive benefits on the left, quick-signup on the right.
- Implement form validation and success/error feedback states.
- Include a subtle SVG map of Bangladesh in the background for context.
**Example**:
- Input: "Headline" -> Output: "Be Part of the Change".
- Input: "Form fields" -> Output: Name, Email, and District selection.
- Input: "Success state" -> Output: Celebration checkmark animation.
**Deliver**: `src/components/home/JoinCTA.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 39 [ ] — Prompt 39 — Partners / Supporters Strip
**Goal**: Showcase partner logos in a smooth, continuous scrolling marquee.
**Rules**:
- Implement a grayscale-to-color filter transition on logo hover.
- Use an infinite CSS loop for the marquee to ensure high performance.
- Include recognizable institutional partners relevant to the organization.
**Example**:
- Input: "Logos list" -> Output: Ministry of Education, UNDP, etc.
- Input: "Hover behavior" -> Output: Color restoration + subtle scale.
- Input: "Mobile view" -> Output: Slightly faster or smaller marquee.
**Deliver**: `src/components/home/PartnerStrip.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 40 [ ] — Prompt 40 — District Map Section
**Goal**: Visualize the organization's reach across Bangladesh's 64 districts.
**Rules**:
- Implement a division-based filtering system for district badges.
- Use district pills that show member status (active/inactive) and count.
- Animate the entrance of badges during filter changes.
**Example**:
- Input: "Division filter" -> Output: Dhaka, Sylhet, Chittagong, etc. tabs.
- Input: "District pill" -> Output: Green badge showing "Dhaka - 5k Members".
- Input: "CTA" -> Output: "Find Your District Unit" link.
**Deliver**: `src/components/home/DistrictMap.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 41 [ ] — Prompt 41 — Video Section
**Goal**: Create a section for video content with a custom lightbox player.
**Rules**:
- Show a thumbnail with a custom pulsing red "Play" button icon.
- clicking the button opens a YouTube embed in a focused modal.
- Ensure the modal handles scroll locking and ESC-key closing.
**Example**:
- Input: "Thumb overlay" -> Output: Blurry thumb + persistent play pulse.
- Input: "Modal behavior" -> Output: Dimmed background and center player.
- Input: "Highlights" -> Output: 3 achievement points below the video.
**Deliver**: `src/components/home/VideoSection.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 42 [ ] — Prompt 42 — Event Countdown Timer
**Goal**: Build a live countdown timer for the next major organization event.
**Rules**:
- Calculate time remaining in Days, Hours, Minutes, and Seconds.
- Update the UI every second with a "flip" or subtle pulse effect.
- Show a specific registration CTA or "Event in Progress" state when reached.
**Example**:
- Input: "Target date" -> Output: April 25, 2026.
- Input: "Timer UI" -> Output: Large red cards with white numbers.
- Input: "Post-event" -> Output: "Thank you for joining" message.
**Deliver**: `src/components/home/EventCountdown.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 43 [ ] — Prompt 43 — Impact Timeline
**Goal**: Design a vertical timeline showcasing major organizational milestones.
**Rules**:
- Use an alternating left/right layout for milestones on desktop.
- Animate individual timeline entries as they enter the viewport.
- mark the "Current Year" with a distinct visual node or glowing effect.
**Example**:
- Input: "Milestones" -> Output: 2007 Founding -> 2024 Expansion.
- Input: "Design" -> Output: Green vertical track with circular year nodes.
- Input: "Content" -> Output: Bold title + 2 line description per year.
**Deliver**: `src/components/home/ImpactTimeline.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 44 [ ] — Prompt 44 — Social Feed / Highlights Strip
**Goal**: Create a visual strip of social media highlights and statistics.
**Rules**:
- Implement a 4-card row resembling an Instagram profile feed.
- Add hover overlays showing mock interaction counts (likes/comments).
- Include a separate row for total follower counts across platforms.
**Example**:
- Input: "Social stats" -> Output: 125K FB, 67K Insta, etc.
- Input: "Post hover" -> Output: Hearts and comments icon display.
- Input: "Main CTA" -> Output: "Follow @NDMBangladesh" button.
**Deliver**: `src/components/home/SocialFeed.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 45 [ ] — Prompt 45 — Quick Links Grid
**Goal**: Provide a grid of direct links to essential site pages.
**Rules**:
- design a 4x2 grid of cards with prominent icons and short labels.
- Implement a hover effect that switches background colors to brand green.
- Stagger the entrance of each icon for a dynamic initial experience.
**Example**:
- Input: "Links list" -> Output: Join Us, Events, Gallery, Contact, etc.
- Input: "Hover state" -> Output: Icon bounces + background turns green.
- Input: "Accessibility" -> Output: Full tab-index and keyboard support.
**Deliver**: `src/components/home/QuickLinks.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

---

## 5. About, Leadership & Activities

### Task 46 [ ] — Prompt 46 — About Page Layout
**Goal**: Assemble the full "About" page using various sub-components.
**Rules**:
- Integrate sections for Hero, Overview, History, and Values.
- Include a specific Presidential message section with a signature area.
- Add SEO meta tags via React Helmet specifically for the About page.
**Example**:
- Input: "Page structure" -> Output: Hero -> Mission -> Timeline -> Team.
- Input: "Animations" -> Output: Sections fade-up on scroll.
- Input: "Leadership" -> Output: Blockquote from the National President.
**Deliver**: `src/pages/About.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 47 [ ] — Prompt 47 — Core Values Section
**Goal**: Design a 3x2 grid showcasing the 6 core values of the organization.
**Rules**:
- Each value card should have a unique icon (emoji or SVG).
- Use subtle gradient backgrounds for depth within the cards.
- Implement a stagger animation during the entrance of the value grid.
**Example**:
- Input: "Values" -> Output: Democracy, Integrity, Excellence, Unity, etc.
- Input: "Card design" -> Output: Colored border + large icon + title.
- Input: "Mobile view" -> Output: Collapses into 2 columns.
**Deliver**: `src/components/about/CoreValues.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 48 [ ] — Prompt 48 — Organization Structure Chart
**Goal**: Create a visual hierarchy tree of the organizational levels.
**Rules**:
- Use SVG or CSS tree connectors to link different leadership tiers.
- Implement collapse/expand functionality for branch levels (Divisions, Districts).
- ensure the chart remains readable on mobile (potential scrollable container).
**Example**:
- Input: "Levels" -> Output: National -> Divisional -> District.
- Input: "Interactivity" -> Output: Click a division to see its districts.
- Input: "Print support" -> Output: CSS rules for clean chart layout on paper.
**Deliver**: `src/components/about/OrgChart.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 49 [ ] — Prompt 49 — Leadership Page
**Goal**: Build a filtered directory of current organizational leaders.
**Rules**:
- Implement tabs for filtering by level (National, Divisional, District).
- Include a search input to quickly find leaders by name or role.
- provide a featured banner for the top-level leader (President).
**Example**:
- Input: "Filter tabs" -> Output: Toggle between levels of leadership.
- Input: "Cards grid" -> Output: Profile photo, name, and social links.
- Input: "Loading" -> Output: Skeleton card placeholders.
**Deliver**: `src/pages/Leadership.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 50 [ ] — Prompt 50 — Leader Profile Card (Flip Effect)
**Goal**: Create a specialized card with a 3D flip animation for bios.
**Rules**:
- Design distinct "Front" (Photo & Role) and "Back" (Bio & Socials) faces.
- Use `preserve-3d` CSS properties for smooth 0.6s rotation.
- Support both hover (desktop) and tap (mobile) to trigger the flip.
**Example**:
- Input: "Front side" -> Output: Large professional photo + role badge.
- Input: "Back side" -> Output: Short bio and FB/LinkedIn icons.
- Input: "Interaction" -> Output: Rotates around the Y-axis.
**Deliver**: `src/components/ui/LeaderFlipCard.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 51 [ ] — Prompt 51 — Activities Page Layout
**Goal**: Build a central hub for all organizational programs and campaigns.
**Rules**:
- use a sticky category filter (Education, Environment, etc.) at the top.
- Highlight current active campaigns in a prominent featured banner.
- Sync the active filter with the URL for shareable filtered views.
**Example**:
- Input: "Filters" -> Output: All, Tech, Rights, Community, etc.
- Input: "Layout" -> Output: Featured banner + Grid of smaller cards.
- Input: "Timeline" -> Output: Section for past activities recap.
**Deliver**: `src/pages/Activities.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 52 [ ] — Prompt 52 — Event Card Component
**Goal**: Create a specialized card for upcoming and past events.
**Rules**:
- display date, time, and location in a clean, icon-supported format.
- include an attendee avatar stack ("+X more" style) for social proof.
- Use distinct styles/badges for "LIVE", "Upcoming", and "Past" states.
**Example**:
- Input: "Date badge" -> Output: Red box with Day and Month.
- Input: "Status" -> Output: Green border for upcoming, grayscale for past.
- Input: "CTA" -> Output: "Register Now" or "View Recap".
**Deliver**: `src/components/ui/EventCard.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 53 [ ] — Prompt 53 — Campaign Detail Page
**Goal**: build a focused landing page for a specific organizational campaign.
**Rules**:
- include a dynamic progress bar for specific goals (e.g., trees planted).
- feature a volunteer signup form integrated directly into the page.
- Showcase a mini-gallery of recent photos from the campaign.
**Example**:
- Input: "Campaign stats" -> Output: Achieved vs Goal display.
- Input: "Participation" -> Output: 3-step guide on how to help.
- Input: "Sharing" -> Output: Floating share buttons for WhatsApp/FB.
**Deliver**: `src/pages/CampaignDetail.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 54 [ ] — Prompt 54 — History Timeline Component
**Goal**: build a detailed, scroll-animated history timeline for the About page.
**Rules**:
- use a central vertical line with alternating content blocks.
- Highlight the "Current Progress" with a blinking indicator at the end.
- Animate content blocks to slide in from their respective sides on scroll.
**Example**:
- Input: "Year node" -> Output: 2007 - Foundation year details.
- Input: "Indicator" -> Output: Pulsing green dot at 2026.
- Input: "Imagery" -> Output: Optional thumb preview per milestone.
**Deliver**: `src/components/about/HistoryTimeline.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 55 [ ] — Prompt 55 — Awards & Recognition Section
**Goal**: display institutional achievements in a clean, trophy-themed grid.
**Rules**:
- each award card should include the organization, year, and a short description.
- Implement a subtle shimmer effect on the trophy/medal icon.
- adhere to a premium gold and green color scheme for this section.
**Example**:
- Input: "Award" -> Output: Best Student Org 2023 - UGC.
- Input: "Visuals" -> Output: Large gold trophy emoji + white card.
- Input: "Layout" -> Output: 3x1 row on desktop.
**Deliver**: `src/components/about/AwardsSection.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 56 [ ] — Prompt 56 — Scholarship Program Section
**Goal**: build a section detailing scholarship opportunities and application steps.
**Rules**:
- Use distinct tier cards for different scholarship levels (Full, Merit, Need).
- highlight eligibility criteria and application deadlines prominently.
- include a 4-step visual roadmap for the application process.
**Example**:
- Input: "Tiers" -> Output: 50k BDT/Year (Full) vs 25k (Merit).
- Input: "Process" -> Output: Register -> Apply -> Viva -> Award.
- Input: "Urgency" -> Output: Countdown timer to next deadline.
**Deliver**: `src/components/activities/Scholarships.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 57 [ ] — Prompt 57 — Volunteer Registration System
**Goal**: build a multi-step registration flow for potential volunteers.
**Rules**:
- implement a progressive flow (Personal -> Interest -> Availability).
- save progress to `localStorage` to allow resuming later.
- Include a final "Success" screen that generates a temporary Volunteer ID.
**Example**:
- Input: "Step 1" -> Output: Name, Age, University input.
- Input: "Progress" -> Output: Filled circles tracking 1/3, 2/3 done.
- Input: "Validation" -> Output: Can't proceed if phone is invalid.
**Deliver**: `src/components/forms/VolunteerForm.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 58 [ ] — Prompt 58 — Activities Search & Filter
**Goal**: build a comprehensive search and filtering utility for activities.
**Rules**:
- Implement full-text search and category-based pill filters.
- debounce the search input to improve performance and reduce reflows.
- use Framer Motion layout transitions for smooth card re-ordering.
**Example**:
- Input: "Search 'Green'" -> Output: Only Green Campus activities shown.
- Input: "Sort" -> Output: Dropdown for Most Recent vs Oldest.
- Input: "No results" -> Output: Custom illustration + reset button.
**Deliver**: `src/components/activities/ActivityFilter.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 59 [ ] — Prompt 59 — Downloadable Resources Page
**Goal**: Create a structured list of downloadable documents and media kits.
**Rules**:
- group downloads into tabs (Forms, Reports, Media, etc.).
- show file type badges (PDF, ZIP) and estimated file sizes.
- simulate the download action with a toast success notification.
**Example**:
- Input: "Annual Report" -> Output: PDF icon + "Download (5MB)" button.
- Input: "Tabs" -> Output: Toggle between public and member-only files.
- Input: "Styles" -> Output: Hover background color on list items.
**Deliver**: `src/pages/Downloads.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 60 [ ] — Prompt 60 — Leaders' Blog / Thought Leadership
**Goal**: Design an editorial section for articles written by organizational leaders.
**Rules**:
- use a "Featured" spotlight for the most important/recent message.
- Include a "Reading Time" component for every article.
- Apply high-contrast serif typography for a premium editorial look.
**Example**:
- Input: "Featured message" -> Output: Big card with President's photo.
- Input: "Insights blog" -> Output: Grid of articles on Policy and Environment.
- Input: "Author" -> Output: Name + Role + Small Avatar.
**Deliver**: `src/components/about/LeadershipBlog.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

---

## 6. News, Gallery & Join Us

### Task 61 [ ] — Prompt 61 — News / Blog Page
**Goal**: build the master News listing page with featured and grid layouts.
**Rules**:
- showcase the most recent post in a full-width spotlight card.
- implement a sidebar on desktop for categories, recent posts, and tags.
- integrate a "Read More" pagination or infinite scroll system.
**Example**:
- Input: "Posts grid" -> Output: 3-column layout of article cards.
- Input: "Filter" -> Output: Tabs for Events, Achievements, Campaigns.
- Input: "Sidebar" -> Output: Newsletter widget + category list.
**Deliver**: `src/pages/News.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 62 [ ] — Prompt 62 — Article Detail Page
**Goal**: Create a rich-text article detail view with meta info and sharing.
**Rules**:
- include an author info bar with avatar, name, and estimated reading time.
- apply custom styling for pull quotes (red left border) and subheadings.
- Feature a sticky social share bar on desktop for easy platform-sharing.
**Example**:
- Input: "Hero region" -> Output: Full-width image + headline overlay.
- Input: "Body" -> Output: MDX or HTML with themed styles.
- Input: "Related" -> Output: 3-card grid of similar posts at the bottom.
**Deliver**: `src/pages/NewsArticle.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 63 [ ] — Prompt 63 — Gallery Page with Filtering
**Goal**: Build a visual masonry gallery with category-based filtering.
**Rules**:
- implement a masonry-style image grid using CSS columns or a library.
- each image should have a caption overlay and category badge on hover.
- clicking an image opens the full-screen Lightbox component.
**Example**:
- Input: "Filters" -> Output: All, Events, Campaigns, Awards tabs.
- Input: "Masonry" -> Output: Interlocking image grid with different heights.
- Input: "Pagination" -> Output: "Load More" button to fetch more images.
**Deliver**: `src/pages/Gallery.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 64 [ ] — Prompt 64 — Lightbox Component
**Goal**: build a premium, full-screen image viewer with navigation.
**Rules**:
- support keyboard arrows (Left/Right) and ESC-key for interaction.
- include a thumbnail strip at the bottom for quick navigation within the set.
- ensure a focused modal state with background blur and body scroll locking.
**Example**:
- Input: "Backdrop" -> Output: 92% opaque black with blur.
- Input: "Counter" -> Output: "Image 5 / 24" display.
- Input: "Mobile" -> Output: Swipe-to-navigate support.
**Deliver**: `src/components/ui/Lightbox.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 65 [ ] — Prompt 65 — Join Us Page
**Goal**: create a high-impact recruitment landing page for the organization.
**Rules**:
- detail 6 core benefits of joining (Leadership, Training, Networking, etc.).
- implement an FAQ accordion to address common concerns/questions.
- prominently feature the multi-step registration form.
**Example**:
- Input: "Benefits" -> Output: 3x2 grid of icon-rich cards.
- Input: "FAQ" -> Output: Toggles for Membership fee, Eligibility, etc.
- Input: "Tiers" -> Output: General, Active, and Executive membership info.
**Deliver**: `src/pages/JoinUs.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 66 [ ] — Prompt 66 — Multi-Step Join Form
**Goal**: build a comprehensive 4-step membership application form.
**Rules**:
- separate the flow: Personal -> Academic -> Location -> Motivation.
- Include a persistent progress indicator across all steps.
- use specific mobile input types (tel, date) for better UX.
**Example**:
- Input: "Progression" -> Output: Next/Previous buttons with validation.
- Input: "Motivation" -> Output: Textarea for "Why join NDM?".
- Input: "Confirmation" -> Output: Final review of all entered data.
**Deliver**: `src/components/forms/JoinForm.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 67 [ ] — Prompt 67 — FAQ Accordion Component
**Goal**: build an accessible FAQ section with smooth height transitions.
**Rules**:
- allow only one item to be expanded at a time (standard accordion behavior).
- Rotate the toggle icon (e.g., + to ×) when an item is opened.
- ensure full ARIA compliance with appropriate roles and expanded states.
**Example**:
- Input: "Question" -> Output: "Is there a membership fee?" toggle.
- Input: "Styling" -> Output: Green border on active/open item.
- Input: "Animation" -> Output: Smooth slide-down of answer content.
**Deliver**: `src/components/ui/Accordion.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 68 [ ] — Prompt 68 — Membership Benefits Section
**Goal**: highlight the unique value propositions of joining the organization.
**Rules**:
- use large icons and descriptive headers for each of the 6 benefits.
- Add a "Most Popular" or "Featured" badge to key benefits like Training.
- ensure the section is fully responsive (3 cols desktop, 1 col mobile).
**Example**:
- Input: "Benefit" -> Output: 🎓 Leadership Training - Free workshops.
- Input: "Hover state" -> Output: Background turns green, text turns white.
- Input: "Entrance" -> Output: Cards stagger animate on scroll.
**Deliver**: `src/components/join/JoinBenefits.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 69 [ ] — Prompt 69 — Member Dashboard (UI Only)
**Goal**: design a dashboard UI for logged-in members to track their activities.
**Rules**:
- implement a vertical sidebar for navigation (Dashboard, Profile, Events).
- Show a stats row for Member ID, Type, and Earned Certificates.
- provide "Quick Action" buttons for event registration and profile updates.
**Example**:
- Input: "Sidebar" -> Output: Persistent dark green menu.
- Input: "Activity feed" -> Output: List of recent news and event invites.
- Input: "Announcement" -> Output: Highlighted card for urgent notices.
**Deliver**: `src/pages/Dashboard.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 70 [ ] — Prompt 70 — Certificate Generator (UI)
**Goal**: create a professional, printable certificate preview and download UI.
**Rules**:
- design the certificate in A4 landscape with brand borders and signatures.
- use `html2canvas` or similar for downloading as a high-quality PDF.
- Include a "Share on LinkedIn" button with pre-filled certification data.
**Example**:
- Input: "Preview" -> Output: Certificate for "Leadership Excellence".
- Input: "Details" -> Output: Participant Name + Date + Unique ID.
- Input: "Export" -> Output: "Download as PDF" button.
**Deliver**: `src/components/dashboard/CertificateUI.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 71 [ ] — Prompt 71 — Photo Upload Component
**Goal**: Build a drag-and-drop zone with image preview and basic cropper.
**Rules**:
- implement file validation for size (max 2MB) and type (JPEG/PNG).
- provide a visual preview after selection with the option to remove/change.
- ensure the component triggers the mobile camera/gallery natively.
**Example**:
- Input: "Zone" -> Output: Dashed border area with upload icon.
- Input: "Preview" -> Output: Circle/Square crop area for the avatar.
- Input: "Error" -> Output: "File too large" red warning.
**Deliver**: `src/components/ui/ImageUpload.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 72 [ ] — Prompt 72 — Referral System (UI)
**Goal**: Create a gamified "Refer a Friend" section with sharing and stats.
**Rules**:
- include a "One-Click Copy" referral link with toast confirmation.
- display a list of referred friends and their current status (Pending/Joined).
- show a progress bar toward the next reward tier (e.g., T-shirt, Badge).
**Example**:
- Input: "Stats" -> Output: "Friends Referred: 5 | Points: 150".
- Input: "Share buttons" -> Output: WhatsApp, FB, and Twitter icons.
- Input: "Rewards" -> Output: 10 referrals = "Leadership Badge" unlock.
**Deliver**: `src/components/dashboard/ReferralUI.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

---

## 7. Contact, Footer & Utilities

### Task 73 [ ] — Prompt 73 — Contact Page
**Goal**: build a comprehensive contact hub with office info and map.
**Rules**:
- feature info cards for physical address, phone, and official email.
- Integrate a Google Maps embed centered on the main Dhaka office.
- implement a validated contact form that connects to an email service.
**Example**:
- Input: "Info cards" -> Output: Icons + details for each contact method.
- Input: "Form" -> Output: Name, Subject, and Message textarea.
- Input: "Response time" -> Output: "We respond within 24 hours" notice.
**Deliver**: `src/pages/Contact.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 74 [ ] — Prompt 74 — Interactive Map Component
**Goal**: Create a district-based search tool to find local organizational units.
**Rules**:
- implement a searchable list or division-based tabs for filtering branches.
- Clicking a branch should highlight it and update a mini-map iframe.
- Include branch-specific contact info (President's name, Address, Phone).
**Example**:
- Input: "Search 'Sylhet'" -> Output: List of active Sylhet units.
- Input: "Branch card" -> Output: Title, Address, and "Contact" button.
- Input: "Status" -> Output: "Active" vs "Opening Soon" badges.
**Deliver**: `src/components/contact/BranchFinder.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 75 [ ] — Prompt 75 — Dark Mode Implementation
**Goal**: implement a persistent dark mode system using CSS variables.
**Rules**:
- support system-preference detection and local-storage persistence.
- redefine variable values (Background, Surface, Text) in a `.dark` class.
- apply a smooth 0.3s transition to all affected color properties.
**Example**:
- Input: "Toggle" -> Output: Sun/Moon icon in the navbar.
- Input: "Colors" -> Output: #0A1A14 (BG) and #E8F0EC (Text) for dark.
- Input: "Images" -> Output: Slight brightness reduction via filter.
**Deliver**: `src/context/ThemeContext.jsx` and global CSS updates.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 76 [ ] — Prompt 76 — Search Functionality
**Goal**: Build a site-wide command palette or search overlay.
**Rules**:
- trigger via a keyboard shortcut (Cmd+K) or navbar search icon.
- provide real-time, grouped results (News, Events, Leaders).
- support full keyboard navigation (Arrows to select, ESC to exit).
**Example**:
- Input: "Search 'Join'" -> Output: Link to Join Us page + recent news.
- Input: "Shortcuts" -> Output: Ctrl+K mentioned in the search bar.
- Input: "No results" -> Output: Suggestion list for common terms.
**Deliver**: `src/components/ui/SearchOverlay.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 77 [ ] — Prompt 77 — Cookie Consent Banner
**Goal**: create a GDPR-compliant banner for managing tracking preferences.
**Rules**:
- display at the bottom of the screen until an action is taken.
- Allow users to "Accept All", "Reject All", or "Customize" settings.
- only load analytical scripts (e.g., GA) after explicit user consent.
**Example**:
- Input: "Banner" -> Output: Brand-green strip with policy link.
- Input: "Custom" -> Output: Toggle switches for Marketing/Analytics.
- Input: "Persistence" -> Output: Saves choice for 365 days.
**Deliver**: `src/components/ui/CookieConsent.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 78 [ ] — Prompt 78 — Print Styles
**Goal**: define specific CSS rules for high-quality page printing.
**Rules**:
- hide navigation, sidebars, and interactive elements (buttons, carousels).
- Add a specific print header with the organization logo and URL.
- force links to display their full URL after the link text in brackets.
**Example**:
- Input: "Article print" -> Output: Clean black text, no sidebar.
- Input: "Header" -> Output: "Printed from www.ndmstudent.org".
- Input: "Break rules" -> Output: Prevents breaking images across pages.
**Deliver**: `src/styles/print.css`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 79 [ ] — Prompt 79 — Error Pages
**Goal**: Design user-friendly 404 (Not Found) and 500 (Server Error) pages.
**Rules**:
- Include branded illustrations (e.g., lost student) and clear explanations.
- Provide a persistent search bar and a "Back to Home" primary button.
- add a list of "Helpful Links" to guide the user back to valid content.
**Example**:
- Input: "404 page" -> Output: "Page Not Found" + search field.
- Input: "500 page" -> Output: "Something went wrong" + retry button.
- Input: "Offline" -> Output: "You're offline" (PWA fallback).
**Deliver**: `src/pages/ErrorPage.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 80 [ ] — Prompt 80 — Accessibility Enhancements
**Goal**: Implement essential web accessibility improvements across the site.
**Rules**:
- add a "Skip to Main Content" link visible only on keyboard focus.
- Ensure all interactive elements have 3px high-visibility focus rings.
- respect `prefers-reduced-motion` by disabling non-essential animations.
**Example**:
- Input: "Focus" -> Output: Yellow/Green ring on tab focus.
- Input: "Alt tags" -> Output: Descriptive text for all images.
- Input: "Landmarks" -> Output: Proper `<main>`, `<nav>`, `<aside>`.
**Deliver**: A global accessibility stylesheet and audit checklist.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 81 [ ] — Prompt 81 — Progressive Web App Setup
**Goal**: Configure the site to be installable and offline-capable.
**Rules**:
- create a `manifest.json` with brand icons, theme colors, and display mode.
- implement a service worker with a cache-first strategy for static assets.
- provide a custom "Install App" banner that triggers after user engagement.
**Example**:
- Input: "Home screen" -> Output: Organization icon on smartphone.
- Input: "Offline" -> Output: Site loads cached content when disconnected.
- Input: "Splash" -> Output: Branded splash screen during app launch.
**Deliver**: `public/manifest.json` and service worker configuration.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 82 [ ] — Prompt 82 — Social Sharing Component
**Goal**: Build a reusable trigger for sharing content across socials.
**Rules**:
- Use the native Web Share API where available, fallback to custom modal.
- support platforms like Facebook, WhatsApp, and specialized "Copy Link".
- automatically pre-fill sharing messages with the article title and URL.
**Example**:
- Input: "Share news" -> Output: Mobile-style sharing sheet.
- Input: "WhatsApp" -> Output: Direct link to send message to kontak.
- Input: "Copy" -> Output: URL copied to clipboard + success toast.
**Deliver**: `src/components/ui/SocialShare.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

---

## 8. Performance & Accessibility

### Task 83 [ ] — Prompt 83 — Image Optimization
**Goal**: Build a highly performant `OptimizedImage` component for the organization.
**Rules**:
- provide native `loading="lazy"` with an `IntersectionObserver` fallback for older browsers.
- support WebP format detection and serve responsive images via `srcset`.
- implement an LQIP (Low Quality Image Placeholder) or blur-up effect during load.
**Example**:
- Input: "Lazy loader" -> Output: Image only loads as it enters the viewport.
- Input: "Responsive" -> Output: 400w, 800w, and 1200w variations.
- Input: "Blur-up" -> Output: Low-res thumbnail expands to sharp image.
**Deliver**: `src/components/ui/OptimizedImage.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 84 [ ] — Prompt 84 — Code Splitting & Lazy Loading
**Goal**: optimize page load times through tactical code splitting and lazy imports.
**Rules**:
- wrap all major page components in `React.lazy` and `Suspense` fallbacks.
- implement predictive prefetching for next likely pages during link hover.
- isolate heavy third-party libraries (Maps, PDF gen) into dynamic imports.
**Example**:
- Input: "Route splitting" -> Output: Individual bundles per page.
- Input: "Suspense" -> Output: Global loading bar during chunk fetch.
- Input: "Prefetch" -> Output: Chunk loading starts when user hovers a nav link.
**Deliver**: Updated `src/router/index.jsx` and `Layout.jsx`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 85 [ ] — Prompt 85 — Performance Optimization Checklist
**Goal**: apply advanced front-end performance optimizations across the codebase.
**Rules**:
- preconnect to critical domains like Google Fonts and CDNs.
- memoize expensive UI components using `React.memo` and `useMemo`.
- implement virtualization (e.g., `react-virtual`) for long lists like the District directory.
**Example**:
- Input: "Memoization" -> Output: Prevents re-renders of static sections.
- Input: "Debounce" -> Output: Rate-limits scroll and resize event handlers.
- Input: "Critical CSS" -> Output: Above-the-fold styles inlined for speed.
**Deliver**: Annotated code examples and optimization summary.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 86 [ ] — Prompt 86 — Form Validation System
**Goal**: Build a robust, real-time validation system with Zod and React Hook Form.
**Rules**:
- apply strict rules for Bangladesh phone numbers, student IDs, and districts.
- Provide real-time feedback (on-blur) with animated error messages.
- show a success checkmark for each field as it passes validation.
**Example**:
- Input: "Phone validation" -> Output: Matches `+880` or `01X` formats.
- Input: "Error feedback" -> Output: Shake animation + red helpful text.
- Input: "Submit lock" -> Output: Button remains disabled until all fields valid.
**Deliver**: `src/utils/validationSchemas.js` and usage guide.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 87 [ ] — Prompt 87 — Internationalization Setup (Bangla/English)
**Goal**: configure multi-language support (i18n) for the entire website.
**Rules**:
- utilize `i18next` for managing English and Bengali translation files.
- implement a language switcher toggle that persists choice in `localStorage`.
- ensure proper Font-family switching for Bengali characters (Hind Siliguri).
**Example**:
- Input: "Switcher" -> Output: EN/বাংলা toggle in the top navbar.
- Input: "Translation" -> Output: `t('nav.home')` mapping to both languages.
- Input: "Persist" -> Output: Site remains in selected language on refresh.
**Deliver**: `src/i18n.js` and JSON translation templates.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 88 [ ] — Prompt 88 — Analytics Integration
**Goal**: Integrate Google Analytics 4 for tracking user engagement and goals.
**Rules**:
- track page views automatically on every route change within React Router.
- implement custom event tracking for form starts, completions, and shares.
- ensure tracking only begins after the user accepts the cookie consent.
**Example**:
- Input: "Page tracking" -> Output: Route changes logged to GA4.
- Input: "Goal tracking" -> Output: `join_form_completed` event triggered.
- Input: "Custom hook" -> Output: `useAnalytics()` with `trackEvent` method.
**Deliver**: `src/hooks/useAnalytics.js` and global setup.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 89 [ ] — Prompt 89 — Error Boundary Implementation
**Goal**: protect the user experience with robust crash-handling and fallbacks.
**Rules**:
- wrap the global app and individual high-risk sections in Error Boundaries.
- provide a friendly "Section Unavailable" UI with a specific retry button.
- Log errors to the console in development and a monitoring service in production.
**Example**:
- Input: "News crash" -> Output: Only the News section shows an error state.
- Input: "Recovery" -> Output: "Try Again" button resets the local state.
- Input: "Logging" -> Output: Error details sent to an external service.
**Deliver**: `src/components/ui/ErrorBoundary.jsx` and hook.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 90 [ ] — Prompt 90 — Testing Setup
**Goal**: Configure a comprehensive testing environment for the React project.
**Rules**:
- install and setup Vitest, React Testing Library, and Mock Service Worker (MSW).
- provide example tests for the Navbar, Join Form, and Stats Counter.
- include coverage report generation and CI/CD ready configurations.
**Example**:
- Input: "Navbar test" -> Output: Verifies all 7 links are clickable.
- Input: "Form test" -> Output: Mocks API response for join submission.
- Input: "Visual test" -> Output: Confirms modal opens on image click.
**Deliver**: `vitest.config.js` and initial `__tests__/` directory.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

---

## 9. SEO & Analytics

### Task 91 [ ] — Prompt 91 — SEO Configuration
**Goal**: Optimize the website for search engines with dynamic meta data.
**Rules**:
- use React Helmet to inject unique Title, Description, and OG tags per page.
- Implement canonical URL generation to prevent duplicate content issues.
- include BreadcrumbList and Organization structured data on the homepage.
**Example**:
- Input: "OG tags" -> Output: Rich link previews on Facebook/Twitter.
- Input: "Meta desc" -> Output: Dynamic snippet based on page content.
- Input: "Canonical" -> Output: Link tag pointing to the source URL.
**Deliver**: `src/hooks/useSEO.js` and usage examples.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 92 [ ] — Prompt 92 — Open Graph Image Generator
**Goal**: Create a dynamic generator for branded news sharing images.
**Rules**:
- dynamically generate an OG image with the article title and NDM branding.
- ensure high-contrast typography and prominent logo placement in the image.
- support a default fallback image for pages without specific articles.
**Example**:
- Input: "Template" -> Output: Green background + Article Headline.
- Input: "Node script" -> Output: Pre-renders images for all news posts.
- Input: "Sharing" -> Output: Branded preview on social platforms.
**Deliver**: Image generation script for public asset production.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 93 [ ] — Prompt 93 — Sitemap & robots.txt
**Goal**: provide crawlers with a clear map of the site's structure and rules.
**Rules**:
- generate a `sitemap.xml` with proper priority and frequency for all pages.
- Create a `robots.txt` that allows crawling of public pages while blocking dash.
- automate the generation process for dynamic news article slugs.
**Example**:
- Input: "Sitemap" -> Output: List of all 100+ site URLs with metadata.
- Input: "Robots" -> Output: Disallow: /dashboard entries.
- Input: "Deployment" -> Output: Files served from the root publicly.
**Deliver**: `public/sitemap.xml` and `public/robots.txt` templates.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 94 [ ] — Prompt 94 — Performance Monitoring
**Goal**: implement real-time monitoring of Core Web Vitals (LCP, FID, CLS).
**Rules**:
- use the `web-vitals` library to capture metrics for every user session.
- report metrics to GA4 for long-term field data analysis.
- add custom performance marks for critical user actions (e.g., hero paint).
**Example**:
- Input: "Metrics" -> Output: LCP and CLS scores logged per visit.
- Input: "Threshold" -> Output: Warnings if TBT exceeds 200ms.
- Input: "CI check" -> Output: Build fails if perf budget is exceeded.
**Deliver**: `src/utils/performance.js` and implementation guide.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 95 [ ] — Prompt 95 — Structured Data / Schema.org
**Goal**: Inject JSON-LD structured data for rich search engine results.
**Rules**:
- implement specific schemas for Organization, Article, and Event pages.
- ensure all scripts are injected into the `<head>` via React Helmet.
- validate the output against Google's Rich Results Test tool.
**Example**:
- Input: "Event schema" -> Output: Search shows date/location in Google.
- Input: "Article schema" -> Output: Headlines showing in Top Stories.
- Input: "Org info" -> Output: Logo and social links in Google Knowledge.
**Deliver**: Comprehensive schema injection utility.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

---

## 10. Testing & Deployment

### Task 96 [ ] — Prompt 96 — Unit Tests (Components)
**Goal**: write granular tests for individual UI components and their logic.
**Rules**:
- verify rendering, state changes, and event handling for the Navbar.
- test the countdown logic and animation trigger of the Stats Counter.
- Ensure form validation rules are correctly enforced in the Join Form.
**Example**:
- Input: "Navbar.test" -> Output: Verifies hamburger menu toggles menu.
- Input: "Counter.test" -> Output: Checks if target value is reached.
- Input: "Badge.test" -> Output: Confirms correct color variant renders.
**Deliver**: Comprehensive unit test suite in `__tests__/components`.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 97 [ ] — Prompt 97 — Integration Tests
**Goal**: test critical user journeys and cross-component interactions.
**Rules**:
- simulate a full "Join Us" flow from empty form to success message.
- verify the Lightbox navigation works as expected within the Gallery page.
- Test dark mode persistence and appearance across site navigation.
**Example**:
- Input: "Join flow" -> Output: Enters data -> clicks -> success check.
- Input: "Lightbox flow" -> Output: Clicks image -> opens -> clicks next.
- Input: "Theme flow" -> Output: Toggle -> Reload -> Dark theme remains.
**Deliver**: Integration test files and MSW handlers.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 98 [ ] — Prompt 98 — Deployment Configuration
**Goal**: Set up automated CI/CD pipelines and production hosting rules.
**Rules**:
- provide `vercel.json` or `netlify.toml` with SPA redirect configurations.
- Create a GitHub Actions workflow for linting, testing, and building.
- implement a Lighthouse builder check that fails on low performance scores.
**Example**:
- Input: "Vercel config" -> Output: Catch-all routes to `index.html`.
- Input: "CI workflow" -> Output: `.github/workflows/deploy.yml` content.
- Input: "Domain" -> Output: SSL and custom domain setup instructions.
**Deliver**: Full deployment configuration for Vercel/Netlify.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 99 [ ] — Prompt 99 — Documentation
**Goal**: write clear, professional documentation for the entire project lifecycle.
**Rules**:
- create a comprehensive `README.md` with setup, stack, and deploy steps.
- document every UI component in a `COMPONENTS.md` with props and usage.
- follow a consistent CHANGELOG and style guide for future contributors.
**Example**:
- Input: "README" -> Output: Prerequisites, Install, and Scripts guide.
- Input: "Props table" -> Output: Markdown table with type and default.
- Input: "Style guide" -> Output: Naming conventions and folder rules.
**Deliver**: Markdown documentation suite in the project root.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

### Task 100 [ ] — Prompt 100 — Full Stack Upgrade Path
**Goal**: provide a roadmap for moving from a static site to a full-stack app.
**Rules**:
- detail the migration to a backend like Node.js/Express or Next.js.
- design a database schema (PostgreSQL) for members, events, and news.
- integrate a CMS (Sanity) and Authentication (Supabase Auth) system.
**Example**:
- Input: "DB Schema" -> Output: SQL table structure for Members.
- Input: "Future services" -> Output: Resend (Email), Cloudinary (Images).
- Input: "Migration" -> Output: Step-by-step transition plan and BDT cost.
**Deliver**: High-level architecture diagram and migration document.
**Then ask**: "Before giving code, list the possible mistakes and confirm the rules NSM-100"

---

## 🏁 Quick Reference Card

| Category | Tasks | Focus |
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

*© 2026 NDM Student Movement — Professional AI Prompting Edition*
