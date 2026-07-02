<<<<<<< HEAD
import ctypes
import ctypes.wintypes as wt
=======
>>>>>>> e0606f38c3d0c50b507c19ef778500e4bc8b82f3
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
<<<<<<< HEAD
    "fontSize":   13,
    "pinned":     True,
=======
>>>>>>> e0606f38c3d0c50b507c19ef778500e4bc8b82f3
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
<<<<<<< HEAD
        self._pin_callback = None
=======
>>>>>>> e0606f38c3d0c50b507c19ef778500e4bc8b82f3

    def set_window(self, window):
        self._window = window

<<<<<<< HEAD
    def set_pin_callback(self, callback):
        self._pin_callback = callback

=======
>>>>>>> e0606f38c3d0c50b507c19ef778500e4bc8b82f3
    def pick_folder(self) -> dict:
        if not self._window:
            return {"ok": False, "error": "Window not ready"}
        try:
            from webview import FileDialog
            result = self._window.create_file_dialog(FileDialog.FOLDER)
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
            file_types = (
                "Code files (*.js;*.ts;*.py;*.cpp;*.c;*.h;*.java;*.cs;*.rs;"
                "*.go;*.sh;*.css;*.html;*.sql;*.php;*.rb;*.swift;*.yaml;*.yml;"
                "*.jsx;*.tsx;*.json;*.toml;*.txt)",
                "All files (*.*)",
            )
            result = self._window.create_file_dialog(
                FileDialog.OPEN, allow_multiple=False, file_types=file_types
            )
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
        name = (filename.strip() or "snippet")
        if not name.endswith(ext):
            name += ext

        dest = os.path.join(directory, name)
        try:
            with open(dest, "w", encoding="utf-8") as f:
                f.write(code)
            return {"ok": True, "path": dest}
        except OSError as exc:
            return {"ok": False, "error": str(exc)}
<<<<<<< HEAD

    def toggle_pin(self, pinned: bool) -> dict:
        try:
            if not self._pin_callback:
                return {"ok": False, "error": "Pin not available"}
            result = self._pin_callback(pinned)
            return {"ok": bool(result)}
        except Exception as exc:
            return {"ok": False, "error": str(exc)}

    def start_drag(self) -> dict:
        """Initiate native Win32 window drag loop."""
        try:
            hwnd = getattr(self._window, '_cached_hwnd', None)
            if not hwnd:
                from main import _resolve_hwnd
                hwnd = _resolve_hwnd(self._window)
            if hwnd:
                ctypes.windll.user32.ReleaseCapture()
                ctypes.windll.user32.SendMessageW(int(hwnd), 0x00A1, 2, 0)
                return {"ok": True}
        except Exception as e:
            print(f"[bridge] start_drag error: {e}")
        return {"ok": False}

    def move_window_by(self, dx: int, dy: int) -> dict:
        """Precisely move window by delta pixels in screen coordinates."""
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
        """Read the current Git branch from a directory's .git/HEAD file."""
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
=======
>>>>>>> e0606f38c3d0c50b507c19ef778500e4bc8b82f3
