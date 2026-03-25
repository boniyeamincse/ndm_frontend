# NDM Blog Management Module — Work Tracking

_Last updated: 2026-03-25_

## Scope
Implement a full-phase blog management system and connect public news listing to live API data.

## Delivery Status
- [x] Database schema created for blog posts
- [x] Admin API CRUD implemented
- [x] Public API endpoints for published news implemented
- [x] Admin dashboard blog management page implemented
- [x] Public `/news` page connected to backend API
- [x] Frontend service layer for blog module added
- [x] Demo blog posts seeded for local testing

## Backend Changes
### Migration
- `ndm-api/database/migrations/2026_03_25_140000_create_blog_posts_table.php`

### Model
- `ndm-api/app/Models/BlogPost.php`

### Seeders
- `ndm-api/database/seeders/BlogPostSeeder.php`
- `ndm-api/database/seeders/AdminSeeder.php` updated to idempotent `updateOrCreate`

### Controllers
- Admin CRUD: `ndm-api/app/Http/Controllers/API/Admin/BlogPostController.php`
- Public news feed: `ndm-api/app/Http/Controllers/API/NewsController.php`

### Routes
- Public:
  - `GET /api/news`
  - `GET /api/news/{slug}`
- Admin:
  - `GET /api/admin/blog-posts`
  - `POST /api/admin/blog-posts`
  - `GET /api/admin/blog-posts/{id}`
  - `PUT /api/admin/blog-posts/{id}`
  - `DELETE /api/admin/blog-posts/{id}`

## Frontend Changes
### Admin
- `viva-react/src/pages/dashboard/admin/BlogManagement.jsx`
  - Create post
  - Edit post
  - Delete post
  - Publish / unpublish quick actions
  - Status filter + search
  - Basic content stats

### Public News
- `viva-react/src/pages/News.jsx`
  - Fetches from `GET /api/news`
  - Displays loading skeletons
  - Uses fallback static data when API is unavailable

### Service Layer
- `viva-react/src/services/blogService.js`

## QA Checklist
- [ ] Run backend migration: `php artisan migrate`
- [ ] Seed demo posts: `php artisan db:seed --class=BlogPostSeeder`
- [ ] Verify admin blog CRUD with admin account
- [ ] Verify only published posts appear on `/news`
- [ ] Verify news list updates after publishing from admin panel
- [ ] Verify delete/archive behavior

## Next Enhancements (Optional)
- Rich text editor for blog content
- Image upload API/storage instead of URL-only cover image
- Single news details page (`/news/:slug`)
- Category pages and tag filters on public site
