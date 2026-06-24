import ctypes
import ctypes.wintypes as wt
import time

_u32   = ctypes.windll.user32
_ENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, wt.HWND, wt.LPARAM)

_GWL_EXSTYLE      = -20
_GWLP_WNDPROC     = -4
_WS_EX_TOOLWINDOW = 0x00000080
_WS_EX_NOACTIVATE = 0x08000000
_WS_EX_APPWINDOW  = 0x00040000
_WM_SPAWN_WORKER  = 0x052C
_WM_NCHITTEST     = 0x0084

_HTCLIENT  = 1
_HTCAPTION = 2

_wndproc_orig = None
_wndproc_new  = None
_drag_zone_px = 36


def _spawn_workerw():
    progman = _u32.FindWindowW("Progman", None)
    result  = wt.DWORD()
    _u32.SendMessageTimeoutW(progman, _WM_SPAWN_WORKER, 0xD, 0x1, 0, 1000,
                             ctypes.byref(result))


def _find_workerw() -> int:
    found = ctypes.c_void_p(0)

    def _cb(hwnd, _):
        nonlocal found
        if _u32.FindWindowExW(hwnd, None, "SHELLDLL_DefView", None):
            found = _u32.FindWindowExW(None, hwnd, "WorkerW", None)
        return True

    _u32.EnumWindows(_ENUMPROC(_cb), 0)
    return int(found) if found else 0


def _install_drag_filter(hwnd: int, topbar_px: int = _drag_zone_px,
                          footer_px: int = _drag_zone_px):
    global _wndproc_orig, _wndproc_new

    WNDPROCTYPE = ctypes.WINFUNCTYPE(
        ctypes.c_long, wt.HWND, wt.UINT, wt.WPARAM, wt.LPARAM
    )

    orig_proc = _u32.GetWindowLongPtrW(hwnd, _GWLP_WNDPROC)

    def _proc(h, msg, wp, lp):
        if msg == _WM_NCHITTEST:
            cy = ctypes.c_short(lp >> 16).value
            rect = wt.RECT()
            _u32.GetWindowRect(h, ctypes.byref(rect))
            rel_y = cy - rect.top
            win_h = rect.bottom - rect.top
            if rel_y <= topbar_px or rel_y >= win_h - footer_px:
                return _HTCAPTION
            return _HTCLIENT
        return ctypes.windll.user32.CallWindowProcW(orig_proc, h, msg, wp, lp)

    _wndproc_new  = WNDPROCTYPE(_proc)
    _wndproc_orig = orig_proc
    _u32.SetWindowLongPtrW(hwnd, _GWLP_WNDPROC, _wndproc_new)


def pin_window_to_desktop(hwnd: int) -> bool:
    _spawn_workerw()
    time.sleep(0.18)

    workerw = _find_workerw()
    if not workerw:
        return False

    _u32.SetParent(hwnd, workerw)

    ex = _u32.GetWindowLongPtrW(hwnd, _GWL_EXSTYLE)
    ex = (ex | _WS_EX_TOOLWINDOW | _WS_EX_NOACTIVATE) & ~_WS_EX_APPWINDOW
    _u32.SetWindowLongPtrW(hwnd, _GWL_EXSTYLE, ex)

    _install_drag_filter(hwnd)
    return True
