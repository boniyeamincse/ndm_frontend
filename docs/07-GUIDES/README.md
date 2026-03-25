# 07-GUIDES

## 📚 Quick Reference Guides & How-To Articles

This section contains practical guides, troubleshooting tips, common tasks, and quick references.

---

## 📍 What's in This Section?

Find **practical solutions** to common tasks and problems.

**Who should read this?**
- ✅ Everyone (when you need to DO something)
- ✅ Quick reference for common tasks
- ✅ Troubleshooting problems
- ✅ Learning by example

---

## 📚 Files in This Section

| File | Purpose | Audience | Time |
|------|---------|----------|------|
| **README.md** | This file - guides overview | Everyone | 5 min |
| **QUICK_REFERENCE.md** | Common commands & code | Everyone | 30 min |
| **BUILDING_A_FEATURE.md** | End-to-end feature guide | Backend | 40 min |
| **TROUBLESHOOTING.md** | Common problems & solutions | Everyone | 30 min |
| **DATABASE_SETUP.md** | Database initialization | DevOps, Backend | 20 min |
| **LOCAL_DEVELOPMENT_SETUP.md** | Dev environment setup | Backend, Frontend | 25 min |
| **CODE_EXAMPLES.md** | Copy-paste ready code | Backend | 40 min |
| **CHEATSHEET.md** | Artisan commands, queries | Everyone | 15 min |

---

## 🎯 Common Tasks

### Starting Development
1. **Clone the repository**
   - See: LOCAL_DEVELOPMENT_SETUP.md
   - Time: 15 min

2. **Set up database**
   - See: DATABASE_SETUP.md
   - Time: 10 min

3. **Create test data**
   - See: QUICK_REFERENCE.md
   - Command: `php artisan db:seed --class=TestMembersSeeder`

4. **Start dev server**
   - See: LOCAL_DEVELOPMENT_SETUP.md
   - Command: `php artisan serve`

### Building a Feature
1. **Create migration**
   - See: BUILDING_A_FEATURE.md (Step 1)
   - Command: `php artisan make:migration`

2. **Create model**
   - See: BUILDING_A_FEATURE.md (Step 2)
   - Command: `php artisan make:model Member -m`

3. **Create service**
   - See: BUILDING_A_FEATURE.md (Step 3)
   - Command: `php artisan make:class Services/MemberService`

4. **Create controller**
   - See: BUILDING_A_FEATURE.md (Step 4)
   - Command: `php artisan make:controller MemberController`

5. **Add routes**
   - See: BUILDING_A_FEATURE.md (Step 5)
   - File: `routes/api.php`

6. **Write tests**
   - See: BUILDING_A_FEATURE.md (Step 6)
   - Command: `php artisan make:test MemberTest`

7. **Deploy**
   - See: ../06-DEPLOYMENT/DEPLOYMENT_CHECKLIST.md

### Common Problems
1. **Tests failing**
   - See: TROUBLESHOOTING.md
   
2. **Database connection error**
   - See: TROUBLESHOOTING.md → Database section

3. **Permission denied error**
   - See: TROUBLESHOOTING.md → Permissions section

4. **Cache issues**
   - See: TROUBLESHOOTING.md → Cache section

---

## 📖 Reading Order by Task

### New to Project (1 hour)
1. LOCAL_DEVELOPMENT_SETUP.md (25 min)
2. DATABASE_SETUP.md (20 min)
3. QUICK_REFERENCE.md (15 min)
4. Ready to code!

### Adding New Feature (2.5 hours)
1. BUILDING_A_FEATURE.md (40 min)
2. CODE_EXAMPLES.md (40 min)
3. QUICK_REFERENCE.md (15 min)
4. ../04-API/CONTROLLERS_SERVICE_GUIDE.md (30 min)
5. Start building!

### Stuck? Troubleshooting (30 min)
1. TROUBLESHOOTING.md (30 min)
2. CHEATSHEET.md (10 min)

### Daily Workflow (5 min)
1. CHEATSHEET.md (bookmark this!)
2. QUICK_REFERENCE.md (common commands)

---

## 🔥 Most Popular Guides

### #1: How to Add a New API Endpoint
→ See: BUILDING_A_FEATURE.md (Step-by-step)

### #2: Set Up Local Development
→ See: LOCAL_DEVELOPMENT_SETUP.md

### #3: Common Artisan Commands
→ See: CHEATSHEET.md

### #4: Database Schema
→ See: ../02-DATABASE/DATABASE_SCHEMA_GUIDE.md

### #5: Fixing Permission Errors
→ See: TROUBLESHOOTING.md

---

## 💡 Quick Answers

**Q: How do I add a new field to database?**
A: Create migration → BUILDING_A_FEATURE.md → DATABASE_SETUP.md

**Q: How do I test my code?**
A: See QUICK_REFERENCE.md → "Running Tests"

**Q: How do I deploy?**
A: See ../06-DEPLOYMENT/DEPLOYMENT_CHECKLIST.md

**Q: Database not connecting?**
A: See TROUBLESHOOTING.md → "Database Connection"

**Q: Artisan command syntax?**
A: See CHEATSHEET.md

---

## 🗺️ Quick Navigation

| Need | File |
|------|------|
| Copy-paste code | CODE_EXAMPLES.md |
| Common commands | CHEATSHEET.md |
| Build new feature end-to-end | BUILDING_A_FEATURE.md |
| Database commands | DATABASE_SETUP.md or QUICK_REFERENCE.md |
| Stuck, something broken | TROUBLESHOOTING.md |
| Dev setup | LOCAL_DEVELOPMENT_SETUP.md |
| Syntax reference | QUICK_REFERENCE.md |

---

## 📚 Other Reference Sections

For more specific topics, see other sections:

| Topic | Go To |
|-------|-------|
| API endpoint details | ../04-API/API_ROUTES_COMPLETE.md |
| Database schema | ../02-DATABASE/DATABASE_SCHEMA_GUIDE.md |
| Models & relationships | ../03-MODELS/ELOQUENT_MODELS_GUIDE.md |
| Architecture | ../01-ARCHITECTURE/SYSTEM_OVERVIEW.md |
| Testing | ../05-TESTING-SCALABILITY/TESTING_STRATEGY.md |
| Deployment | ../06-DEPLOYMENT/DEPLOYMENT_CHECKLIST.md |

---

## ✅ Reference Checklist

Save these for quick access:

- [ ] Bookmark CHEATSHEET.md (daily reference)
- [ ] Bookmark QUICK_REFERENCE.md (common patterns)
- [ ] Bookmark TROUBLESHOOTING.md (when stuck)
- [ ] Bookmark BUILDING_A_FEATURE.md (building features)
- [ ] Bookmark ../04-API/API_ROUTES_COMPLETE.md (API reference)
- [ ] Bookmark ../02-DATABASE/DATABASE_SCHEMA_GUIDE.md (DB schema)

---

## 💻 Development Workflow

### Morning Start
```bash
# 1. Make sure latest code
git pull origin develop

# 2. Install any new dependencies
composer install

# 3. Run migrations (if any)
php artisan migrate

# 4. Start development server
php artisan serve

# 5. Check everything works
curl http://localhost:8000/api/v1/health
```

### During Development
1. Make changes in your branch
2. Run tests: `php artisan test tests/`
3. Check code: `php artisan code:analyze`
4. Commit: `git commit -m "Clear message"`

### Before Committing
1. Run all tests: `php artisan test`
2. Check coverage: `php artisan test --coverage`
3. Format code: `php artisan pint`
4. Commit to feature branch

### Before Pushing
1. Rebase on main: `git rebase develop`
2. Resolve conflicts if any
3. Push: `git push origin feature/your-feature`
4. Create pull request

### End of Day
```bash
# Commit your work
git add .
git commit -m "WIP: feature name"
git push

# OR stash if not ready
git stash
```

---

## 🚀 Next Steps

1. Pick your first task from "Common Tasks" above
2. Find the relevant guide
3. Follow steps
4. Check TROUBLESHOOTING if stuck
5. Ask team if still blocked

---

## 📞 Still Need Help?

1. **Check TROUBLESHOOTING.md first** - 90% of problems are there
2. **Search main docs index** - ../README.md has everything
3. **Look for code examples** - CODE_EXAMPLES.md
4. **Ask team** - Someone solved it before
5. **Consult original docs** - Laravel docs, PostgreSQL docs

---

**These guides are here to make you productive fast. Use them!**

→ Pick a guide based on what you need to do ↑

---

*The sign of good documentation is that beginners can get productive fast!*
