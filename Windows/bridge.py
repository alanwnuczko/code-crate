import ctypes
import ctypes.wintypes as wt
import json
import os

EXTENSIONS = {
    "javascript": ".js",
    "typescript": ".ts",
    "python":     ".py",
    "c_cpp":      ".cpp",
    "java":       ".java",
    "csharp":     ".cs",
    "rust":       ".rs",
    "go":         ".go",
    "shell":      ".sh",
    "css":        ".css",
    "html":       ".html",
    "sql":        ".sql",
    "php":        ".php",
    "ruby":       ".rb",
    "swift":      ".swift",
    "yaml":       ".yml",
    "text":       ".txt",
}

DEFAULT_STATE = {
    "language":   "javascript",
    "theme":      "dusk",
    "code":       "",
    "export_dir": "",
    "filename":   "",
    "fontSize":   13,
    "pinned":     True,
}

_EXT_TO_LANG = {v: k for k, v in EXTENSIONS.items()}
_EXT_TO_LANG.update({
    ".c":    "c_cpp",
    ".h":    "c_cpp",
    ".hpp":  "c_cpp",
    ".jsx":  "javascript",
    ".tsx":  "typescript",
    ".mjs":  "javascript",
    ".cjs":  "javascript",
    ".bash": "shell",
    ".zsh":  "shell",
    ".json": "javascript",
    ".toml": "yaml",
    ".yml":  "yaml",
})


class Bridge:
    def __init__(self, state_path: str):
        self._state_path = state_path
        self._window     = None
        self._pin_callback = None

    def set_window(self, window):
        self._window = window

    def set_pin_callback(self, callback):
        self._pin_callback = callback

    def pick_folder(self) -> dict:
        if not self._window:
            return {"ok": False, "error": "Window not ready"}
        try:
            from webview import FileDialog
            from win32_desktop import set_dialog_open, peek_desktop_widget
            hwnd = getattr(self._window, '_cached_hwnd', None)
            if not hwnd:
                from main import _resolve_hwnd
                hwnd = _resolve_hwnd(self._window)

            parent = ctypes.windll.user32.GetParent(int(hwnd)) if hwnd else 0
            desktop = ctypes.windll.user32.GetDesktopWindow()
            is_unpinned = (parent != 0 and parent != desktop)

            set_dialog_open(True)
            try:
                result = self._window.create_file_dialog(FileDialog.FOLDER)
            finally:
                set_dialog_open(False)
                if hwnd:
                    if is_unpinned:
                        peek_desktop_widget(int(hwnd))
                    else:
                        ctypes.windll.user32.SetForegroundWindow(int(hwnd))

            if result:
                return {"ok": True, "path": result[0]}
            return {"ok": False, "error": ""}
        except Exception as exc:
            return {"ok": False, "error": str(exc)}

    def open_file(self) -> dict:
        if not self._window:
            return {"ok": False, "error": "Window not ready"}
        try:
            from webview import FileDialog
            from win32_desktop import set_dialog_open, peek_desktop_widget
            hwnd = getattr(self._window, '_cached_hwnd', None)
            if not hwnd:
                from main import _resolve_hwnd
                hwnd = _resolve_hwnd(self._window)

            parent = ctypes.windll.user32.GetParent(int(hwnd)) if hwnd else 0
            desktop = ctypes.windll.user32.GetDesktopWindow()
            is_unpinned = (parent != 0 and parent != desktop)

            set_dialog_open(True)
            try:
                file_types = (
                    "Code files (*.js;*.ts;*.py;*.cpp;*.c;*.h;*.java;*.cs;*.rs;"
                    "*.go;*.sh;*.css;*.html;*.sql;*.php;*.rb;*.swift;*.yaml;*.yml;"
                    "*.jsx;*.tsx;*.json;*.toml;*.txt)",
                    "All files (*.*)",
                )
                result = self._window.create_file_dialog(
                    FileDialog.OPEN, allow_multiple=False, file_types=file_types
                )
            finally:
                set_dialog_open(False)
                if hwnd:
                    if is_unpinned:
                        peek_desktop_widget(int(hwnd))
                    else:
                        ctypes.windll.user32.SetForegroundWindow(int(hwnd))

            if not result:
                return {"ok": False, "error": ""}

            path = result[0]
            ext  = os.path.splitext(path)[1].lower()
            lang = _EXT_TO_LANG.get(ext, "text")

            with open(path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()

            return {
                "ok":       True,
                "path":     path,
                "filename": os.path.splitext(os.path.basename(path))[0],
                "language": lang,
                "code":     content,
            }
        except Exception as exc:
            return {"ok": False, "error": str(exc)}

    def open_file_by_path(self, path: str) -> dict:
        try:
            if not path or not os.path.isfile(path):
                return {"ok": False, "error": "File not found"}
            ext  = os.path.splitext(path)[1].lower()
            lang = _EXT_TO_LANG.get(ext, "text")
            with open(path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            return {
                "ok":       True,
                "path":     path,
                "filename": os.path.splitext(os.path.basename(path))[0],
                "language": lang,
                "code":     content,
            }
        except Exception as exc:
            return {"ok": False, "error": str(exc)}

    def get_dropped_file_path(self, filename: str) -> str:
        try:
            import urllib.parse, webview.dom
            paths = webview.dom._dnd_state.get('paths', [])
            for item in list(paths):
                if item[0] == filename or urllib.parse.unquote(item[0]) == filename:
                    paths.remove(item)
                    return item[1]
        except Exception as e:
            print(f"[bridge] get_dropped_file_path error: {e}")
        return ""

    def load_note(self) -> dict:
        if not os.path.exists(self._state_path) or os.path.getsize(self._state_path) == 0:
            return DEFAULT_STATE.copy()
        try:
            with open(self._state_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (OSError, json.JSONDecodeError):
            return DEFAULT_STATE.copy()

        state = DEFAULT_STATE.copy()
        if isinstance(data, dict):
            state.update(data)
        return state

    def save_note(self, data: dict) -> dict:
        try:
            with open(self._state_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            return {"ok": True}
        except OSError as exc:
            return {"ok": False, "error": str(exc)}

    def save_file(self, directory: str, filename: str, language: str, code: str) -> dict:
        if not directory:
            return {"ok": False, "error": "No destination folder set"}
        if not os.path.isdir(directory):
            return {"ok": False, "error": f"Folder not found: {directory}"}

        ext  = EXTENSIONS.get(language, ".txt")
        name = (filename.strip() or "untitled")
        if not name.endswith(ext):
            name += ext

        dest = os.path.join(directory, name)
        try:
            with open(dest, "w", encoding="utf-8") as f:
                f.write(code)
            return {"ok": True, "path": dest}
        except OSError as exc:
            return {"ok": False, "error": str(exc)}

    def create_folder(self, parent: str, name: str) -> dict:
        if not parent:
            return {"ok": False, "error": "No parent folder provided"}
        if not os.path.isdir(parent):
            return {"ok": False, "error": f"Parent folder not found: {parent}"}

        base_name = (name or "code-crate").strip()
        # Basic sanitization for folder name
        base_name = "".join(c for c in base_name if c.isalnum() or c in (" ", "-", "_", ".")).strip()
        if not base_name:
            base_name = "code-crate"

        dest = os.path.join(parent, base_name)
        counter = 1
        while os.path.exists(dest):
            dest = os.path.join(parent, f"{base_name} ({counter})")
            counter += 1

        try:
            os.makedirs(dest)
            return {"ok": True, "path": dest}
        except Exception as exc:
            return {"ok": False, "error": str(exc)}

    def toggle_pin(self, pinned: bool) -> dict:
        try:
            if not self._pin_callback:
                return {"ok": False, "error": "Pin not available"}
            result = self._pin_callback(pinned)
            return {"ok": bool(result)}
        except Exception as exc:
            return {"ok": False, "error": str(exc)}

    def start_drag(self) -> dict:
        try:
            hwnd = getattr(self._window, '_cached_hwnd', None)
            if not hwnd:
                from main import _resolve_hwnd
                hwnd = _resolve_hwnd(self._window)
            if hwnd:
                parent = ctypes.windll.user32.GetParent(int(hwnd))
                desktop = ctypes.windll.user32.GetDesktopWindow()
                if parent != 0 and parent != desktop:
                    return {"ok": False, "reason": "child_window"}
                ctypes.windll.user32.ReleaseCapture()
                ctypes.windll.user32.SendMessageW(int(hwnd), 0x00A1, 2, 0)
                return {"ok": True}
        except Exception as e:
            print(f"[bridge] start_drag error: {e}")
        return {"ok": False}

    def move_window_by(self, dx: int, dy: int) -> dict:
        try:
            hwnd = getattr(self._window, '_cached_hwnd', None)
            if not hwnd:
                from main import _resolve_hwnd
                hwnd = _resolve_hwnd(self._window)
            if hwnd:
                rect = wt.RECT()
                ctypes.windll.user32.GetWindowRect(int(hwnd), ctypes.byref(rect))
                new_x = rect.left + int(dx)
                new_y = rect.top + int(dy)
                parent = ctypes.windll.user32.GetParent(int(hwnd))
                desktop = ctypes.windll.user32.GetDesktopWindow()
                if parent != 0 and parent != desktop:
                    pt = wt.POINT(new_x, new_y)
                    ctypes.windll.user32.ScreenToClient(parent, ctypes.byref(pt))
                    new_x, new_y = pt.x, pt.y
                SWP_NOSIZE     = 0x0001
                SWP_NOZORDER   = 0x0004
                SWP_NOACTIVATE = 0x0010
                ctypes.windll.user32.SetWindowPos(
                    int(hwnd), 0, new_x, new_y, 0, 0,
                    SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE
                )
                return {"ok": True}
        except Exception as e:
            print(f"[bridge] move_window_by error: {e}")
        return {"ok": False}

    def get_git_branch(self, directory: str) -> dict:
        if not directory:
            return {"ok": False}
        try:
            search_dir = directory
            if os.path.isfile(search_dir):
                search_dir = os.path.dirname(search_dir)
            for _ in range(25):
                git_item = os.path.join(search_dir, ".git")
                head_path = None
                if os.path.isdir(git_item):
                    head_path = os.path.join(git_item, "HEAD")
                elif os.path.isfile(git_item):
                    try:
                        with open(git_item, "r", encoding="utf-8") as gf:
                            gcontent = gf.read().strip()
                        if gcontent.startswith("gitdir: "):
                            wdir = gcontent[len("gitdir: "):].strip()
                            if not os.path.isabs(wdir):
                                wdir = os.path.normpath(os.path.join(search_dir, wdir))
                            head_path = os.path.join(wdir, "HEAD")
                    except Exception:
                        pass

                if head_path and os.path.isfile(head_path):
                    with open(head_path, "r", encoding="utf-8") as f:
                        content = f.read().strip()
                    if content.startswith("ref: refs/heads/"):
                        branch = content[len("ref: refs/heads/"):]
                        return {"ok": True, "branch": branch}
                    elif len(content) >= 7:
                        return {"ok": True, "branch": content[:7]}
                parent = os.path.dirname(search_dir)
                if parent == search_dir:
                    break
                search_dir = parent
            return {"ok": False}
        except Exception:
            return {"ok": False}
