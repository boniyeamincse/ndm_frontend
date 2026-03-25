# Audit Retention Policy

## Purpose

Define how audit logs are retained, archived, redacted, and accessed in production for NDSM.

## Scope

This policy covers records stored in `audit_logs`, including:

- actor identity (`user_id`)
- action name (`action`)
- target model (`model_type`, `model_id`)
- change snapshots (`old_values`, `new_values`)
- access metadata (`ip_address`, `user_agent`, `performed_at`)

## Retention Windows

- **Hot retention (database online):** 18 months
- **Archive retention (compressed immutable storage):** 5 years from event date
- **Hard purge:** after archive retention expires, except legal-hold records

## Data Handling Rules

- Audit records are write-once and append-only at application level.
- No manual edit is allowed for historical audit payloads.
- Redaction is allowed only for sensitive values where legally required.
- Redaction must preserve event identity and timeline (`action`, `performed_at`, `actor`, target).

## Access Control

- Read access limited to admin/security roles.
- Export access limited to high-privilege admin roles.
- Every export operation should itself be audited.

## Archival Process

1. Nightly job selects records older than 18 months.
2. Records are exported to encrypted archive storage.
3. Archive checksum is generated and logged.
4. Source records are deleted after archive verification.

## Redaction Rules

- Sensitive fields inside `old_values` / `new_values` may be masked.
- Redaction should use irreversible masking for secrets and identity numbers.
- Redaction event should be logged as separate governance action.

## Operational Queries

Recommended indexes for long-term performance:

- `action`
- `performed_at`
- `(model_type, model_id)`
- `user_id`

## Incident Response Use

During investigation, audit logs should answer:

- who performed the action
- what changed
- when it happened
- from which IP / client context

## Compliance Notes

- Legal hold overrides scheduled purge.
- Any retention change requires security and compliance approval.
- Backup copies must follow the same retention and encryption policy.
