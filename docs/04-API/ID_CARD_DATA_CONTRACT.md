# ID Card Data Contract

## Purpose

Define the data carried on the rendered member ID card and the QR payload embedded into the PDF.

## Visual Card Fields

- organization name: `Nationalist Democratic Student Movement (NDSM)`
- member full name
- member ID
- active position title, if available
- organizational unit name
- join year
- profile photo, if available
- generated date
- QR code for verification

## QR Payload

The QR code should contain a JSON object with:

- `member_id`
- `name`
- `status`
- `verify`

Example:

```json
{
  "member_id": "NDSM-2026-0001",
  "name": "Verified Member",
  "status": "active",
  "verify": "https://example.com/api/id-cards/verify/NDSM-2026-0001"
}
```

## Contract Rules

- QR verification URL must point to a dedicated verification endpoint, not a general profile page.
- Verification response must expose only public-safe fields.
- Suspended, expelled, inactive, or unknown cards must not verify as valid.
- The PDF filename format remains `NDM_ID_<member_id>.pdf` with `/` sanitized to `_`.