import os
import time
from pathlib import Path

import gi
gi.require_version("Gtk", "3.0")
gi.require_version("Gdk", "3.0")
from gi.repository import Gtk, Gdk, GLib
try:
    Gtk.init()
except TypeError:
    Gtk.init([])

import webview
try:
    import webview.dom
except Exception:
    pass

from bridge import Bridge
from tray import start as start_tray
from config import HTML_FILE, STATE_FILE

STATE = STATE_FILE

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

    document.querySelectorAll('.pywebview-drag-region').forEach(function(region) {
        region.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            if (isInteractive(e.target)) return;

            dragging = true;
            if (window.pywebview && window.pywebview.api) {
                window.pywebview.api.start_drag(e.screenX, e.screenY);
            }
            e.preventDefault();
        }, true);
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
    try:
        from webview.platforms.gtk import BrowserView
        for instance in BrowserView.instances.values():
            gtk_win = instance.window
            gtk_win.set_decorated(True)
            gtk_win.set_type_hint(Gdk.WindowTypeHint.NORMAL)
            icon_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                os.pardir, "assets", "tray.png",
            )
            if not os.path.isfile(icon_path):
                icon_path = os.path.join(
                    os.path.dirname(os.path.abspath(__file__)),
                    "assets", "tray.png",
                )
            if os.path.isfile(icon_path):
                gtk_win.set_icon_from_file(icon_path)
                Gtk.Window.set_default_icon_from_file(icon_path)
                print(f"[window] Icon set from {icon_path}")

            print(f"[window] Forced decoration on GTK window "
                  f"(decorated={gtk_win.get_decorated()})")
            return
    except Exception as e:
        print(f"[window] Could not force decoration: {e}")


def _uri_to_path(uri_or_path: str) -> str:
    import urllib.parse

    s = (uri_or_path or "").strip().strip("\r\n\t ")
    if not s or s.startswith("#"):
        return ""
    if s.startswith("file:"):
        parsed = urllib.parse.urlparse(s)
        return urllib.parse.unquote(parsed.path or "")
    if s.startswith("/"):
        return s
    return urllib.parse.unquote(s) if "%" in s else s


def _extract_paths_from_selection_data(data) -> list:
    paths = []
    seen = set()

    def _add(raw: str):
        path = _uri_to_path(raw)
        if not path or path in seen:
            return
        if os.path.isfile(path):
            seen.add(path)
            paths.append(path)

    try:
        uris = data.get_uris()
        if uris:
            for u in uris:
                _add(u)
    except Exception:
        pass

    if paths:
        return paths

    try:
        text = data.get_text()
    except Exception:
        text = None
    if text:
        for line in text.replace("\r", "\n").split("\n"):
            _add(line)

    return paths


_pending_native_drop_paths: list = []


def _inject_js_nonblocking(js: str) -> None:
    try:
        from webview.platforms.gtk import BrowserView

        for inst in BrowserView.instances.values():
            wv = inst.webview

            def _run(_wv=wv, _js=js):
                try:
                    _wv.evaluate_javascript(
                        script=_js,
                        length=len(_js),
                        world_name=None,
                        source_uri=None,
                        cancellable=None,
                        callback=None,
                    )
                except TypeError:
                    try:
                        _wv.evaluate_javascript(_js, len(_js), None, None, None, None)
                    except Exception:
                        try:
                            _wv.run_javascript(_js, None, None, None)
                        except Exception as e2:
                            print(f"[drop] JS inject fallback error: {e2}")
                except Exception as e:
                    print(f"[drop] JS inject error: {e}")
                return False

            GLib.idle_add(_run)
            return
    except Exception as e:
        print(f"[drop] _inject_js_nonblocking error: {e}")


def _schedule_open_dropped_paths(window, bridge, paths):
    import json
    import threading

    paths = [p for p in paths if p]
    if not paths:
        return False

    for path in paths:
        try:
            _pending_native_drop_paths.remove(path)
        except ValueError:
            pass

    def _bg():
        for path in paths:
            if not bridge._note_drop_opened(path):
                continue
            try:
                res = bridge.open_file_by_path(path)
                if not res.get("ok"):
                    print(f"[drop] open failed for {path}: {res.get('error')}")
                    continue
                payload = json.dumps(res)
                js = f"window.onNativeDrop && window.onNativeDrop({payload})"
                print(f"[drop] opening tab for {path}")
                try:
                    window.evaluate_js(js)
                except Exception as e1:
                    print(f"[drop] evaluate_js failed ({e1}); nonblocking inject")
                    _inject_js_nonblocking(js)
            except Exception as e:
                print(f"[drop] error opening {path}: {e}")

    threading.Thread(target=_bg, daemon=True).start()
    return False


def _setup_gtk_drop_target(window, bridge):
    try:
        from webview.platforms.gtk import BrowserView
        import webview.dom

        for inst in BrowserView.instances.values():
            wv = inst.webview
            state = {"paths": [], "drop_pending": False}

            def _store_paths(paths):
                if not paths:
                    return
                state["paths"] = list(paths)
                _pending_native_drop_paths.clear()
                _pending_native_drop_paths.extend(paths)
                try:
                    pairs = [(os.path.basename(p), p) for p in paths]
                    webview.dom._dnd_state["paths"] = pairs
                except Exception:
                    pass
                try:
                    bridge._pending_drop_paths = list(paths)
                except Exception:
                    pass

            def on_drag_motion(widget, context, x, y, time):
                try:
                    Gdk.drag_status(context, Gdk.DragAction.COPY, time)
                except Exception:
                    pass
                return False

            def on_drag_motion_after(widget, context, x, y, time):
                try:
                    Gdk.drag_status(context, Gdk.DragAction.COPY, time)
                except Exception:
                    pass
                return True

            def on_drag_data_received(widget, ctx, x, y, data, info, time):
                paths = _extract_paths_from_selection_data(data)
                if not paths:
                    return
                print(f"[drop] drag-data-received paths={paths}")
                _store_paths(paths)
                if state.get("drop_pending"):
                    state["drop_pending"] = False
                    GLib.idle_add(
                        _schedule_open_dropped_paths, window, bridge, list(paths)
                    )

            def on_drag_drop(widget, ctx, x, y, time):
                print("[drop] drag-drop signal")
                state["drop_pending"] = True
                paths = list(state["paths"]) or list(_pending_native_drop_paths)

                if not paths:
                    try:
                        atom = Gdk.Atom.intern("text/uri-list", False)
                        try:
                            targets = ctx.list_targets()
                            if targets:
                                for t in targets:
                                    try:
                                        name = t.name() if hasattr(t, "name") else str(t)
                                    except Exception:
                                        name = str(t)
                                    if name == "text/uri-list":
                                        atom = t
                                        break
                        except Exception:
                            pass
                        widget.drag_get_data(ctx, atom, time)
                    except Exception as e:
                        print(f"[drop] drag_get_data note: {e}")

                if paths:
                    state["paths"] = []
                    state["drop_pending"] = False
                    print(f"[drop] drag-drop opening paths={paths}")
                    GLib.idle_add(
                        _schedule_open_dropped_paths, window, bridge, list(paths)
                    )
                else:
                    def _delayed_flush():
                        pending = list(state["paths"]) or list(_pending_native_drop_paths)
                        if pending:
                            state["paths"] = []
                            state["drop_pending"] = False
                            print(f"[drop] delayed flush paths={pending}")
                            _schedule_open_dropped_paths(window, bridge, list(pending))
                        return False

                    GLib.timeout_add(80, _delayed_flush)
                    GLib.timeout_add(200, _delayed_flush)

                return False

            def on_drag_leave(widget, ctx, time):
                def _clear():
                    if not state.get("drop_pending"):
                        state["paths"] = []
                    return False
                GLib.timeout_add(300, _clear)

            try:
                wv.drag_dest_add_uri_targets()
            except Exception as e:
                print(f"[drop] drag_dest_add_uri_targets note: {e}")

            wv.connect("drag-motion", on_drag_motion)
            try:
                wv.connect_after("drag-motion", on_drag_motion_after)
            except Exception:
                pass
            wv.connect("drag-data-received", on_drag_data_received)
            wv.connect("drag-drop", on_drag_drop)
            wv.connect("drag-leave", on_drag_leave)

            print("[drop] GTK/WebKit native drop hooks installed (no main-thread evaluate_js)")
            return
    except Exception as e:
        print(f"[drop] Failed to setup GTK drop target: {e}")


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

    def on_dropped(files):
        import json
        for f in files:
            path_str = ""
            if isinstance(f, str):
                path_str = f
            elif isinstance(f, dict):
                path_str = f.get("pywebviewFullPath") or f.get("path") or f.get("_path") or f.get("name") or ""
            else:
                for attr in ("pywebviewFullPath", "pywebview_full_path", "path", "_path", "filename", "name"):
                    val = getattr(f, attr, None)
                    if val and isinstance(val, str) and os.path.exists(val):
                        path_str = val
                        break
                if not path_str:
                    path_str = str(f)
            res = bridge.open_file_by_path(path_str)
            if res.get("ok"):
                payload = json.dumps(res)
                try:
                    window.evaluate_js(f"window.onNativeDrop && window.onNativeDrop({payload})")
                except Exception as e:
                    print(f"[drop] error evaluating js: {e}")

    def on_shown():
        time.sleep(0.5)
        GLib.idle_add(_force_gtk_decoration)
        time.sleep(0.2)
        GLib.idle_add(_setup_gtk_drop_target, window, bridge)
        try:
            window.evaluate_js(_DRAG_JS)
        except Exception as e:
            print(f"[window] Drag JS inject via evaluate_js failed: {e}")
            _inject_js_nonblocking(_DRAG_JS)
        print("[window] Drag JS injected")

    def quit_app(icon=None):
        if icon:
            icon.stop()
        window.destroy()

    start_tray(window, quit_app)

    try:
        webview.dom._dnd_state['num_listeners'] = 999
    except Exception:
        pass

    webview.start(on_shown, gui="gtk", debug=False)


if __name__ == "__main__":
    main()
