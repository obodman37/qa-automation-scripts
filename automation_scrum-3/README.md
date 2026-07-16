# SCRUM-3 — Python.org Download Python Feature (Playwright)

## What this covers
Automates the core acceptance criteria for SCRUM-3:
- Navigate from Python.org homepage to Downloads
- Verify latest stable version is shown
- Click Download Latest and verify a download starts
- Verify installation instructions section is present
- Verify download link uses HTTPS

## Notes
- OS-correctness is best validated on each OS (Windows/macOS) in separate CI jobs or manual checks.
- Download verification uses Playwright `page.waitForEvent('download')`.

## Install
```bash
npm i
npx playwright install
```

## Run
```bash
npx playwright test
```
