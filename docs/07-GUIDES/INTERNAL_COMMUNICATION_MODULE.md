# Internal Communication Module

## Purpose

Define how circulars, internal notices, targeted announcements, and organization messages should flow across NDSM committees and member audiences.

## Communication Types

- `circular`: formal policy or directive issued by competent authority
- `notice`: operational update, scheduling, administrative reminder
- `announcement`: publishable organizational message for selected audiences
- `direct_message`: one-to-one or one-to-few internal message for workflow handling
- `emergency_alert`: urgent communication with elevated delivery priority

## Audience Scope

Messages may target one or more of the following:

- all members
- all active members
- specific unit types
- specific organizational units
- selected committee roles
- selected users or members
- admin-only or leadership-only audiences

## Approval Chain

- Central-level circulars require central authority approval.
- District or campus notices may be issued by authorized local leadership within scope.
- Emergency alerts should allow accelerated approval with mandatory audit logging.
- Published messages must preserve author, approver, audience scope, and publish timestamps.

## Core Lifecycle

- `draft`
- `pending_review`
- `approved`
- `scheduled`
- `published`
- `withdrawn`
- `archived`

## Required Data Fields

- title
- body
- message type
- scope type and scope targets
- priority (`normal`, `important`, `urgent`, `emergency`)
- author
- approver
- scheduled publish time
- published at
- withdrawn at / reason
- attachments (optional)

## Inbox Behavior

- Members should see only messages matching their unit, status, and role eligibility.
- Read/unread state should be tracked per recipient.
- Withdrawn content should disappear from standard inbox views but remain auditable.

## Audit Requirements

- create
- edit
- submit for review
- approve / reject
- publish / schedule
- withdraw
- audience changes

## Delivery Channels

- in-app inbox: default channel
- email: optional for important notices
- SMS / WhatsApp: reserved for urgent or high-value messages
- push / browser notification: optional future enhancement

## Safety Rules

- Role and unit targeting must be permission-checked.
- Senders cannot exceed their organizational scope.
- Emergency alerts require explicit higher-privilege permission.
- Sensitive communications must not expose private phone or email lists to recipients.