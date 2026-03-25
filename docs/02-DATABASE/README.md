# 02-DATABASE

## 🗄️ Database Design & Schema

This section covers database architecture, schema design, migrations, optimization, and indexing strategies for PostgreSQL.

---

## 📍 What's in This Section?

Learn how data is **organized, stored, and retrieved** in the database.

**Who should read this?**
- ✅ Database admins (all must read)
- ✅ Backend developers (schema understanding required)
- ✅ DevOps engineers (backup, scaling, optimization)
- ✅ Architects (schema design decisions)

---

## 📚 Files in This Section

| File | Purpose | Audience | Time |
|------|---------|----------|------|
| **README.md** | This file - database overview | Everyone | 5 min |
| **DATABASE_SCHEMA_GUIDE.md** | All tables, migrations, design | DBA, Backend | 45 min |
| **INDEXING_STRATEGY.md** | Indexes, query optimization | DBA, DevOps | 30 min |
| **QUERY_OPTIMIZATION.md** | Writing efficient queries | Backend, DBA | 25 min |
| **BACKUPS_AND_RECOVERY.md** | Backup strategy, disaster recovery | DevOps, DBA | 20 min |

---

## 🎯 Database Overview

### Technology Stack
- **DBMS:** PostgreSQL 14+
- **ORM:** Eloquent (Laravel)
- **Migrations:** Laravel Migration system
- **Query Builder:** Eloquent Query Builder

### Key Design Decisions

#### 1. **Normalized Schema**
All tables are normalized to 3NF to prevent data anomalies.

#### 2. **Self-Referential Hierarchies**
Organization structure uses `parent_id` for tree relationships.

#### 3. **Immutable Audit Trail**
`position_history` table is append-only for compliance.

#### 4. **Soft Deletes**
Strategic use for data retention while marking as inactive.

---

## 📊 Core Tables

### Core Organizations
```
organizational_units
├── id (PK)
├── name
├── parent_id (FK - self-referential)
├── level (1-6)
├── status
└── timestamps
```

### Member Management
```
members
├── id (PK)
├── user_id (FK)
├── organizational_unit_id (FK)
├── created_at
└── updated_at

member_roles
├── id (PK)
├── member_id (FK)
├── role_id (FK)
└── timestamps
```

### Role & Permission System
```
roles
├── id (PK)
├── name (guard_name)
└── timestamps

permissions
├── id (PK)
├── name (guard_name)
└── timestamps

role_has_permissions
├── role_id (PK, FK)
├── permission_id (PK, FK)
```

### Audit Trail
```
position_history
├── id (PK)
├── member_id (FK)
├── role_id (FK)
├── assigned_at
├── relieved_at
└── created_at (immutable)
```

---

## 📈 Schema Statistics

| Table | Purpose | Est. Rows | Row Size |
|-------|---------|-----------|----------|
| organizational_units | Org hierarchy | 500 | 200 bytes |
| members | User profiles | 50,000 | 300 bytes |
| member_roles | Role assignments | 100,000 | 50 bytes |
| position_history | Audit trail | 500,000 | 80 bytes |
| roles | System roles | 10 | 100 bytes |
| permissions | Permissions | 100 | 100 bytes |

**Total DB Size:** ~150-200 MB (production estimate)

---

## 🔑 Key Indexes

```sql
-- Performance critical indexes
CREATE INDEX idx_members_org_unit ON members(organizational_unit_id);
CREATE INDEX idx_member_roles_member ON member_roles(member_id);
CREATE INDEX idx_position_history_member ON position_history(member_id);
CREATE INDEX idx_position_history_relieved ON position_history(relieved_at);
CREATE INDEX idx_org_units_parent ON organizational_units(parent_id);
```

**Total Index Size:** ~20 MB

---

## 📖 Reading Order

### For Database Admins (2-3 hours)
1. **This README** (5 min)
2. **DATABASE_SCHEMA_GUIDE.md** (45 min) - Understand all tables
3. **INDEXING_STRATEGY.md** (30 min) - Performance tuning
4. **QUERY_OPTIMIZATION.md** (25 min) - Write fast queries
5. **BACKUPS_AND_RECOVERY.md** (20 min) - Data protection

### For Backend Developers (1-2 hours)
1. **This README** (5 min)
2. **DATABASE_SCHEMA_GUIDE.md** (45 min) - Table relationships
3. **QUERY_OPTIMIZATION.md** (25 min) - Write efficient queries
4. → Go to **../03-MODELS/ELOQUENT_MODELS_GUIDE.md** (models)

### For DevOps Engineers (1.5-2 hours)
1. **This README** (5 min)
2. **DATABASE_SCHEMA_GUIDE.md** (45 min) - Tables overview
3. **BACKUPS_AND_RECOVERY.md** (20 min) - Backup strategy
4. **INDEXING_STRATEGY.md** (30 min) - Performance tuning
5. → Go to **../06-DEPLOYMENT/DEPLOYMENT_CHECKLIST.md**

---

## ⚙️ Database Operations

### Connection Details
```
Provider: PostgreSQL
Host: localhost (dev) / RDS endpoint (prod)
Port: 5432
Database: ndm_dev / ndm_prod
Character Set: UTF8MB4
Collation: Case-insensitive
```

### Running Migrations
```bash
# Fresh migrations (dev only)
php artisan migrate:fresh --seed

# Migration in production
php artisan migrate --force

# Rollback (dev only)
php artisan migrate:rollback
```

### Seeding
```bash
# Seed database
php artisan db:seed

# Seed specific seeder
php artisan db:seed --class=TestMembersSeeder
```

---

## 📊 Query Performance

### Slow Query Thresholds
- **Fast:** < 100ms
- **Acceptable:** 100-500ms
- **Slow:** > 500ms (investigate)

### Common Query Patterns
```php
// Efficient: Uses index
$members = Member::where('organizational_unit_id', $id)->get();

// Inefficient: Full table scan
$members = Member::where('status', 'active')->get();
// Better version:
$members = Member::active()->get(); // Uses scope + index
```

---

## 🔒 Data Security

### Encryption
- Passwords: bcrypt hashing
- Sensitive data: Database-level encryption in production

### Access Control
- Database users with minimal privileges
- Connection pooling for efficiency
- SSL connections in production

### Audit Trail
All role changes tracked in `position_history` (immutable)

---

## 🗺️ Quick Navigation

**Want to...**

- Understand all tables → **DATABASE_SCHEMA_GUIDE.md**
- Write fast queries → **QUERY_OPTIMIZATION.md**
- Add database index → **INDEXING_STRATEGY.md**
- Set up backups → **BACKUPS_AND_RECOVERY.md**
- See relationships → **../03-MODELS/ELOQUENT_MODELS_GUIDE.md**
- Run migrations → **../07-GUIDES/DATABASE_SETUP.md**

---

## ✅ Database Knowledge Checklist

After reading this section, you should know:

- [ ] Name all 7 core tables and their purposes
- [ ] How organizational hierarchy is stored
- [ ] How roles and permissions are related
- [ ] What the position_history table tracks
- [ ] Which indexes exist and why
- [ ] How to write an efficient query
- [ ] How to backup and restore PostgreSQL
- [ ] What VACUUM and ANALYZE do

---

## 💡 Pro Tips

1. **Always use indexes on foreign keys** - Enables fast joins
2. **Check EXPLAIN before deploying** - Know your query plans
3. **Monitor slow query log** - Catch performance issues early
4. **Archive position_history regularly** - Keeps audits fast
5. **Test migrations on staging first** - Prevents production downtime

---

## 🚀 Next Steps

1. Read **DATABASE_SCHEMA_GUIDE.md** (45 min)
2. Based on your role:
   - Backend → Read **QUERY_OPTIMIZATION.md** → **../03-MODELS/**
   - DBA → Read **INDEXING_STRATEGY.md** → **BACKUPS_AND_RECOVERY.md**
   - DevOps → Read **BACKUPS_AND_RECOVERY.md** → **../06-DEPLOYMENT/**

---

**Database is the heart of the system. Understand it well!**

→ Next: Read **DATABASE_SCHEMA_GUIDE.md**

---

*A well-designed database is maintainable, performant, and scalable!*
