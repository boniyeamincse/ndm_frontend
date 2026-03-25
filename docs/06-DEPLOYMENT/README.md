# 06-DEPLOYMENT

## 🚀 Deployment, Infrastructure & Operations

This section covers deployment strategies, infrastructure setup, environment configuration, and operational procedures.

---

## 📍 What's in This Section?

Learn how to **deploy, monitor, and maintain** the NDM system in production.

**Who should read this?**
- ✅ DevOps engineers (all must read)
- ✅ System administrators (infrastructure needed)
- ✅ Backend lead (deployment procedures)
- ✅ On-call engineers (incident response)

---

## 📚 Files in This Section

| File | Purpose | Audience | Time |
|------|---------|----------|------|
| **README.md** | This file - deployment overview | Everyone | 5 min |
| **DEPLOYMENT_CHECKLIST.md** | Step-by-step deployment guide | DevOps, Backend Lead | 45 min |
| **INFRASTRUCTURE_SETUP.md** | AWS, database, servers, CDN | DevOps, SysAdmin | 50 min |
| **ENVIRONMENT_CONFIGURATION.md** | .env, secrets, settings | DevOps | 25 min |
| **MONITORING_AND_ALERTS.md** | Monitoring setup, alerts | DevOps | 30 min |
| **INCIDENT_RESPONSE.md** | Handling issues, rollback | On-call | 25 min |

---

## 🎯 Deployment Overview

### Supported Environments
```
Development     Local machine
Staging         On-premise server / AWS
Production      AWS (RDS + EC2)  OR  On-premise
```

### Infrastructure Stack
- **Web Server:** Nginx
- **Application Server:** PHP-FPM 8.2+
- **Database:** PostgreSQL 14+
- **Cache:** Redis
- **Queue:** Redis (background jobs)
- **CDN:** CloudFront (optional)
- **DNS:** Route 53

### Deployment Method
- **Strategy:** Rolling deployment (zero downtime)
- **Tool:** Laravel Forge or GitHub Actions
- **Rollback:** Blue-green deployment

---

## 📊 Server Requirements

### Minimum (Development)
- CPU: 2 cores
- RAM: 2GB
- Storage: 20GB
- OS: Ubuntu 20.04 LTS

### Recommended (Staging)
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB
- OS: Ubuntu 22.04 LTS

### Production
- CPU: 8+ cores
- RAM: 16GB+
- Storage: 100GB+
- OS: Ubuntu 22.04 LTS
- Load Balancer: Yes
- Database Replicas: 2+
- Backup: Daily, multiple zones

---

## 📖 Reading Order

### For DevOps Engineers (3-4 hours)
1. **This README** (5 min)
2. **INFRASTRUCTURE_SETUP.md** (50 min) - AWS setup
3. **DEPLOYMENT_CHECKLIST.md** (45 min) - Deploy process
4. **ENVIRONMENT_CONFIGURATION.md** (25 min) - Settings
5. **MONITORING_AND_ALERTS.md** (30 min) - Monitoring
6. **INCIDENT_RESPONSE.md** (25 min) - On-call guide

### For System Administrators (2.5 hours)
1. **This README** (5 min)
2. **INFRASTRUCTURE_SETUP.md** (50 min) - Build servers
3. **ENVIRONMENT_CONFIGURATION.md** (25 min) - Configure
4. **MONITORING_AND_ALERTS.md** (30 min) - Monitor health

### For Backend Lead (1.5 hours)
1. **This README** (5 min)
2. **DEPLOYMENT_CHECKLIST.md** (45 min) - Deploy steps
3. **ENVIRONMENT_CONFIGURATION.md** (25 min) - Settings
4. **INCIDENT_RESPONSE.md** (25 min) - Emergency procedures

---

## 🔄 Deployment Process

### Pre-Deployment (1 hour)
```bash
# 1. Run tests one final time
php artisan test

# 2. Check code standards
php artisan code:analyze

# 3. Remove dangerous routes
# Comment out seeders in production

# 4. Generate fresh lock file
composer update --no-dev

# 5. Verify .env settings are correct
cat .env.production
```

### Deployment Steps (30 min)
```bash
# 1. Push to git
git add .
git commit -m "Release v1.2.0"
git tag v1.2.0
git push origin main --tags

# 2. Deployment tool runs automatically (via webhook)
# OR manual:
ssh deploy@production
cd /var/www/ndm-api

# 3. Pull latest code
git pull origin main

# 4. Install dependencies
composer install --no-dev --optimize-autoloader

# 5. Run migrations
php artisan migrate --force

# 6. Cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 7. Clear old caches
php artisan cache:clear
php artisan queue:restart

# 8. Update permissions
chown -R www-data:www-data storage bootstrap/cache

# 9. Restart services
systemctl restart php-fpm
systemctl restart nginx
```

### Post-Deployment (30 min)
```bash
# 1. Smoke tests
curl https://api.ndm.org.bd/api/v1/health

# 2. Monitor logs
tail -f storage/logs/laravel.log

# 3. Check metrics
# Open monitoring dashboard

# 4. Run integration tests
php artisan test tests/Feature/

# 5. Announce deployment
# Update status page if any were issues
```

---

## 🗂️ Directory Structure (Production)

```
/var/www/ndm-api/
├── app/                 # Application code
├── bootstrap/           # Framework bootstraping
├── config/              # Configuration files
├── database/            # Migrations & seeds
├── public/              # Web root (nginx serves from here)
├── resources/           # Views, CSS, JS
├── routes/              # API routes
├── storage/             # Logs, uploads, cache
├── vendor/              # Dependencies (not in git)
├── tests/               # Test files
├── .env                 # Environment variables (not in git)
├── .env.example         # Template for .env
└── artisan              # Laravel CLI
```

---

## 🌍 Environment Configuration

### .env Variables (Production)
```bash
APP_NAME="NDM Student Wing"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://ndm.org.bd

DATABASE_HOST=prod-db.c12345.us-east-1.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=ndm_prod
DATABASE_USERNAME=ndm_prod_user
DATABASE_PASSWORD=SECURE_PASSWORD_HERE

JWT_SECRET=SECURE_KEY_HERE
JWT_ALGORITHM=HS256
JWT_REFRESH_TTL=10080

MAIL_HOST=smtp.sendgrid.net
MAIL_USERNAME=apikey
MAIL_PASSWORD=SENDGRID_API_KEY

REDIS_HOST=redis-prod.c12345.amazonaws.com
REDIS_PASSWORD=REDIS_PASSWORD
REDIS_PORT=6379

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_DRIVER=redis
```

### Secrets Management
- Use **AWS Secrets Manager** for production credentials
- Use **HashiCorp Vault** for enterprise
- Rotate credentials quarterly
- Never commit `.env` to git

---

## 🚨 Monitoring Setup

### Key Metrics
```
- Response time (API endpoints)
- Error rate (5xx errors)
- Request volume
- Database connections
- Memory usage
- Disk space
- Cache hit rate
```

### Monitoring Tools
- **APM:** New Relic or DataDog
- **Error Tracking:** Sentry
- **Log Aggregation:** CloudWatch or ELK
- **Status Page:** StatusPage.io

### Alert Thresholds
- Response time > 1000ms → Warning
- 5xx error rate > 1% → Alert
- Database CPU > 80% → Alert
- Memory > 90% → Critical
- Disk space < 10% → Alert

---

## 🗺️ Quick Navigation

**Want to...**

- Deploy to production → **DEPLOYMENT_CHECKLIST.md**
- Set up AWS infrastructure → **INFRASTRUCTURE_SETUP.md**
- Configure environment → **ENVIRONMENT_CONFIGURATION.md**
- Set up monitoring → **MONITORING_AND_ALERTS.md**
- Handle production issues → **INCIDENT_RESPONSE.md**
- Learn architecture → **../01-ARCHITECTURE/**
- Run tests → **../05-TESTING-SCALABILITY/**

---

## ✅ Pre-Production Checklist

Deploy only when ALL boxes checked:

### Code Quality
- [ ] All tests passing (100% of Feature tests)
- [ ] No console errors or warnings
- [ ] Code reviewed by 2 team members
- [ ] No debug code leftover
- [ ] Performance targets met

### Security
- [ ] All secrets in environment variables
- [ ] No API keys in code
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Input validation complete
- [ ] SQL injection prevented

### Infrastructure
- [ ] Database replicas configured
- [ ] Backups scheduled and tested
- [ ] Monitoring configured
- [ ] Alerts configured
- [ ] Load balancer configured
- [ ] CDN configured

### Operations
- [ ] Runbooks written
- [ ] Team trained on procedures
- [ ] Incident response plan ready
- [ ] Rollback plan tested
- [ ] Communication plan ready

---

## 💡 Deployment Best Practices

1. **Zero-downtime deployments** - Always use rolling deployments
2. **Test in staging first** - Never deploy untested code
3. **Database migrations** - Test migrations in separate from code
4. **Gradual rollouts** - Deploy to 10%, then 50%, then 100%
5. **Monitor closely** - Watch for errors after deployment
6. **Document changes** - Write release notes
7. **Keep backups** - Always able to restore from backup
8. **Version everything** - Git tags for each release

---

## 🆘 Emergency Procedures

### Rollback
```bash
# If deployment failed
git revert HEAD
git push production
php artisan migrate:rollback --force

# OR restore from backup
# See INCIDENT_RESPONSE.md
```

### Scale Up
```bash
# If getting spikes
# Auto-scaling group increases instances
# Load balancer distributes traffic
# No manual intervention needed

# If manual scaling needed
# Add new instances
# Update load balancer
# Drain old instances
```

---

## 🚀 Next Steps

1. Read **DEPLOYMENT_CHECKLIST.md** (45 min)
2. Read **INFRASTRUCTURE_SETUP.md** (50 min)
3. Read **ENVIRONMENT_CONFIGURATION.md** (25 min)
4. Set up staging environment
5. Practice deployment process
6. Document procedures for team
7. Set up monitoring and alerts
8. Create incident response playbook

---

**Smooth deployments and reliable operations are your responsibility. Take them seriously!**

→ Next: Read **DEPLOYMENT_CHECKLIST.md**

---

*The best infrastructure is invisible - users just see reliability!*
