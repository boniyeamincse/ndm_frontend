# NDM Project Task Management

This folder now uses a **single consolidated task file** for detailed execution tracking.

Coverage scope:
- Backend API and business logic
- Database and seed data
- Frontend public site and dashboards
- Security, testing, QA, and VAPT
- Deployment, operations, and documentation

Status values:
- Dev Status: `Pending`, `In Progress`, `Done`
- Test Status: `Pending`, `Passed`, `Failed`
- Upload Status: `Pending`, `Uploaded`

Primary tracker:
- [MASTER_TASK_TRACKER.md](MASTER_TASK_TRACKER.md)

Overall status rule in master tracker:
- `Completed` = Dev `Done` + Test `Passed` + Upload `Uploaded`
- `In Progress` = Any column contains `In Progress`
- `Pending` = Everything else

Legacy split files (reference only):
- [task_01_setup_foundation.md](task_01_setup_foundation.md)
- [task_02_database_backend_core.md](task_02_database_backend_core.md)
- [task_03_auth_member_admission.md](task_03_auth_member_admission.md)
- [task_04_admin_member_operations.md](task_04_admin_member_operations.md)
- [task_05_roles_positions_units.md](task_05_roles_positions_units.md)
- [task_06_tasks_audit_idcards.md](task_06_tasks_audit_idcards.md)
- [task_07_frontend_public_pages.md](task_07_frontend_public_pages.md)
- [task_08_frontend_auth_member_dashboard.md](task_08_frontend_auth_member_dashboard.md)
- [task_09_frontend_admin_dashboard.md](task_09_frontend_admin_dashboard.md)
- [task_10_backend_testing.md](task_10_backend_testing.md)
- [task_11_frontend_testing_security_quality.md](task_11_frontend_testing_security_quality.md)
- [task_12_deployment_docs_ops.md](task_12_deployment_docs_ops.md)

Planning notes:
- Tasks are sequenced from environment setup through development, verification, security hardening, and deployment.
- Coding-oriented items explicitly note AI-assisted implementation opportunities.
- All tasks are initialized with default statuses for immediate project tracking.