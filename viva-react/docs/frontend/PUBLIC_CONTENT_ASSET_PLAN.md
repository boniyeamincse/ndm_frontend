# Public Content Asset Plan (Task 84)

## Goal

Standardize image and media ownership for Task 07 public pages so content can be uploaded without code changes.

## Current State Snapshot

- Public routes/pages are already implemented and lazy-loaded.
- Core fallback content is in `src/data/index.js`.
- Public page visuals currently rely mostly on gradients, text blocks, and mock/fallback objects.
- There is no finalized shared public media directory yet.

## Directory Strategy

Create a static media structure under:

`viva-react/public/images/`

Proposed subfolders:

- `branding/` (logo, marks, favicon variants)
- `home/` (hero and section visuals)
- `about/` (movement history timeline visuals)
- `leadership/` (leader portraits)
- `activities/` (program/event covers)
- `news/` (article cover images)
- `gallery/` (photo and campaign media)
- `campuses/` (campus/chapter visuals)

## Asset Inventory by Public Page

### Home (`/`)

- hero background image (desktop)
- hero background image (mobile)
- mission/program support visuals (3)

### About (`/about`)

- timeline milestone images (3-5)
- mission/vision illustration set (2)

### Leadership (`/leadership`)

- portrait photos for each listed leader
- optional default avatar placeholder

### Activities (`/activities`)

- activity thumbnail for each activity card
- fallback campaign image for missing records

### News (`/news`)

- cover images per article
- featured-news fallback cover

### Gallery (`/gallery`)

- category images (events, campaigns, awards)
- optional lightbox-ready originals (if modal preview is enabled later)

### Contact (`/contact`)

- office/location cover image (optional)

### Directory / Member Profile

- profile avatar placeholders for missing photos

## Naming Convention

- lowercase kebab-case filenames
- include page and context prefixes where possible
- examples:
  - `home-hero-desktop.jpg`
  - `leader-bobby-hajjaj.jpg`
  - `news-convention-2026.jpg`

## Format and Optimization Rules

- Prefer `webp` for web delivery when possible.
- Keep legacy `jpg/png` only when source constraints require it.
- Target widths:
  - hero: 1600+
  - card covers: 800-1200
  - thumbnails: 400-800
- Compress before upload (quality target around 70-82 for photos).

## Data Contract Alignment

`src/data/index.js` and API payloads should point to stable paths under `/images/...`.

Examples:

- `/images/leadership/leader-bobby-hajjaj.jpg`
- `/images/news/news-convention-2026.webp`
- `/images/gallery/gallery-dhaka-division-meet.webp`

## Acceptance Checklist

- All Task 07 public pages render without broken image paths.
- Fallback placeholders exist for leadership, news, gallery, and profile avatars.
- At least one optimized image exists for each public page category listed above.
- Naming convention is applied consistently.
- Media references in seed/fallback data resolve correctly.
