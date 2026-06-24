import sys
import os

if getattr(sys, "frozen", False):
    _BUNDLE_DIR = sys._MEIPASS
else:
    _BUNDLE_DIR = os.path.dirname(os.path.abspath(__file__))

_APP_NAME   = "CodeCrate"
_USER_DIR   = os.path.join(os.environ.get("APPDATA", os.path.expanduser("~")), _APP_NAME)
os.makedirs(_USER_DIR, exist_ok=True)

HTML_FILE  = os.path.join(_BUNDLE_DIR, "index.html")

STATE_FILE = os.path.join(_USER_DIR, "state.json")
