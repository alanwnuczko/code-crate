import sys
from pathlib import Path

if getattr(sys, "frozen", False):
    _BUNDLE_DIR = Path(sys._MEIPASS)
else:
    _BUNDLE_DIR = Path(__file__).resolve().parent

_APP_NAME = "CodeCrate"

import os
_xdg_data = os.environ.get("XDG_DATA_HOME", "")
if _xdg_data:
    _USER_DIR = Path(_xdg_data) / _APP_NAME
else:
    _USER_DIR = Path.home() / ".local" / "share" / _APP_NAME

_USER_DIR.mkdir(parents=True, exist_ok=True)

_html = _BUNDLE_DIR / "index.html"
if not _html.exists() and (_BUNDLE_DIR / "Linux" / "index.html").exists():
    _html = _BUNDLE_DIR / "Linux" / "index.html"
HTML_FILE = str(_html)
STATE_FILE = str(_USER_DIR / "state.json")
