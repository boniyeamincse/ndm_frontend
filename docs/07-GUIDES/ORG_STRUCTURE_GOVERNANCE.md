# Org Structure Governance

This guide defines how admins should manage organizational units, roles, positions, and promotions in production for NDSM.

## 1. Core Governance Principles

- Organizational structure must follow the approved hierarchy.
- Every position assignment must be auditable.
- Only active members may hold positions.
- Roles may only be assigned inside compatible unit types.
- Destructive changes must be avoided when archival or relief is sufficient.

## 2. Approved Unit Hierarchy

Allowed parent to child relationships:

- `central` → `division`, `campus`
- `division` → `district`
- `district` → `upazila`
- `upazila` → `union`, `campus`
- `union` → `ward`
- `ward` → `campus`
- `campus` → no children

Operational rules:

- Do not place a unit under an incompatible parent.
- Do not move a unit under one of its own descendants.
- Do not attach new child units to inactive parent units.

## 3. Unit Code And Naming Policy

Each unit must have:

- a human-readable `name`
- a unique `code`
- a valid `type`

Code policy:

- Codes are uppercase
- Codes may contain only `A-Z`, `0-9`, and `-`
- Codes are unique across all organizational units
- If a code is not provided, the system generates one automatically from unit type and name

Naming policy:

- Unit names must be unique within the same `type` and `parent_id` scope
- Use clear real-world names, for example `Dhaka Division`, `Mirpur Campus`, `Ward 05 Committee`

## 4. Unit Lifecycle Rules

### Create

Allowed when:

- parent-child hierarchy is valid
- parent is active if provided
- name/code are valid and unique

### Update

Allowed when:

- new parent preserves hierarchy rules
- no cyclical parent assignment is introduced
- updated code remains unique

### Archive / Deactivate

A unit may be archived only if:

- it has no active child units
- it has no active members assigned
- it has no active positions

Use archive instead of delete when the unit may be needed later for reference or reactivation.

### Delete

A unit may be deleted only if:

- it has no child units
- it has no assigned members
- it has no position records tied to it

Delete should be rare in production. Prefer archive for historical continuity.

## 5. Role Governance

Roles define what office or position exists within a given unit type.

Rules:

- Every role belongs to one `unit_type`
- System roles should not be deleted
- Roles that are already in use should not be deleted
- Permission sync should be treated as a controlled admin action and audited

Examples:

- A `central` role may only be assigned in a `central` unit
- A `district` role may only be assigned in a `district` unit

## 6. Position Assignment Rules

Before assigning a position, confirm:

- member is active
- role is active
- unit is active
- role `unit_type` matches unit `type`
- target member does not already hold the same active role in that same unit

Assignment behavior:

- if another member already holds the same active role in the same unit, the system auto-relieves the prior holder
- every assignment writes to position history

## 7. Position Transfer Rules

Use transfer when the office remains but the office holder changes.

Allowed when:

- source position exists and is active
- target member is active
- target member is not the same as current holder
- target member does not already hold the same active role in the same unit

Transfer behavior:

- current holder is relieved
- new holder receives the same role and unit assignment
- both sides of the transfer are written to position history

## 8. Position Relief Rules

Use relief when a member should no longer hold a position and no immediate replacement is assigned.

Effects:

- active position is removed
- relief event is written to position history

## 9. Production Admin Workflow

Recommended order of work:

1. Create or verify the organizational unit
2. Create or verify the role for that unit type
3. Confirm the member is active and eligible
4. Assign or transfer the position
5. Review audit and position history output

## 10. Operational Safety Rules

- Never bypass hierarchy rules with manual database edits
- Never assign positions to pending, suspended, or expelled members
- Never create duplicate structural units just to solve a staffing problem
- Use transfer instead of delete-and-recreate when changing office holders
- Keep role titles stable once used in production unless there is an approved rename decision

## 11. Audit Expectations

Admins should expect audit and history coverage for:

- unit creation
- unit updates
- unit archive/reactivation
- unit deletion
- role creation/update/delete/toggle
- permission sync
- position assignment
- position transfer
- position relief

Any missing audit trail on these operations should be treated as a defect.