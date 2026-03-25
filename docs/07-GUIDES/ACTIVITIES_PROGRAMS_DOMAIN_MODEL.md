# Activities And Programs Domain Model

## Purpose

Define the core activity and event entities for NDSM campaigns, seminars, workshops, rallies, meetings, and campus programs.

## Activity Categories

- seminar
- workshop
- rally
- campaign
- meeting
- campus_program
- community_service
- training

## Entity: Activity

Required fields:

- title
- slug
- category
- summary
- description
- owning unit
- visibility (`public`, `internal`, `restricted`)
- start datetime
- end datetime
- venue / location
- contact person
- approval status
- publication status

Optional fields:

- cover image
- resource links
- registration limit
- budget notes
- follow-up task reference

## Lifecycle States

- `draft`
- `pending_approval`
- `approved`
- `published`
- `ongoing`
- `completed`
- `archived`
- `cancelled`

## Ownership Rules

- Every activity must belong to a unit.
- Cross-unit events should record one primary owning unit and optional supporting units.
- Approval authority depends on category, visibility, and unit level.

## Participant Model

- registration status
- attendance status
- check-in/check-out timestamps
- participation proof or notes
- unit association for reporting

## Post-Event Records

- event report
- attendance summary
- outcomes and resolutions
- media uploads
- budget/effort note
- linked follow-up tasks

## Permissions Model

- create: authorized unit leadership/admin
- approve: higher committee or delegated approver
- publish: approved users only
- archive/cancel: owner or higher authority with audit log

## Reporting Dimensions

- category
- unit
- date range
- audience scope
- attendance rate
- completion rate
- media/report completion