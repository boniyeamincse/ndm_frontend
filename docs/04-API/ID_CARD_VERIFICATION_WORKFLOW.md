# ID Card Verification Workflow

## Goal

Provide a safe public verification flow when a printed or digital member ID card QR code is scanned.

## Endpoint

- `GET /api/id-cards/verify/{member_id}`

## Verification Behavior

### Valid card

Return `200 OK` with:

- `success: true`
- `verified: true`
- public-safe member identity summary
- current organizational unit
- active position summary when available

### Invalid or non-active card

Return `404` with:

- `success: false`
- `verified: false`
- generic failure message

This avoids exposing detailed membership status history to unauthenticated callers.

## Public Response Shape

```json
{
  "success": true,
  "verified": true,
  "data": {
    "member_id": "NDSM-2026-0001",
    "full_name": "Verified Member",
    "status": "active",
    "join_year": 2026,
    "organization": "Nationalist Democratic Student Movement (NDSM)",
    "unit": {
      "id": 10,
      "name": "Dhaka District Committee",
      "type": "district"
    },
    "active_position": {
      "role": "Organizing Secretary",
      "unit": "Dhaka District Committee",
      "assigned_at": "2026-03-26"
    }
  }
}
```

## Data Protection Rules

- Do not expose NID/birth-certificate numbers.
- Do not expose email, phone, address, or emergency contacts.
- Do not expose internal audit state or approval history.
- Only active members should verify successfully.

## Frontend/QR Usage

- QR scanners should redirect users to the `verify` URL stored in the ID-card QR payload.
- Public UI can render the verification result directly from this endpoint.
- Admin/private workflows may still use broader member-detail endpoints separately.