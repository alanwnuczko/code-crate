import json
import os
from pathlib import Path

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
        self._drag_origin = None

    def set_window(self, window):
        self._window = window

    def start_drag(self, screen_x, screen_y) -> None:
        if not self._window:
            return
        try:
            wx = self._window.x if self._window.x is not None else 0
            wy = self._window.y if self._window.y is not None else 0
        except Exception:
            wx, wy = 0, 0
        self._drag_origin = {
            "sx": int(screen_x), "sy": int(screen_y),
            "wx": wx, "wy": wy,
        }

    def do_drag(self, screen_x, screen_y) -> None:
        if not self._drag_origin or not self._window:
            return
        new_x = self._drag_origin["wx"] + int(screen_x) - self._drag_origin["sx"]
        new_y = self._drag_origin["wy"] + int(screen_y) - self._drag_origin["sy"]
        try:
            self._window.move(new_x, new_y)
        except Exception:
            try:
                from gi.repository import GLib
                from webview.platforms.gtk import BrowserView
                for inst in BrowserView.instances.values():
                    GLib.idle_add(inst.window.move, new_x, new_y)
                    break
            except Exception:
                pass

    def end_drag(self) -> None:
        self._drag_origin = None

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
                "All files (*)",
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

        dest = str(Path(directory) / name)
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
