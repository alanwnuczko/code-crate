import sys
import os
import threading
import time
from pathlib import Path
from typing import Callable


def _bundle_path(*parts) -> str:
    """Resolve a path that lives inside the PyInstaller bundle (or source tree)."""
    if getattr(sys, "frozen", False):
        base = Path(sys._MEIPASS)
    else:
        base = Path(__file__).resolve().parent
    return str(base.joinpath(*parts))


def _load_tray_icon():
    """Load the tray icon, converting .ico → PIL Image if needed.

    On Linux, pystray with AppIndicator requires a PNG-compatible image.
    Pillow handles the .ico → internal conversion transparently.
    """
    from PIL import Image

    ico_path = _bundle_path("assets", "tray.ico")
    png_path = _bundle_path("assets", "tray.png")

    # Prefer a pre-converted PNG if it exists
    if os.path.isfile(png_path):
        return Image.open(png_path)

    # Fall back to .ico — Pillow reads it fine and pystray can use the PIL Image
    if os.path.isfile(ico_path):
        img = Image.open(ico_path)
        # Convert to RGBA PNG in-memory for maximum compatibility
        img = img.convert("RGBA")
        # Also save a .png alongside so future launches are faster
        try:
            img.save(png_path, format="PNG")
        except OSError:
            pass  # Read-only bundle, no problem
        return img

    # Last resort: generate a tiny coloured square
    img = Image.new("RGBA", (64, 64), (255, 184, 107, 255))
    return img


def start(window, on_quit: Callable):
    """Start the system-tray icon in a background thread.

    On Linux the tray toggle simply calls ``window.show()`` /
    ``window.hide()`` — the Win32 collapse/expand animations are not
    available.
    """
    visible = [True]
    icon_ref = [None]

    def _collapse_to_tray():
        """Hide the window to the tray."""
        try:
            window.hide()
            visible[0] = False
        except Exception as exc:
            print(f"[tray] Error collapsing: {exc}")

    def _expand_from_tray():
        """Show the window from the tray."""
        try:
            window.show()
            visible[0] = True
        except Exception as exc:
            print(f"[tray] Error expanding: {exc}")

    def _toggle(icon=None, item=None):
        if visible[0]:
            _collapse_to_tray()
        else:
            _expand_from_tray()

        if icon_ref[0]:
            try:
                icon_ref[0].update_menu()
            except Exception:
                pass

    def _label(item):
        return "Collapse" if visible[0] else "Expand"

    def _run():
        try:
            import pystray

            image = _load_tray_icon()

            icon = pystray.Icon(
                "CodeCrate",
                image,
                "CodeCrate",
                menu=pystray.Menu(
                    pystray.MenuItem(_label, _toggle, default=True),
                    pystray.Menu.SEPARATOR,
                    pystray.MenuItem("Quit", lambda icon, item: on_quit(icon)),
                ),
            )

            icon_ref[0] = icon
            icon.run()

        except Exception as exc:
            print(f"[tray] {exc}")

    threading.Thread(target=_run, daemon=True).start()
