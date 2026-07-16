# SCRUM-2 — EPAM.com Contact Information Access (Playwright)

## What this covers
Automates the core acceptance criteria for SCRUM-2:
- Navigate from EPAM.com homepage to Contact
- Verify corporate address is visible
- Verify a contact mechanism exists (form OR email)
- Verify regional office locations are visible

## Prereqs
- Node.js 18+ (recommended 20+)

## Install
```bash
npm i
npx playwright install
```

## Run
```bash
npx playwright test
```

## Notes
Selectors are implemented to be resilient (role/name and partial href matches), but may need tuning if EPAM.com changes markup.
