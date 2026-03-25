# 03-MODELS

## 📦 Eloquent Models & Relationships

This section covers all data models, relationships, query scopes, and model methods for the NDM system.

---

## 📍 What's in This Section?

Learn how to **interact with data** using Eloquent models and relationships.

**Who should read this?**
- ✅ Backend developers (must read)
- ✅ Frontend developers (reference)
- ✅ Database admins (relationships understanding)
- ✅ Architects (model design decisions)

---

## 📚 Files in This Section

| File | Purpose | Audience | Time |
|------|---------|----------|------|
| **README.md** | This file - models overview | Everyone | 5 min |
| **ELOQUENT_MODELS_GUIDE.md** | All 6 core models | Backend, Frontend | 60 min |
| **RELATIONSHIPS_DEEP_DIVE.md** | Understanding model relationships | Backend | 30 min |
| **QUERY_SCOPES_AND_HELPERS.md** | Scopes, methods, helpers | Backend | 25 min |
| **CASTING_AND_ATTRIBUTES.md** | Type casting, attributes | Backend | 20 min |

---

## 🎯 Core Models Overview

### Model Hierarchy
```
┌─────────────────────────────────────────┐
│  Core Data Models                       │
├─────────────────────────────────────────┤
│ 1. User (auth/system user)              │
│ 2. Member (profile)                     │
│ 3. OrganizationalUnit (hierarchy)       │
│ 4. Role (political + system roles)      │
│ 5. MemberRole (assignments)             │
│ 6. PositionHistory (audit trail)        │
│ 7. Committee (team structures)          │
└─────────────────────────────────────────┘
```

### Key Model Relationships

```
User (1) ──── (1) Member ──── (M) MemberRole ──── (M) Role
                    └────── (1) OrganizationalUnit
                    
PositionHistory (many) ──── (1) Member
                            
Committee (many) ──── (M) Members
```

---

## 📊 Model Quick Reference

| Model | Table | Key Relations | Purpose |
|-------|-------|---------------|---------|
| **User** | users | member | System authentication |
| **Member** | members | user, roles, unit | User profile |
| **Role** | roles | members | Political roles |
| **MemberRole** | member_roles | member, role | Assignments |
| **Organization Unit** | org_units | members, parent | Hierarchy |
| **Position History** | position_history | member | Audit trail |
| **Committee** | committees | members | Committee structure |

---

## 🔄 Relationship Types Used

### One-to-One Example
```php
// User has one Member profile
User::find(1)->member; // Returns Member or null

class User extends Model {
    public function member() {
        return $this->hasOne(Member::class); 
    }
}
```

### One-to-Many Example
```php
// Member has many Roles
Member::find(1)->roles; // Returns Collection of Roles

class Member extends Model {
    public function roles() {
        return $this->belongsToMany(Role::class);
    }
}
```

### Many-to-Many Example
```php
// Role has many Permissions
Role::find(1)->permissions; // Returns Collection

class Role extends Model {
    public function permissions() {
        return $this->belongsToMany(Permission::class);
    }
}
```

### Self-Referential (Hierarchy)
```php
// OrganizationalUnit has parent unit and child units
$unit = OrganizationalUnit::find(1);
$parent = $unit->parent; // Parent unit
$children = $unit->children; // Child units
```

---

## 💻 Common Code Patterns

### Querying
```php
// Find user with relationships eager-loaded
$user = User::with(['member', 'member.roles'])->find(1);

// Query with scope
$activeMembers = Member::active()->get();

// Filter by relationship
$unitMembers = OrganizationalUnit::find(1)->members;

// Count relationships
$roleCount = Member::find(1)->roles->count();
```

### Creating Models
```php
// Create with relationships
$user = User::create(['email' => 'test@ndm.org.bd', 'password' => bcrypt('pass')]);
$member = $user->member()->create(['organizational_unit_id' => 1]);
$member->roles()->attach(Role::find(1)); // Assign role
```

### Updating
```php
// Update attributes
$member->update(['status' => 'active']);

// Update relationships
$member->roles()->sync([1, 2, 3]); // Replace roles
$member->roles()->attach([4, 5]); // Add roles
$member->roles()->detach([3]); // Remove roles
```

---

## 📖 Reading Order

### For Backend Developers (2-2.5 hours)
1. **This README** (5 min)
2. **ELOQUENT_MODELS_GUIDE.md** (60 min) - All models
3. **RELATIONSHIPS_DEEP_DIVE.md** (30 min) - Understand joins
4. **QUERY_SCOPES_AND_HELPERS.md** (25 min) - Write efficient code
5. **CASTING_AND_ATTRIBUTES.md** (20 min) - Type safety

### For Frontend Developers (30 min)
1. **This README** (5 min)
2. **ELOQUENT_MODELS_GUIDE.md** (30 min) - Understand API responses
3. → Go to **../04-API/API_ROUTES_COMPLETE.md**

### For Database Admins (45 min)
1. **This README** (5 min)
2. **ELOQUENT_MODELS_GUIDE.md** (40 min) - Relationships reference

---

## ⚡ Performance Tips

### Eager Loading (Good)
```php
// Load relationships upfront (1 query)
$members = Member::with('roles', 'unit')->get();
```

### Lazy Loading (Bad) - N+1 Problem
```php
// Creates N+1 queries (1 + number of members)
$members = Member::all();
foreach ($members as $member) {
    echo $member->roles; // Query each time!
}
```

### Chunking Large Results
```php
// Process 1000 records at a time (memory efficient)
Member::chunk(1000, function ($members) {
    foreach ($members as $member) {
        // Process...
    }
});
```

---

## 🗺️ Quick Navigation

**Want to...**

- See all models & relations → **ELOQUENT_MODELS_GUIDE.md**
- Understand joins → **RELATIONSHIPS_DEEP_DIVE.md**
- Write query scopes → **QUERY_SCOPES_AND_HELPERS.md**
- Type cast attributes → **CASTING_AND_ATTRIBUTES.md**
- Write API responses → **../04-API/CONTROLLERS_SERVICE_GUIDE.md**
- Query database efficiently → **../02-DATABASE/QUERY_OPTIMIZATION.md**

---

## ✅ Model Knowledge Checklist

After reading this section, you should know:

- [ ] All 6 core models and their purposes
- [ ] How to load relationships efficiently
- [ ] What eager loading and lazy loading are
- [ ] How to create relationships in code
- [ ] How to use query scopes
- [ ] What the N+1 query problem is
- [ ] How to prevent N+1 problems
- [ ] How to cast model attributes
- [ ] How to serialize models to JSON

---

## 💡 Pro Tips

1. **Always eager-load relationships** - Prevents N+1 queries
2. **Use query scopes** - Makes queries readable and reusable
3. **Cast timestamps** - Automatically convert to dates
4. **Use mutators** - For data transformation on access/set
5. **Test relationships** - Catch issues early

---

## 📚 Model Conventions

All models follow Laravel conventions:

- **Naming:** Singular (User, Member, Role)
- **Table Names:** Plural, snake_case (users, members, roles)
- **Foreign Keys:** `{model}_id` (user_id, member_id)
- **Pivot Tables:** Alphabetical: `member_role`, not `role_member`
- **Primary Keys:** Always `id`
- **Timestamps:** `created_at`, `updated_at`

---

## 🚀 Next Steps

1. Read **ELOQUENT_MODELS_GUIDE.md** (60 min)
2. Read **RELATIONSHIPS_DEEP_DIVE.md** (30 min)
3. Read **QUERY_SCOPES_AND_HELPERS.md** (25 min)
4. Based on your work:
   - Building features → **../04-API/CONTROLLERS_SERVICE_GUIDE.md**
   - Optimizing queries → **../02-DATABASE/QUERY_OPTIMIZATION.md**
   - Writing tests → **../05-TESTING-SCALABILITY/TESTING_STRATEGY.md**

---

**Models are your bridge between database and business logic. Master them!**

→ Next: Read **ELOQUENT_MODELS_GUIDE.md**

---

*Well-designed models make the system self-explanatory!*
