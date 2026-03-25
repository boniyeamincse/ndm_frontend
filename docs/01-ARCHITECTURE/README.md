# 01-ARCHITECTURE

## 🏗️ System Architecture & Design

This section covers the complete system architecture, design patterns, and high-level overview of the NDM Student Wing Organization Management System.

---

## 📍 What's in This Section?

This is where you learn **how the system works at a high level**.

**Who should read this?**
- ✅ Backend developers (all must read)
- ✅ Frontend developers (essential reading)
- ✅ Database admins (design context)
- ✅ Architects (complete overview)
- ✅ QA engineers (system behavior)

---

## 📚 Files in This Section

| File | Purpose | Audience | Time |
|------|---------|----------|------|
| **README.md** | This file - architecture overview | Everyone | 5 min |
| **SYSTEM_OVERVIEW.md** | Complete system design & blueprint | Everyone | 45 min |
| **DESIGN_PATTERNS.md** | Architectural patterns used | Backend, Arch | 30 min |
| **DATA_FLOW.md** | How data flows through system | Everyone | 20 min |
| **SECURITY_ARCHITECTURE.md** | JWT, RBAC, permissions | Backend, DevOps | 25 min |

---

## 🎯 Key Architecture Concepts

### 1. **Layered Architecture**
```
┌─────────────────────┐
│   API Layer         │  REST endpoints, validation
├─────────────────────┤
│   Service Layer     │  Business logic, transactions
├─────────────────────┤
│   Repository Layer  │  Data access, queries
├─────────────────────┤
│   Database Layer    │  PostgreSQL, relationships
└─────────────────────┘
```

### 2. **Dual Role System**
- **Political Roles:** President, Secretary, etc. (organizational)
- **System Roles:** Admin, Moderator, Member (technical)

### 3. **Hierarchical Organization**
- 6-level pyramid: Central → Division → District → Upazila → Union → Campus
- Each level has specific permissions and responsibilities

### 4. **RBAC (Role-Based Access Control)**
- Spatie Permission package
- Fine-grained permissions per role
- Dynamic role assignment with automatic relief

---

## 📖 Reading Order

### For Backend Developers (3-4 hours)
1. **This README** (5 min)
2. **SYSTEM_OVERVIEW.md** (45 min) - Understand the whole system
3. **DESIGN_PATTERNS.md** (30 min) - How we build things
4. **DATA_FLOW.md** (20 min) - See data in motion
5. **SECURITY_ARCHITECTURE.md** (25 min) - Auth & permissions
6. → Go to **../02-DATABASE/SYSTEM_OVERVIEW.md** (continue)

### For Frontend Developers (2-3 hours)
1. **This README** (5 min)
2. **SYSTEM_OVERVIEW.md** (45 min) - What are we building?
3. **DATA_FLOW.md** (20 min) - How API interactions work
4. **SECURITY_ARCHITECTURE.md** (25 min) - JWT, login flow
5. → Go to **../04-API/API_ROUTES_COMPLETE.md** (API reference)

### For Architects (4-5 hours)
1. Read everything in this section (all files)
2. Go to **../02-DATABASE/DATABASE_SCHEMA_GUIDE.md** (schema design)
3. Go to **../03-MODELS/ELOQUENT_MODELS_GUIDE.md** (relationships)
4. Go to **../04-API/CONTROLLERS_SERVICE_GUIDE.md** (business logic)
5. Go to **../05-TESTING-SCALABILITY/TESTING_STRATEGY.md** (QA approach)

---

## 💡 Core Principles

### Separation of Concerns
Each layer has ONE responsibility:
- **API Layer:** Routes, request validation, response formatting
- **Service Layer:** Business logic, transactions, decisions
- **Repository Layer:** Database queries, data retrieval
- **Database:** Data persistence

### DRY (Don't Repeat Yourself)
- Shared services for common operations
- Trait mixins for repeated functionality
- Reusable query scopes

### SOLID Principles
- **S:** Single responsibility per class
- **O:** Open for extension, closed for modification
- **L:** Liskov substitution principle
- **I:** Interface segregation
- **D:** Dependency injection

### Clean Code
- Descriptive naming
- Small, focused functions
- Clear documentation
- Tested thoroughly

---

## 🔄 Component Interactions

```
┌──────────────┐
│   Client     │
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│  API Routes (api.php)    │
│  - Routes definitions    │
│  - Middleware stack      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Controllers             │
│  - Validate request      │
│  - Call services         │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Services                │
│  - Business logic        │
│  - Transactions          │
│  - Side effects          │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Repositories/Models     │
│  - Data queries          │
│  - Relationships         │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Database (PostgreSQL)   │
└──────────────────────────┘
```

---

## 🗺️ Quick Navigation

**Want to understand...**

- Complete system design → **SYSTEM_OVERVIEW.md**
- How we structure code → **DESIGN_PATTERNS.md**
- API data flow → **DATA_FLOW.md**
- Authentication & permissions → **SECURITY_ARCHITECTURE.md**
- Database design → **../02-DATABASE/**
- API endpoints → **../04-API/API_ROUTES_COMPLETE.md**
- How to write a feature → **../07-GUIDES/BUILDING_A_FEATURE.md**

---

## ✅ Architecture Checklist

After reading this section, you should know:

- [ ] What are the 6 levels of organization hierarchy?
- [ ] What's the difference between political & system roles?
- [ ] How does RBAC work in this system?
- [ ] What are the main components and their responsibilities?
- [ ] How does JWT authentication work?
- [ ] What is a Service class and why do we use them?
- [ ] How do transactions ensure data consistency?
- [ ] What is a Repository pattern?

---

## 📚 Related Sections

| Need Info About | Go To |
|-----------------|-------|
| Database tables & schema | **../02-DATABASE/** |
| Models & relationships | **../03-MODELS/** |
| API endpoints | **../04-API/** |
| Testing approach | **../05-TESTING-SCALABILITY/** |
| Deployment | **../06-DEPLOYMENT/** |
| Guides & examples | **../07-GUIDES/** |

---

## 🎓 Learning Outcomes

After completing this section, you'll be able to:

✅ Draw the system architecture diagram  
✅ Explain role-based access control  
✅ Describe the data flow from API to database  
✅ Understand why we use services  
✅ Implement JWT authentication flow  
✅ Write secure API endpoints  
✅ Design new features using the architecture  

---

## 💬 Common Questions

**Q: Do I need to read all files in order?**  
A: Not necessarily. Use the reading order for your role above.

**Q: Can I skip DESIGN_PATTERNS.md?**  
A: Only if you're not writing code. Architects and devs should read it.

**Q: What's the most important thing to understand?**  
A: That we separate concerns into layers. Each layer has one job.

**Q: How does this differ from other Laravel apps?**  
A: We use Service layer explicitly (not everyone does). This improves testability.

---

## 🚀 Next Steps

1. **Read SYSTEM_OVERVIEW.md** (45 min)
2. **Read DESIGN_PATTERNS.md** (30 min)
3. **Read DATA_FLOW.md** (20 min)
4. **Then choose your path:**
   - Backend Dev → SECURITY_ARCHITECTURE.md → ../02-DATABASE/
   - Frontend Dev → ../04-API/API_ROUTES_COMPLETE.md
   - Architect → Read all remaining sections in order

---

**You're now in the architecture section. Take your time understanding these concepts - they guide all implementation!**

→ Next: Read **SYSTEM_OVERVIEW.md**

---

*Architecture is the foundation. Build it solid, and everything else is easier!*
