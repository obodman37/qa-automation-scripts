# SCRUM-2 — EPAM Contact information (P0)

## What this covers
```text
Automates P0 checks derived from Jira story SCRUM-2:
- Homepage loads
- “Contact” entry discoverable in main navigation
- Navigation to Contact page/section
- Corporate address visible
- Contact form OR contact email visible
- Regional office locations section present and non-empty (heuristic)
```

## How to run
```bash
pip install playwright
playwright install chromium
python automation/run_epam_contact_p0.py
```

## Artifacts
Script outputs to `artifacts_epam_scrum_2/`:
- `env.json`
- `results.json`
- `01_home_nav.png`
- `02_contact_top.png`
- `03_corporate_address.png`
- `04_form_or_email.png`
- `05_regional_locations.png`
