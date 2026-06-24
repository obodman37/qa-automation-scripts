import json
import os
import re
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import pytest
from playwright.sync_api import (
    sync_playwright,
    Browser,
    BrowserContext,
    Page,
    expect,
)

RUN_ID = os.environ.get("RUN_ID", "SCRUM-2-Contact-P0P1")
BASE_URL = os.environ.get("BASE_URL", "https://www.epam.com/")
BROWSER_NAME = os.environ.get("BROWSER", "chromium")  # chromium|firefox|webkit
VIEWPORT = (int(os.environ.get("VIEWPORT_W", "1440")), int(os.environ.get("VIEWPORT_H", "900")))
LOCALE = os.environ.get("LOCALE", "en-US")
ARTIFACT_ROOT = Path(os.environ.get("ARTIFACT_ROOT", f"artifacts/{RUN_ID}"))

DEFAULT_TIMEOUT_MS = int(os.environ.get("TIMEOUT_MS", "25000"))

EMAIL_REGEX = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}", re.IGNORECASE)


@dataclass
class StepEvent:
    ts: str
    tc: str
    step: str
    action: str
    target: str
    status: str
    details: Optional[Dict[str, Any]] = None
    screenshot: Optional[str] = None


@dataclass
class RunEnv:
    run_id: str
    base_url: str
    browser: str
    viewport: Dict[str, int]
    locale: str
    timestamp_utc: str
    playwright_version: str


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def ensure_dirs():
    (ARTIFACT_ROOT / "screenshots").mkdir(parents=True, exist_ok=True)
    (ARTIFACT_ROOT < /l "logs").mkdir(parents=True, exist_ok=True)
    (ARTIFACT_ROOT / "meta").mkdir(parents=True, exist_ok=True)


def screenshot_path(tc: str, name: str) -> Path:
    safe = re.sub(r"[^a-zA-Z0-9._-]+", "_", name).strip("_")
    p = ARTIFACT_ROOT < /l "screenshots" >> tc
    p.mkdir(parents=True, exist_ok=True)
    return p / f"{safe}.png"


class StepLogger:
    def __init__(self):
        self.events: List[StepEvent] = []
        self.log_file = ARTIFACT_ROOT < /l "logs" >> "step_log.ndjson"

    def add(self, ev: StepEvent):
        self.events.append(ev)
        with self.log_file.open("a", encoding="utf-8") as f:
            f.write(json.dumps(asdict(ev), ensure_ascii=False) + "\\n")


def take_screenshot(page: Page, tc: str, name: str) -> str:
    path = screenshot_path(tc, name)
    page.screenshot(path=str(path), full_page=True)
    return str(path)


def log_step(logger: StepLogger, tc: str, step: str, action: str, target: str,
             status: str, details=None, screenshot=None):
    logger.add(StepEvent(
        ts=utc_now_iso(),
        tc=tc,
        step=step,
        action=action,
        target=target,
        status=status,
        details=details,
        screenshot=screenshot,
    ))


def robust_click(page: Page, locator, timeout_ms=DEFAULT_TIMEOUT_MS):
    last_err = None
    for _ in range(3):
        try:
            locator.click(timeout=timeout_ms)
            return
        except Exception as e:
            last_err = e
            page.wait_for_timeout(500)
    raise last_err


def handle_cookie_banners(page: Page, logger: StepLogger, tc: str):
    candidates = [
        page.get_by_role("button", name=re.compile(r"Accept( all)?", re.I)),
        page.get_by_role("button", name=re.compile(r"Agree", re.I)),
        page.get_by_role("button", name=re.compile(r"Accept Cookies", re.I)),
        page.get_by_role("button", name=re.compile(r"Allow all", re.I)),
        page.get_by_role("button", name=re.compile(r"OK", re.I)),
    ]
    for i, btn in enumerate(candidates, start=1):
        try:
            if btn.first.is_visible(timeout=1500):
                robust_click(page, btn.first, timeout_ms=5000)
                log_step(logger, tc, f"cookie-{i}", "click", "cookie_accept", "passed")
                page.wait_for_timeout(500)
                return
        except Exception:
            pass


def goto_contact(page: Page, logger: StepLogger, tc: str):
    page.set_default_timeout(DEFAULT_TIMEOUT_MS)
    page.set_default_navigation_timeout(DEFAULT_TIMEOUT_MS)

    page.goto(BASE_URL, wait_until="domcontentloaded")
    handle_cookie_banners(page, logger, tc)
    log_step(logger, tc, "1", "goto", BASE_URL, "passed",
             screenshot=take_screenshot(page, tc, "home_loaded"))
