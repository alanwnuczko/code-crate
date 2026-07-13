import sys
import os
import threading
import time
from pathlib import Path
from typing import Callable


def _bundle_path(*parts) -> str:
    if getattr(sys, "frozen", False):
        base = Path(sys._MEIPASS)
    else:
        base = Path(__file__).resolve().parent
    target = base.joinpath(*parts)
    if target.exists():
        return str(target)
    return str(base.parent.joinpath(*parts))


def _load_tray_icon():
    from PIL import Image

    ico_path = _bundle_path("assets", "tray.ico")
    png_path = _bundle_path("assets", "tray.png")

    if os.path.isfile(png_path):
        return Image.open(png_path)

    if os.path.isfile(ico_path):
        img = Image.open(ico_path)
        img = img.convert("RGBA")
        try:
            img.save(png_path, format="PNG")
        except OSError:
            pass
        return img

    img = Image.new("RGBA", (64, 64), (255, 184, 107, 255))
    return img


def start(window, on_quit: Callable):
    visible = [True]
    icon_ref = [None]

    def _collapse_to_tray():
        try:
            window.hide()
            visible[0] = False
        except Exception as exc:
            print(f"[tray] Error collapsing: {exc}")

    def _expand_from_tray():
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
