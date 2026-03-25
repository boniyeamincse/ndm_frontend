# Async Processing Backlog

## Purpose

Identify heavy operations that should run through queues instead of inline HTTP execution.

## Priority Queue Candidates

### P0 (Move to queue immediately)

1. **ID card PDF generation (batch/admin export)**
   - Current risk: long response time and timeout under load
   - Queue job output: generated PDF path + completion state

2. **Bulk member notifications (approval/rejection/suspension/expulsion campaigns)**
   - Current risk: request blocking for large member lists
   - Queue job output: delivery summary and failure log

3. **Large member CSV/PDF exports**
   - Current risk: high memory and long-running requests
   - Queue job output: downloadable file URL + expiry

### P1 (Queue in next sprint)

4. **Audit archival + retention jobs**
   - Nightly archive process for old audit logs

5. **Task summary/report recomputation cache warmers**
   - Precompute admin dashboard aggregates

6. **Bulk member state transitions with notification fan-out**
   - Approve/reject/suspend/expel in large batches

### P2 (Planned)

7. **Media optimization and image derivatives**
8. **Scheduled communication campaigns (email/SMS/WhatsApp)**
9. **Periodic integrity checks (orphan files, stale references)**

## Queue Design Baseline

- Use Laravel queue with retry and dead-letter handling.
- Include idempotency keys for all destructive or repeatable jobs.
- Store job status in a table for frontend polling.
- Emit audit entries for job start, success, failure.

## Suggested Queue Separation

- `high` — approval-state notifications, security-critical tasks
- `default` — standard async operations
- `reports` — exports, heavy analytics generation
- `maintenance` — archival, cleanup, consistency checks

## Failure Handling

- Retries with exponential backoff
- Failure threshold routes to dead-letter queue
- Admin-visible job error message (non-sensitive)
- Replay support for recoverable jobs

## Minimum Implementation Contract

Each async operation should include:

- `job_id`
- `requested_by`
- `requested_at`
- `status` (`queued`, `processing`, `completed`, `failed`)
- `result` pointer (file URL / count summary)
- `error` snapshot on failure

## Rollout Order

1. Exports
2. Bulk notifications
3. ID card batch generation
4. Audit archival
5. Dashboard/report cache warmers
