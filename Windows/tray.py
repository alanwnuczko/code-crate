import sys
import os
import threading
import time
import ctypes
import ctypes.wintypes as wt
from typing import Callable

_u32 = ctypes.windll.user32


def _bundle_path(*parts) -> str:
    """Resolve a path that lives inside the PyInstaller bundle (or source tree)."""
    if getattr(sys, "frozen", False):
        base = sys._MEIPASS
    else:
        base = os.path.dirname(os.path.abspath(__file__))
    target = os.path.join(base, *parts)
    if os.path.exists(target):
        return target
    return os.path.join(os.path.dirname(base), *parts)


def _get_tray_position() -> tuple:
    screen_w = _u32.GetSystemMetrics(0)
    screen_h = _u32.GetSystemMetrics(1)
    return (screen_w - 16, screen_h - 16)


def _get_window_hwnd(window) -> int:
    cached = getattr(window, '_cached_hwnd', None)
    if cached:
        return int(cached)

    try:
        if hasattr(window, 'native') and window.native:
            try:
                h = int(window.native.Handle)
                if h:
                    setattr(window, '_cached_hwnd', h)
                    return h
            except Exception:
                try:
                    h = int(window.native)
                    if h:
                        setattr(window, '_cached_hwnd', h)
                        return h
                except Exception:
                    pass
    except Exception:
        pass

    try:
        hwnd = window.get_current_window()
        if hwnd:
            setattr(window, '_cached_hwnd', int(hwnd))
            return int(hwnd)
    except Exception:
        pass

    import os as _os
    pid = _os.getpid()
    found = 0
    _EPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, wt.HWND, wt.LPARAM)

    def _cb(h, _):
        nonlocal found
        lp_pid = wt.DWORD()
        _u32.GetWindowThreadProcessId(h, ctypes.byref(lp_pid))
        if lp_pid.value == pid:
            found = int(h)
            return False
        return True

    _u32.EnumWindows(_EPROC(_cb), 0)
    if not found:
        def _child_cb(h, _):
            nonlocal found
            lp_pid = wt.DWORD()
            _u32.GetWindowThreadProcessId(h, ctypes.byref(lp_pid))
            if lp_pid.value == pid:
                found = int(h)
                return False
            return True
        _u32.EnumChildWindows(0, _EPROC(_child_cb), 0)

    if found:
        setattr(window, '_cached_hwnd', found)
    return found


def _animate_collapse(window, hwnd: int, start_pos: tuple, end_pos: tuple, duration: float = 0.3):
    pass


def _animate_expand(window, hwnd: int, start_pos: tuple, end_pos: tuple, end_size: tuple, duration: float = 0.3):
    pass


def start(window, on_quit: Callable):
    visible = [True]
    saved_pos = [None]
    saved_size = [None]
    default_pos = [None]
    default_size = [None]
    icon_ref = [None]
    is_animating = [False]
    is_pinned = [False]

    def _collapse_to_tray():
        try:
            if is_animating[0]:
                return
            is_animating[0] = True

            hwnd = _get_window_hwnd(window)
            if not hwnd:
                window.hide()
                visible[0] = False
                is_animating[0] = False
                return

            rect = wt.RECT()
            _u32.GetWindowRect(hwnd, ctypes.byref(rect))
            pos  = (int(rect.left), int(rect.top))
            size = (int(rect.right - rect.left), int(rect.bottom - rect.top))

            if -5000 < pos[0] < 30000 and -5000 < pos[1] < 30000:
                saved_pos[0] = pos
            if 100 < size[0] < 10000 and 100 < size[1] < 10000:
                saved_size[0] = size

            window.hide()
            visible[0] = False
            is_animating[0] = False
        except Exception as exc:
            print(f"[tray] Error collapsing: {exc}")
            window.hide()
            visible[0] = False
            is_animating[0] = False

    def _expand_from_tray():
        try:
            if is_animating[0]:
                return
            is_animating[0] = True

            window.show()
            time.sleep(0.05)

            hwnd = _get_window_hwnd(window)
            if hwnd:
                if is_pinned[0]:
                    _u32.ShowWindow(hwnd, 5)
                    _u32.SetForegroundWindow(hwnd)
                    _u32.BringWindowToTop(hwnd)
                else:
                    from win32_desktop import peek_desktop_widget
                    peek_desktop_widget(hwnd)

            visible[0] = True
            is_animating[0] = False
        except Exception as exc:
            print(f"[tray] Error expanding: {exc}")
            window.show()
            visible[0] = True
            is_animating[0] = False

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

    def set_pin_state(pinned):
        """Toggle always-on-top. Called from the bridge when the user clicks Pin."""
        from win32_desktop import unpin_from_desktop, repin_to_desktop
        hwnd = _get_window_hwnd(window)
        if not hwnd:
            print("[tray] set_pin_state failed: could not resolve window hwnd")
            return False

        if pinned:
            result = unpin_from_desktop(hwnd)
        else:
            result = repin_to_desktop(hwnd)

        if result:
            is_pinned[0] = pinned
        else:
            print(f"[tray] set_pin_state({pinned}) win32 call returned False")
        return result

    def _label(item):
        return "Collapse" if visible[0] else "Expand"

    def _pin_label(item):
        return "Unpin from Top" if is_pinned[0] else "Pin to Top"

    def _toggle_pin(icon=None, item=None):
        target = not is_pinned[0]
        set_pin_state(target)
        try:
            window.evaluate_js(f"window.__setPinUI && window.__setPinUI({str(target).lower()})")
        except Exception:
            pass
        if icon_ref[0]:
            try:
                icon_ref[0].update_menu()
            except Exception:
                pass

    def _run():
        try:
            import pystray
            from PIL import Image

            hwnd = _get_window_hwnd(window)
            if hwnd:
                rect = wt.RECT()
                _u32.GetWindowRect(hwnd, ctypes.byref(rect))
                default_pos[0]  = (int(rect.left), int(rect.top))
                default_size[0] = (int(rect.right - rect.left), int(rect.bottom - rect.top))
                saved_pos[0]    = default_pos[0]
                saved_size[0]   = default_size[0]

            icon_path = _bundle_path("assets", "tray.ico")
            icon = pystray.Icon(
                "CodeCrate",
                Image.open(icon_path),
                "CodeCrate",
                menu=pystray.Menu(
                    pystray.MenuItem(_label, _toggle, default=True),
                    pystray.MenuItem(_pin_label, _toggle_pin),
                    pystray.Menu.SEPARATOR,
                    pystray.MenuItem("Quit", lambda icon, item: on_quit(icon)),
                ),
            )

            icon_ref[0] = icon
            icon.run()

        except Exception as exc:
            print(f"[tray] {exc}")

    threading.Thread(target=_run, daemon=True).start()

    return set_pin_state
