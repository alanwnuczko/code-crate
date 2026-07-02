import os
import time
import ctypes
import ctypes.wintypes as wt
from ctypes import c_int, POINTER

import webview

from bridge import Bridge
from tray import start as start_tray
from win32_desktop import pin_window_to_desktop
from config import HTML_FILE, STATE_FILE

STATE = STATE_FILE

_u32 = ctypes.windll.user32
_gdi = ctypes.windll.gdi32

try:
    _dwm = ctypes.windll.dwmapi
except:
    _dwm = None

DWMWA_WINDOW_CORNER_PREFERENCE = 33
DWMWCP_ROUND = 2

GWL_EXSTYLE = -20
WS_EX_APPWINDOW = 0x00040000
WS_EX_TOOLWINDOW = 0x00000080
SWP_FRAMECHANGED = 0x0020
SWP_NOMOVE = 0x0002
SWP_NOSIZE = 0x0001
SWP_NOZORDER = 0x0004


def _resolve_hwnd(window) -> int:
<<<<<<< HEAD
    cached = getattr(window, '_cached_hwnd', None)
    if cached:
        return int(cached)

    try:
        hwnd = window.get_current_window()
        if hwnd:
            setattr(window, '_cached_hwnd', int(hwnd))
=======
    try:
        hwnd = window.get_current_window()
        if hwnd:
>>>>>>> e0606f38c3d0c50b507c19ef778500e4bc8b82f3
            return int(hwnd)
    except Exception:
        pass

    pid    = os.getpid()
    found  = ctypes.c_void_p(0)
    _EPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, wt.HWND, wt.LPARAM)

    def _cb(hwnd, _):
        nonlocal found
        lp_pid = wt.DWORD()
        _u32.GetWindowThreadProcessId(hwnd, ctypes.byref(lp_pid))
        if lp_pid.value == pid and _u32.IsWindowVisible(hwnd):
            found = hwnd
        return True

    _u32.EnumWindows(_EPROC(_cb), 0)
<<<<<<< HEAD
    res = int(found) if found else 0
    if res:
        setattr(window, '_cached_hwnd', res)
    return res
=======
    return int(found) if found else 0
>>>>>>> e0606f38c3d0c50b507c19ef778500e4bc8b82f3


def _round_window_corners(hwnd: int, radius: int = 16):
    try:
        if _dwm:
            try:
                preference = c_int(DWMWCP_ROUND)
                _dwm.DwmSetWindowAttribute(hwnd, DWMWA_WINDOW_CORNER_PREFERENCE, ctypes.byref(preference), ctypes.sizeof(preference))
                return
            except Exception:
                pass

        rect = wt.RECT()
        _u32.GetWindowRect(hwnd, ctypes.byref(rect))
        width = rect.right - rect.left
        height = rect.bottom - rect.top

        rgn = _gdi.CreateRoundRectRgn(0, 0, width, height, radius * 2, radius * 2)
        _u32.SetWindowRgn(hwnd, rgn, True)
    except Exception as e:
        print(f"[window] Error rounding corners: {e}")


def _hide_from_taskbar(hwnd: int):
    try:
        style = _u32.GetWindowLongW(hwnd, GWL_EXSTYLE)

        style &= ~WS_EX_APPWINDOW
        style |= WS_EX_TOOLWINDOW

        _u32.SetWindowLongW(hwnd, GWL_EXSTYLE, style)

        _u32.SetWindowPos(hwnd, None, 0, 0, 0, 0, SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER)
    except Exception as e:
        print(f"[window] Error hiding from taskbar: {e}")


def main():
    bridge   = Bridge(STATE)
    screen_w = _u32.GetSystemMetrics(0)
    screen_h = _u32.GetSystemMetrics(1)

    win_w, win_h = 500, 580
    x = screen_w - win_w - 24
    y = screen_h - win_h - 48

    window = webview.create_window(
        title="CodeCrate",
        url=f"file:///{HTML_FILE}",
        js_api=bridge,
        width=win_w,
        height=win_h,
        x=x,
        y=y,
        resizable=True,
        frameless=True,
        easy_drag=False,
        on_top=False,
        background_color="#111114",
        min_size=(300, 280),
        shadow=False,
    )

    bridge.set_window(window)

    hwnd_ref = [None]

<<<<<<< HEAD
=======
    def on_shown():
        time.sleep(0.3)
        hwnd = _resolve_hwnd(window)
        if hwnd:
            hwnd_ref[0] = hwnd
            pin_window_to_desktop(hwnd)
            time.sleep(0.1)
            _round_window_corners(hwnd, radius=16)
            _hide_from_taskbar(hwnd)

>>>>>>> e0606f38c3d0c50b507c19ef778500e4bc8b82f3
    def quit_app(icon=None):
        if icon:
            icon.stop()
        window.destroy()

<<<<<<< HEAD
    set_pin = start_tray(window, quit_app)
    bridge.set_pin_callback(set_pin)

    def on_shown():
        time.sleep(0.3)
        hwnd = _resolve_hwnd(window)
        if hwnd:
            setattr(window, '_cached_hwnd', hwnd)
            hwnd_ref[0] = hwnd
            _round_window_corners(hwnd, radius=16)
            _hide_from_taskbar(hwnd)

            from win32_desktop import _install_drag_filter
            _install_drag_filter(hwnd)

            state = bridge.load_note()
            should_pin = state.get("pinned", True)
            set_pin(should_pin)
            try:
                window.evaluate_js(f"window.__setPinUI && window.__setPinUI({str(should_pin).lower()})")
            except Exception:
                pass
=======
    start_tray(window, quit_app)
>>>>>>> e0606f38c3d0c50b507c19ef778500e4bc8b82f3
    webview.start(on_shown, debug=False)


if __name__ == "__main__":
    main()
