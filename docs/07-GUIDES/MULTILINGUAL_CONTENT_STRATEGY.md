# Multilingual Content Strategy

## Goal

Implement Bangla-first content with English support where operationally useful.

## Language Policy

- Primary language: Bangla
- Secondary language: English
- Public-facing organizational identity, notices, and slogans should prefer Bangla-first presentation.
- Technical admin labels may use English initially where translation coverage is incomplete.

## Content Priority

### Bangla-first mandatory

- public homepage headlines
- official statements
- organizational notices and circulars
- constitution and policy summaries
- slogan / motto presentation

### Dual-language recommended

- about page
- leadership bios
- campaign/event pages
- contact and help pages

### English acceptable initially

- internal admin workflow labels
- developer-facing docs
- technical error details not exposed publicly

## Data Model Guidance

For translatable content, prefer storing language variants explicitly:

- `title_bn`, `title_en`
- `body_bn`, `body_en`
- `summary_bn`, `summary_en`

Avoid mixing both languages into one field.

## Frontend Rules

- default locale should be Bangla for public pages
- fallback to English only when Bangla content is missing
- navigation labels should support localized display strings
- dates and number formatting should support Bangla-friendly display where required

## Governance

- publishing workflow should validate minimum required language fields
- legal or policy text should identify authoritative language where needed
- translation edits should be auditable for official communications