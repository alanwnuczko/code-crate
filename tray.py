import threading
import time
import ctypes
import ctypes.wintypes as wt
from typing import Callable

_u32 = ctypes.windll.user32

def _get_tray_position() -> tuple:
    screen_w = _u32.GetSystemMetrics(0)
    screen_h = _u32.GetSystemMetrics(1)
    return (screen_w - 16, screen_h - 16)


def _get_window_hwnd(window) -> int:
    try:
        hwnd = window.get_current_window()
        if hwnd:
            return int(hwnd)
    except Exception:
        pass

    import os
    pid = os.getpid()
    found = ctypes.c_void_p(0)
    _EPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, wt.HWND, wt.LPARAM)

    def _cb(hwnd, _):
        nonlocal found
        lp_pid = wt.DWORD()
        _u32.GetWindowThreadProcessId(hwnd, ctypes.byref(lp_pid))
        if lp_pid.value == pid:
            found = hwnd
            return False
        return True

    _u32.EnumWindows(_EPROC(_cb), 0)
    return int(found) if found else 0


def _animate_collapse(window, hwnd: int, start_pos: tuple, end_pos: tuple, duration: float = 0.3):
    start_time = time.time()
    rect = wt.RECT()

    while True:
        elapsed = time.time() - start_time
        progress = min(elapsed / duration, 1.0)

        _u32.GetWindowRect(hwnd, ctypes.byref(rect))
        current_x = rect.left
        current_y = rect.top
        current_w = rect.right - rect.left
        current_h = rect.bottom - rect.top

        new_x = int(start_pos[0] + (end_pos[0] - start_pos[0]) * progress)
        new_y = int(start_pos[1] + (end_pos[1] - start_pos[1]) * progress)
        new_w = max(int(current_w * (1 - progress)), 1)
        new_h = max(int(current_h * (1 - progress)), 1)

        _u32.SetWindowPos(hwnd, 0, new_x, new_y, new_w, new_h, 0)

        if progress >= 1.0:
            break
        time.sleep(0.01)


def _animate_expand(window, hwnd: int, start_pos: tuple, end_pos: tuple, end_size: tuple, duration: float = 0.3):
    start_time = time.time()

    while True:
        elapsed = time.time() - start_time
        progress = min(elapsed / duration, 1.0)

        new_x = int(start_pos[0] + (end_pos[0] - start_pos[0]) * progress)
        new_y = int(start_pos[1] + (end_pos[1] - start_pos[1]) * progress)
        new_w = int(1 + (end_size[0] - 1) * progress)
        new_h = int(1 + (end_size[1] - 1) * progress)

        _u32.SetWindowPos(hwnd, 0, new_x, new_y, new_w, new_h, 0)

        if progress >= 1.0:
            break
        time.sleep(0.01)


def start(window, on_quit: Callable):
    visible = [True]
    saved_pos = [None]
    saved_size = [None]
    default_pos = [None]
    default_size = [None]
    icon_ref = [None]
    is_animating = [False]

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
            pos = (int(rect.left), int(rect.top))
            size = (int(rect.right - rect.left), int(rect.bottom - rect.top))

            if pos[0] > -5000 and pos[0] < 30000 and pos[1] > -5000 and pos[1] < 30000:
                saved_pos[0] = pos
            if size[0] > 100 and size[0] < 10000 and size[1] > 100 and size[1] < 10000:
                saved_size[0] = size

            tray_pos = _get_tray_position()
            _animate_collapse(window, hwnd, pos, tray_pos, duration=0.25)

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

            hwnd = _get_window_hwnd(window)
            if not hwnd:
                window.show()
                visible[0] = True
                is_animating[0] = False
                return

            restore_pos = saved_pos[0] or default_pos[0]
            restore_size = saved_size[0] or default_size[0]

            if not restore_pos or not restore_size:
                window.show()
                visible[0] = True
                is_animating[0] = False
                return

            window.show()
            time.sleep(0.05)

            _u32.SetForegroundWindow(hwnd)
            _u32.ShowWindow(hwnd, 5)
            time.sleep(0.05)

            tray_pos = _get_tray_position()
            _animate_expand(window, hwnd, tray_pos, restore_pos, restore_size, duration=0.25)

            _u32.SetWindowPos(hwnd, None, restore_pos[0], restore_pos[1], restore_size[0], restore_size[1], 0)
            time.sleep(0.05)

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

    def _label(item):
        return "Collapse" if visible[0] else "Expand"

    def _run():
        try:
            import pystray
            from PIL import Image

            hwnd = _get_window_hwnd(window)
            if hwnd:
                rect = wt.RECT()
                _u32.GetWindowRect(hwnd, ctypes.byref(rect))
                default_pos[0] = (int(rect.left), int(rect.top))
                default_size[0] = (int(rect.right - rect.left), int(rect.bottom - rect.top))
                saved_pos[0] = default_pos[0]
                saved_size[0] = default_size[0]

            icon = pystray.Icon(
                "CodeCrate",
                Image.open("assets/tray.ico"),
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
