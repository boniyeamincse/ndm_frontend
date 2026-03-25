# 04-API

## 🔌 API Routes, Controllers & Services

This section covers all REST API endpoints, request handling, controllers, and business logic services.

---

## 📍 What's in This Section?

Learn how to **build, test, and document** REST APIs for the NDM system.

**Who should read this?**
- ✅ Backend developers (must read)
- ✅ Frontend developers (API reference needed)
- ✅ Mobile developers (endpoint documentation)
- ✅ QA engineers (testing endpoints)
- ✅ DevOps (rate limiting, caching config)

---

## 📚 Files in This Section

| File | Purpose | Audience | Time |
|------|---------|----------|------|
| **README.md** | This file - API overview | Everyone | 5 min |
| **API_ROUTES_COMPLETE.md** | All 35+ endpoints documented | Backend, Frontend | 60 min |
| **CONTROLLERS_SERVICE_GUIDE.md** | Controller & service patterns | Backend | 45 min |
| **RBAC_ACCESS_MATRIX_NDSM.md** | Final production roles, permissions, and scope rules | Backend, Architect | 30 min |
| **REQUEST_VALIDATION.md** | Input validation & rules | Backend | 25 min |
| **ERROR_HANDLING_RESPONSES.md** | Error codes & response formats | Everyone | 20 min |

---

## 🎯 API Overview

### Technology Stack
- **Framework:** Laravel 13
- **Auth:** JWT (Json Web Tokens)
- **Rate Limiting:** Built-in throttle middleware
- **CORS:** Configured for multi-domain
- **Documentation:** OpenAPI/Swagger ready

### API Base URL
```
Development:  http://localhost:8000/api/v1
Staging:      https://staging-api.ndm.org.bd/api/v1
Production:   https://api.ndm.org.bd/api/v1
```

### Authentication
All endpoints (except login) require JWT token:
```
Authorization: Bearer <jwt_token>
```

---

## 📊 API Endpoints Summary

### Authentication (2 endpoints)
```
POST   /auth/login              - Login with email/password
POST   /auth/logout             - Logout current user
```

### Member Management (8 endpoints)
```
GET    /members                 - List all members
POST   /members                 - Create new member
GET    /members/{id}            - Get member details
PUT    /members/{id}            - Update member
DELETE /members/{id}            - Delete member
GET    /members/{id}/roles      - Get member roles
POST   /members/{id}/roles      - Assign roles
DELETE /members/{id}/roles/{rid} - Remove role
```

### Role & Permission Management (6 endpoints)
```
GET    /roles                   - List roles
GET    /roles/{id}              - Get role details
GET    /permissions             - List permissions
POST   /members/{id}/assign-role - Assign political role
POST   /members/{id}/relieve-role - Relieve from role
GET    /members/{id}/position-history - Audit trail
```

### Organizational Units (5 endpoints)
```
GET    /units                   - List units (all levels)
GET    /units/{id}              - Get unit details
GET    /units/{id}/members      - Unit members
POST   /units                   - Create unit
PUT    /units/{id}              - Update unit
```

### Committees (4 endpoints)
```
GET    /committees              - List committees
POST   /committees              - Create committee
GET    /committees/{id}         - Get committee
PUT    /committees/{id}/members - Update members
```

### Dashboard (3 endpoints)
```
GET    /dashboard/stats         - General statistics
GET    /dashboard/hierarchy     - Org structure
GET    /dashboard/recent-activity - Recent changes
```

### Admin Operations (7 endpoints)
```
POST   /admin/seed-test-data    - Create test members
DELETE /admin/members/{id}      - Force delete
GET    /admin/audit-log         - Complete audit trail
POST   /admin/permissions/sync  - Refreshes permissions
POST   /admin/cache/clear       - Clear system cache
GET    /admin/system-health     - Health check
GET    /admin/database-stats    - DB statistics
```

**Total:** 35+ documented endpoints

---

## 🏗️ API Architecture

### Request Flow
```
HTTP Request
     ↓
Route (api.php)
     ↓
Middleware Stack (auth, CORS, throttle)
     ↓
Controller
     ├─ Validate request
     ├─ Authorize user
     └─ Call service
     ↓
Service (Business Logic)
     ├─ Process data
     ├─ Validate business rules
     ├─ Call repository/models
     └─ Handle transactions
     ↓
Model/Repository (Data Access)
     ├─ Query database
     └─ Build query
     ↓
Database (PostgreSQL)
     ↓
Response Built & Returned
```

### Response Format
All API responses follow consistent JSON structure:

```json
{
  "success": true,
  "code": 200,
  "message": "Operation successful",
  "data": {
    "id": 1,
    "name": "Ahmed Khan",
    "roles": ["organizer"]
  }
}
```

Error response:
```json
{
  "success": false,
  "code": 422,
  "message": "Validation failed",
  "errors": {
    "email": ["Email already exists"],
    "phone": ["Invalid phone format"]
  }
}
```

---

## 📖 Reading Order

### For Backend Developers (2.5 hours)
1. **This README** (5 min)
2. **API_ROUTES_COMPLETE.md** (60 min) - All endpoints
3. **CONTROLLERS_SERVICE_GUIDE.md** (45 min) - How to build
4. **REQUEST_VALIDATION.md** (25 min) - Input validation
5. **ERROR_HANDLING_RESPONSES.md** (20 min) - Error handling

### For Frontend Developers (1 hour)
1. **This README** (5 min)
2. **API_ROUTES_COMPLETE.md** (50 min) - Endpoint reference
3. **ERROR_HANDLING_RESPONSES.md** (15 min) - Error codes
4. Start building to make API calls

### For QA Engineers (1.5 hours)
1. **This README** (5 min)
2. **API_ROUTES_COMPLETE.md** (60 min) - What to test
3. **REQUEST_VALIDATION.md** (25 min) - Test cases
4. **ERROR_HANDLING_RESPONSES.md** (20 min) - Error scenarios

---

## 💡 API Design Principles

### RESTful Design
- **GET** for reading data
- **POST** for creating data
- **PUT** for updating entire resource
- **PATCH** for partial updates
- **DELETE** for removing data

### Versioning
API is versioned as `v1` in the URL path:
```
/api/v1/members  (current)
/api/v2/members  (future)
```

### Pagination
List endpoints support pagination:
```
GET /members?page=1&per_page=20
```

### Filtering
Most list endpoints support filtering:
```
GET /members?role=organizer&status=active&unit_id=5
```

### Sorting
Control sort order:
```
GET /members?sort=name,-created_at  (ascending name, descending date)
```

---

## 🔒 Security Features

### Authentication
- JWT tokens with short expiry (15 min access, 7 day refresh)
- Email verification on signup
- Password hashing with bcrypt

### Authorization
- Role-based access control (RBAC)
- Permission checks per endpoint
- Unit-based access (can only access own unit's members)

### Rate Limiting
- 60 requests/minute per IP
- 1000 requests/hour per user
- Stricter limits on auth endpoints

### Input Validation
- All inputs validated server-side
- XSS prevention
- SQL injection prevention

### Response Security
- No sensitive data in errors
- Proper HTTP status codes
- CORS configured correctly

---

## 🗺️ Quick Navigation

**Want to...**

- See all endpoints → **API_ROUTES_COMPLETE.md**
- Build a new endpoint → **CONTROLLERS_SERVICE_GUIDE.md**
- Implement role/permission policy → **RBAC_ACCESS_MATRIX_NDSM.md**
- Validate inputs → **REQUEST_VALIDATION.md**
- Handle errors → **ERROR_HANDLING_RESPONSES.md**
- Add caching → **../05-TESTING-SCALABILITY/**
- Deploy API → **../06-DEPLOYMENT/**
- Test API → **../05-TESTING-SCALABILITY/**

---

## ✅ API Knowledge Checklist

After reading this section, you should know:

- [ ] How many endpoints exist and what they do
- [ ] JWT authentication flow
- [ ] How validation works
- [ ] Error codes and what they mean
- [ ] How to build a new endpoint
- [ ] Service layer purpose
- [ ] When to use POST vs PUT
- [ ] Rate limiting rules
- [ ] CORS configuration

---

## 🧪 Testing the API

### Using cURL
```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ndm.org.bd","password":"password"}'

# Get token from response, then use it:
curl -X GET http://localhost:8000/api/v1/members \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman
1. Import collection from `/docs/postman/`
2. Set token variable
3. Test all endpoints

### Running Integration Tests
```bash
php artisan test tests/Feature/Api/
```

---

## 💻 Common Code Examples

### Building an Endpoint
```php
// Route
Route::post('/members/{id}/assign-role', [MemberController::class, 'assignRole']);

// Controller
public function assignRole(Request $request, $id) {
    $request->validate(['role_id' => 'required|integer']);
    $this->authorize('assignRole', Member::find($id));
    
    $result = $this->roleService->assignRole($id, $request->role_id);
    
    return response()->json($result);
}

// Service
public function assignRole($memberId, $roleId) {
    return DB::transaction(function () use ($memberId, $roleId) {
        // Business logic here
        $member = Member::findOrFail($memberId);
        $member->roles()->attach($roleId);
        return ['success' => true];
    });
}
```

---

## 🚀 Next Steps

1. Read **API_ROUTES_COMPLETE.md** (60 min)
2. Read **CONTROLLERS_SERVICE_GUIDE.md** (45 min)
3. Read **REQUEST_VALIDATION.md** (25 min)
4. Read **ERROR_HANDLING_RESPONSES.md** (20 min)
5. Start building endpoints:
   - Copy pattern from existing endpoints
   - Follow validation rules
   - Test thoroughly
   - Reference error codes

---

**The API is your system's interface to the world. Make it great!**

→ Next: Read **API_ROUTES_COMPLETE.md**

---

*Well-designed APIs are self-explanatory and a pleasure to use!*
