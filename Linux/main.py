import os
import time
from pathlib import Path

import gi
gi.require_version("Gtk", "3.0")
gi.require_version("Gdk", "3.0")
<<<<<<< HEAD
from gi.repository import Gtk, Gdk, GLib
=======
from gi.repository import Gtk, Gdk, GLib  # type: ignore[attr-defined]
>>>>>>> e0606f38c3d0c50b507c19ef778500e4bc8b82f3
try:
    Gtk.init()
except TypeError:
    Gtk.init([])

import webview

from bridge import Bridge
from tray import start as start_tray
from config import HTML_FILE, STATE_FILE

STATE = STATE_FILE

<<<<<<< HEAD
=======
# ---------------------------------------------------------------------------
# JavaScript injected after the page loads.
# Implements window-drag from the topbar and footer via the Python bridge.
# Uses capture-phase listeners so they fire before any stopPropagation
# calls in the app's own main.js handlers.
# ---------------------------------------------------------------------------
>>>>>>> e0606f38c3d0c50b507c19ef778500e4bc8b82f3
_DRAG_JS = r"""
(function() {
    if (window.__ccDragSetup) return;
    window.__ccDragSetup = true;

    var dragging = false;

    function isInteractive(el) {
        while (el) {
            var tag = (el.tagName || '').toUpperCase();
            if (tag === 'INPUT' || tag === 'SELECT' || tag === 'BUTTON' ||
                tag === 'TEXTAREA' || tag === 'A' || tag === 'OPTION')
                return true;
            if (el.classList && (el.classList.contains('CodeMirror') ||
                el.classList.contains('CodeMirror-scroll') ||
                el.classList.contains('CodeMirror-sizer')))
                return true;
            if (el.id === 'editor-wrap' || el.id === 'editor')
                return true;
            el = el.parentElement;
        }
        return false;
    }

    /* Attach to every drag region (topbar, footer) */
    document.querySelectorAll('.pywebview-drag-region').forEach(function(region) {
        region.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;           /* left-click only */
            if (isInteractive(e.target)) return;  /* skip controls   */

            dragging = true;
            if (window.pywebview && window.pywebview.api) {
                window.pywebview.api.start_drag(e.screenX, e.screenY);
            }
            e.preventDefault();
        }, true);  /* capture phase */
    });

    document.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        if (window.pywebview && window.pywebview.api) {
            window.pywebview.api.do_drag(e.screenX, e.screenY);
        }
    }, true);

    document.addEventListener('mouseup', function() {
        if (dragging) {
            dragging = false;
            if (window.pywebview && window.pywebview.api) {
                window.pywebview.api.end_drag();
            }
        }
    }, true);

    console.log('[drag] Custom drag handler installed');
})();
"""


def _get_screen_size() -> tuple:
    """Return (width, height) of the primary monitor."""
    try:
        display = Gdk.Display.get_default()
        if display is not None:
            monitor = display.get_primary_monitor() or display.get_monitor(0)
            if monitor is not None:
                geom = monitor.get_geometry()
                return (geom.width, geom.height)
    except Exception:
        pass
    try:
        import subprocess, re
        out = subprocess.check_output(["xrandr", "--query"], text=True, timeout=3)
        m = re.search(r"(\d+)x(\d+)\+0\+0", out)
        if m:
            return (int(m.group(1)), int(m.group(2)))
    except Exception:
        pass
    return (1920, 1080)


def _force_gtk_decoration():
    """Find the pywebview GTK window and force standard decorations."""
    try:
        from webview.platforms.gtk import BrowserView
        for instance in BrowserView.instances.values():
            gtk_win = instance.window
            gtk_win.set_decorated(True)
            gtk_win.set_type_hint(Gdk.WindowTypeHint.NORMAL)
            print(f"[window] Forced decoration on GTK window "
                  f"(decorated={gtk_win.get_decorated()})")
            return
    except Exception as e:
        print(f"[window] Could not force decoration: {e}")


def main():
    bridge = Bridge(STATE)

    screen_w, screen_h = _get_screen_size()

    win_w, win_h = 500, 580
    x = screen_w - win_w - 24
    y = screen_h - win_h - 48

    window = webview.create_window(
        title="CodeCrate",
        url=Path(HTML_FILE).as_uri(),
        js_api=bridge,
        width=win_w,
        height=win_h,
        x=x,
        y=y,
        resizable=True,
        frameless=False,
        easy_drag=True,
        on_top=False,
        background_color="#111114",
        min_size=(300, 280),
    )

    bridge.set_window(window)

    def on_shown():
        time.sleep(0.5)
<<<<<<< HEAD
        GLib.idle_add(_force_gtk_decoration)
=======
        # 1. Force GTK window decoration (native title bar → native drag)
        GLib.idle_add(_force_gtk_decoration)
        # 2. Inject JS-bridge drag on topbar/footer as additional mechanism
>>>>>>> e0606f38c3d0c50b507c19ef778500e4bc8b82f3
        time.sleep(0.2)
        window.evaluate_js(_DRAG_JS)
        print("[window] Drag JS injected")

    def quit_app(icon=None):
        if icon:
            icon.stop()
        window.destroy()

    start_tray(window, quit_app)
    webview.start(on_shown, gui="gtk", debug=False)


if __name__ == "__main__":
    main()
