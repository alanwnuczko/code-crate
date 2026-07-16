import ctypes
import ctypes.wintypes as wt
import time
import threading

_pending_repin_hwnd = None
_dialog_open = False


def set_dialog_open(is_open: bool):
    global _dialog_open
    _dialog_open = bool(is_open)


def is_dialog_open() -> bool:
    global _dialog_open
    return _dialog_open

_u32   = ctypes.windll.user32
_ENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, wt.HWND, wt.LPARAM)

_u32.SetWindowPos.argtypes = [wt.HWND, wt.HWND, ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_int, wt.UINT]
_u32.SetWindowPos.restype = wt.BOOL
_u32.SetParent.argtypes = [wt.HWND, wt.HWND]
_u32.SetParent.restype = wt.HWND
_u32.GetWindowLongPtrW.argtypes = [wt.HWND, ctypes.c_int]
_u32.GetWindowLongPtrW.restype = ctypes.c_ssize_t
_u32.SetWindowLongPtrW.argtypes = [wt.HWND, ctypes.c_int, ctypes.c_ssize_t]
_u32.SetWindowLongPtrW.restype = ctypes.c_ssize_t
_u32.GetClassNameW.argtypes = [wt.HWND, wt.LPWSTR, ctypes.c_int]
_u32.GetClassNameW.restype = ctypes.c_int
_u32.CallWindowProcW.argtypes = [ctypes.c_ssize_t, wt.HWND, wt.UINT, wt.WPARAM, wt.LPARAM]
_u32.CallWindowProcW.restype = ctypes.c_ssize_t
_u32.ScreenToClient.argtypes = [wt.HWND, wt.LPPOINT]
_u32.ScreenToClient.restype = wt.BOOL

_GWL_STYLE        = -16
_GWL_EXSTYLE      = -20
_GWLP_WNDPROC     = -4
_WS_POPUP         = 0x80000000
_WS_CHILD         = 0x40000000
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
    res = int(found) if found else 0
    if not res:
        res = int(_u32.FindWindowW("Progman", None))
    return res


def _install_drag_filter(hwnd: int, topbar_px: int = _drag_zone_px,
                          footer_px: int = _drag_zone_px, drop_callback=None):
    global _wndproc_orig, _wndproc_new
    if _wndproc_orig is not None:
        return

    if drop_callback:
        try:
            ctypes.windll.shell32.DragAcceptFiles(hwnd, True)
            def _cb_child(child_hwnd, _):
                try:
                    ctypes.windll.shell32.DragAcceptFiles(child_hwnd, True)
                except Exception:
                    pass
                return True
            _u32.EnumChildWindows(hwnd, _ENUMPROC(_cb_child), 0)
        except Exception as e:
            print(f"[win32] DragAcceptFiles error: {e}")

    WNDPROCTYPE = ctypes.WINFUNCTYPE(
        ctypes.c_long, wt.HWND, wt.UINT, wt.WPARAM, wt.LPARAM
    )

    orig_proc = _u32.GetWindowLongPtrW(hwnd, _GWLP_WNDPROC)

    def _proc(h, msg, wp, lp):
        global _pending_repin_hwnd
        if msg == 0x0233:
            try:
                hdrop = wp
                count = ctypes.windll.shell32.DragQueryFileW(hdrop, 0xFFFFFFFF, None, 0)
                paths = []
                for i in range(count):
                    length = ctypes.windll.shell32.DragQueryFileW(hdrop, i, None, 0)
                    if length > 0:
                        buf = ctypes.create_unicode_buffer(length + 1)
                        ctypes.windll.shell32.DragQueryFileW(hdrop, i, buf, length + 1)
                        paths.append(buf.value)
                ctypes.windll.shell32.DragFinish(hdrop)
                if paths and drop_callback:
                    threading.Thread(target=drop_callback, args=(paths,), daemon=True).start()
            except Exception as e:
                print(f"[win32] WM_DROPFILES error: {e}")
            return 0

        if _pending_repin_hwnd == h and not is_dialog_open():
            if (msg == 0x0006 and (wp & 0xFFFF) == 0) or msg == 0x0008 or (msg == 0x0086 and wp == 0):
                _pending_repin_hwnd = None
                _execute_repin(h)
        if msg == _WM_NCHITTEST:
            parent = _u32.GetParent(h)
            desktop = _u32.GetDesktopWindow()
            if parent != 0 and parent != desktop:
                return _HTCLIENT
            cx = ctypes.c_short(lp & 0xFFFF).value
            cy = ctypes.c_short(lp >> 16).value
            rect = wt.RECT()
            _u32.GetWindowRect(h, ctypes.byref(rect))
            rel_x = cx - rect.left
            rel_y = cy - rect.top
            win_w = rect.right - rect.left
            win_h = rect.bottom - rect.top

            if rel_y <= 10 or (rel_y <= topbar_px and rel_x > 310 and rel_x < win_w - 300):
                return _HTCAPTION
            if rel_y >= win_h - 10 or (rel_y >= win_h - footer_px and rel_x > 380 and rel_x < win_w - 240):
                return _HTCAPTION
            return _HTCLIENT
        return _u32.CallWindowProcW(orig_proc, h, msg, wp, lp)

    _wndproc_new  = WNDPROCTYPE(_proc)
    _wndproc_orig = orig_proc
    func_ptr = ctypes.cast(_wndproc_new, ctypes.c_void_p).value
    _u32.SetWindowLongPtrW(hwnd, _GWLP_WNDPROC, func_ptr)


def pin_window_to_desktop(hwnd: int) -> bool:
    rect = wt.RECT()
    _u32.GetWindowRect(hwnd, ctypes.byref(rect))
    x, y = rect.left, rect.top
    w, h = rect.right - rect.left, rect.bottom - rect.top

    _spawn_workerw()
    time.sleep(0.18)

    workerw = _find_workerw()
    if not workerw:
        return False

    pt = wt.POINT(x, y)
    _u32.ScreenToClient(workerw, ctypes.byref(pt))

    style = _u32.GetWindowLongPtrW(hwnd, _GWL_STYLE)
    style = (style | _WS_CHILD) & ~_WS_POPUP
    _u32.SetWindowLongPtrW(hwnd, _GWL_STYLE, style)

    _u32.SetParent(hwnd, workerw)

    ex = _u32.GetWindowLongPtrW(hwnd, _GWL_EXSTYLE)
    ex = (ex | _WS_EX_TOOLWINDOW | _WS_EX_NOACTIVATE) & ~_WS_EX_APPWINDOW
    _u32.SetWindowLongPtrW(hwnd, _GWL_EXSTYLE, ex)

    SWP_FRAMECHANGED = 0x0020
    SWP_SHOWWINDOW   = 0x0040
    SWP_NOACTIVATE   = 0x0010
    SWP_NOZORDER     = 0x0004
    _u32.SetWindowPos(hwnd, None, pt.x, pt.y, w, h,
                      SWP_NOZORDER | SWP_NOACTIVATE | SWP_FRAMECHANGED | SWP_SHOWWINDOW)
    _u32.ShowWindow(hwnd, 5)

    _install_drag_filter(hwnd)
    return True


def unpin_from_desktop(hwnd: int) -> bool:
    global _pending_repin_hwnd
    _pending_repin_hwnd = None
    try:
        rect = wt.RECT()
        _u32.GetWindowRect(hwnd, ctypes.byref(rect))
        x, y = rect.left, rect.top
        w, h = rect.right - rect.left, rect.bottom - rect.top

        _u32.SetParent(hwnd, None)

        style = _u32.GetWindowLongPtrW(hwnd, _GWL_STYLE)
        style = (style & ~_WS_CHILD) | _WS_POPUP
        _u32.SetWindowLongPtrW(hwnd, _GWL_STYLE, style)

        ex = _u32.GetWindowLongPtrW(hwnd, _GWL_EXSTYLE)
        ex = (ex | _WS_EX_TOOLWINDOW) & ~_WS_EX_NOACTIVATE & ~_WS_EX_APPWINDOW
        _u32.SetWindowLongPtrW(hwnd, _GWL_EXSTYLE, ex)

        SWP_FRAMECHANGED = 0x0020
        SWP_SHOWWINDOW   = 0x0040
        _u32.SetWindowPos(hwnd, ctypes.c_void_p(-1), x, y, w, h,
                          SWP_FRAMECHANGED | SWP_SHOWWINDOW)

        _u32.ShowWindow(hwnd, 5)
        _u32.SetForegroundWindow(hwnd)
        _install_drag_filter(hwnd)
        return True
    except Exception as e:
        print(f"[window] Error unpinning from desktop: {e}")
        return False


def _execute_repin(hwnd: int) -> bool:
    global _pending_repin_hwnd
    _pending_repin_hwnd = None
    try:
        _spawn_workerw()
        time.sleep(0.18)
        workerw = _find_workerw()
        if not workerw:
            return False

        if _u32.GetParent(hwnd) == workerw:
            return True

        rect = wt.RECT()
        _u32.GetWindowRect(hwnd, ctypes.byref(rect))
        x, y = rect.left, rect.top
        w, h = rect.right - rect.left, rect.bottom - rect.top

        pt = wt.POINT(x, y)
        _u32.ScreenToClient(workerw, ctypes.byref(pt))

        SWP_NOMOVE     = 0x0002
        SWP_NOSIZE     = 0x0001
        SWP_NOACTIVATE = 0x0010
        _u32.SetWindowPos(hwnd, ctypes.c_void_p(-2), 0, 0, 0, 0,
                          SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE)

        style = _u32.GetWindowLongPtrW(hwnd, _GWL_STYLE)
        style = (style | _WS_CHILD) & ~_WS_POPUP
        _u32.SetWindowLongPtrW(hwnd, _GWL_STYLE, style)

        _u32.SetParent(hwnd, workerw)

        ex = _u32.GetWindowLongPtrW(hwnd, _GWL_EXSTYLE)
        ex = (ex | _WS_EX_TOOLWINDOW | _WS_EX_NOACTIVATE) & ~_WS_EX_APPWINDOW
        _u32.SetWindowLongPtrW(hwnd, _GWL_EXSTYLE, ex)

        SWP_FRAMECHANGED = 0x0020
        SWP_SHOWWINDOW   = 0x0040
        SWP_NOZORDER     = 0x0004
        _u32.SetWindowPos(hwnd, None, pt.x, pt.y, w, h,
                          SWP_NOZORDER | SWP_NOACTIVATE | SWP_FRAMECHANGED | SWP_SHOWWINDOW)
        _u32.ShowWindow(hwnd, 5)
        return True
    except Exception as e:
        print(f"[window] Error repinning to desktop: {e}")
        return False


def repin_to_desktop(hwnd: int) -> bool:
    global _pending_repin_hwnd
    fg = _u32.GetForegroundWindow()
    if fg == hwnd or fg == 0:
        _pending_repin_hwnd = hwnd
        SWP_NOMOVE = 0x0002
        SWP_NOSIZE = 0x0001
        _u32.SetWindowPos(hwnd, ctypes.c_void_p(-2), 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE)

        def _watch_blur():
            global _pending_repin_hwnd
            while _pending_repin_hwnd == hwnd:
                if is_dialog_open():
                    time.sleep(0.08)
                    continue
                time.sleep(0.08)
                if is_dialog_open():
                    continue
                curr = _u32.GetForegroundWindow()
                if curr != hwnd and curr != 0:
                    _pending_repin_hwnd = None
                    _execute_repin(hwnd)
                    break
        threading.Thread(target=_watch_blur, daemon=True).start()
        return True
    else:
        _pending_repin_hwnd = None
        return _execute_repin(hwnd)


def peek_desktop_widget(hwnd: int) -> bool:
    global _pending_repin_hwnd
    try:
        rect = wt.RECT()
        _u32.GetWindowRect(hwnd, ctypes.byref(rect))
        x, y = rect.left, rect.top
        w, h = rect.right - rect.left, rect.bottom - rect.top

        _u32.SetParent(hwnd, None)

        style = _u32.GetWindowLongPtrW(hwnd, _GWL_STYLE)
        style = (style & ~_WS_CHILD) | _WS_POPUP
        _u32.SetWindowLongPtrW(hwnd, _GWL_STYLE, style)

        ex = _u32.GetWindowLongPtrW(hwnd, _GWL_EXSTYLE)
        ex = (ex | _WS_EX_TOOLWINDOW) & ~_WS_EX_NOACTIVATE & ~_WS_EX_APPWINDOW
        _u32.SetWindowLongPtrW(hwnd, _GWL_EXSTYLE, ex)

        SWP_FRAMECHANGED = 0x0020
        SWP_SHOWWINDOW   = 0x0040
        _u32.SetWindowPos(hwnd, ctypes.c_void_p(-1), x, y, w, h, SWP_FRAMECHANGED | SWP_SHOWWINDOW)
        _u32.ShowWindow(hwnd, 5)
        _u32.SetForegroundWindow(hwnd)

        SWP_NOMOVE = 0x0002
        SWP_NOSIZE = 0x0001
        _u32.SetWindowPos(hwnd, ctypes.c_void_p(-2), 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE)

        _pending_repin_hwnd = hwnd
        def _watch_blur():
            global _pending_repin_hwnd
            while _pending_repin_hwnd == hwnd:
                if is_dialog_open():
                    time.sleep(0.08)
                    continue
                time.sleep(0.08)
                if is_dialog_open():
                    continue
                curr = _u32.GetForegroundWindow()
                if curr != hwnd and curr != 0:
                    _pending_repin_hwnd = None
                    _execute_repin(hwnd)
                    break
        threading.Thread(target=_watch_blur, daemon=True).start()
        return True
    except Exception as e:
        print(f"[window] Error peeking widget: {e}")
        return False
