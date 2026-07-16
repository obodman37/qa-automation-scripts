# SCRUM-1 — Python.org Documentation Search (Playwright)

## What this covers
Automates the core acceptance criteria for SCRUM-1:
- Search from Python.org homepage for `requests`
- Verify results are shown
- Verify first result has a link and points to an allowlisted “official Requests documentation” domain (configurable)
- Verify page title indicates search results

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

## Config
Update the allowed documentation domains in `tests/scrum-1-python-search.spec.ts` once the expected official docs domain is confirmed.
