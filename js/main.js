const LANGS = {
  javascript: { mode: "javascript",                          ext: ".js"    },
  typescript: { mode: { name: "javascript", typescript: true }, ext: ".ts" },
  python:     { mode: "python",                              ext: ".py"    },
  c_cpp:      { mode: "text/x-c++src",                       ext: ".cpp"   },
  java:       { mode: "text/x-java",                         ext: ".java"  },
  csharp:     { mode: "text/x-csharp",                       ext: ".cs"    },
  rust:       { mode: "rust",                                ext: ".rs"    },
  go:         { mode: "go",                                  ext: ".go"    },
  shell:      { mode: "shell",                               ext: ".sh"    },
  css:        { mode: "css",                                 ext: ".css"   },
  html:       { mode: "htmlmixed",                           ext: ".html"  },
  sql:        { mode: "sql",                                 ext: ".sql"   },
  php:        { mode: "php",                                 ext: ".php"   },
  ruby:       { mode: "ruby",                                ext: ".rb"    },
  swift:      { mode: "swift",                               ext: ".swift" },
  yaml:       { mode: "yaml",                                ext: ".yml"   },
  text:       { mode: null,                                  ext: ".txt"   },
};

const THEMES = {
  dusk:       { cm: "cs-dusk" },
  paper:      { cm: "cs-paper" },
  aurora:     { cm: "cs-aurora" },
  grove:      { cm: "cs-grove" },
  rose:       { cm: "cs-rose" },
  contrast:   { cm: "cs-contrast" },
  nord:       { cm: "cs-nord" },
  solarized:  { cm: "cs-solarized" },
  dracula:    { cm: "cs-dracula" },
};

document.documentElement.dataset.theme = "dusk";

const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  theme:             "cs-dusk",
  lineNumbers:       true,
  matchBrackets:     true,
  autoCloseBrackets: { pairs: "()[]{}''\"\"", explode: "[](){}" },
  styleActiveLine:   true,
  indentUnit:        2,
  tabSize:           2,
  indentWithTabs:    false,
  lineWrapping:      true,
  extraKeys: {
    "Tab":       cm => cm.execCommand("indentMore"),
    "Shift-Tab": cm => cm.execCommand("indentLess"),

    "Ctrl-L": cm => {
      const ln = cm.getCursor().line;
      const lineCount = cm.lineCount();
      if (ln < lineCount - 1) {
        cm.setSelection(
          { line: ln, ch: 0 },
          { line: ln + 1, ch: 0 }
        );
      } else {
        cm.setSelection(
          { line: ln, ch: 0 },
          { line: ln, ch: cm.getLine(ln).length }
        );
      }
    },

    "Ctrl-Enter": cm => {
      const ln  = cm.getCursor().line;
      const end = cm.getLine(ln).length;
      cm.replaceRange("\n", { line: ln, ch: end });
      cm.setCursor({ line: ln + 1, ch: 0 });
    },

    "Ctrl-O": () => openFile(),
  },
});

(function fitEditor() {
  const wrap = document.getElementById("editor-wrap");
  const resizeEditor = () => {
    editor.setSize(wrap.clientWidth, wrap.clientHeight);
  };
  resizeEditor();
  new ResizeObserver(resizeEditor).observe(wrap);
  window.addEventListener("resize", resizeEditor);
})();

editor.on("cursorActivity", () => {
  const c = editor.getCursor();
  document.getElementById("ln").textContent  = c.line + 1;
  document.getElementById("col").textContent = c.ch + 1;
});

let _saveTimer = null;
editor.on("change", () => {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(_persistState, 1400);
});

function _protectFromWindowDrag(selector) {
  document.querySelectorAll(selector).forEach(el => {
    ["mousedown", "pointerdown", "touchstart"].forEach(type => {
      el.addEventListener(type, event => event.stopPropagation());
    });
  });
}

_protectFromWindowDrag("#editor-wrap, input, select, button");

function onLangChange(key, shouldPersist = true) {
  const def = LANGS[key];
  if (!def) return;
  editor.setOption("mode", def.mode);
  document.getElementById("ext-badge").textContent    = def.ext;
  document.getElementById("filename-ext").textContent = def.ext;
  if (shouldPersist) _persistState();
}

function _setTheme(key, shouldPersist) {
  const next = THEMES[key] ? key : "dusk";
  document.documentElement.dataset.theme = next;
  document.getElementById("theme-select").value = next;
  editor.setOption("theme", THEMES[next].cm);
  editor.refresh();
  if (shouldPersist) _persistState();
}

function onThemeChange(key) {
  _setTheme(key, true);
}

function openFile() {
  if (!window.pywebview) { toast("File open only works in the desktop app", "inf"); return; }
  window.pywebview.api.open_file().then(result => {
    if (!result.ok) {
      if (result.error) toast(result.error, "err");
      return;
    }
    const sel = document.getElementById("lang-select");
    if (LANGS[result.language]) {
      sel.value = result.language;
      onLangChange(result.language, false);
    }
    editor.setValue(result.code);
    editor.clearHistory();
    editor.setCursor({ line: 0, ch: 0 });
    if (result.filename) {
      document.getElementById("filename-input").value = result.filename;
    }
    const dir = result.path.replace(/[\\/][^\\/]+$/, "");
    if (dir) document.getElementById("export-dir").value = dir;
    _persistState();
    toast(result.path.split(/[\\/]/).pop(), "inf");
  });
}

function pickFolder() {
  if (!window.pywebview) { toast("Folder picker only works in the desktop app", "inf"); return; }
  window.pywebview.api.pick_folder().then(result => {
    if (result.ok) {
      document.getElementById("export-dir").value = result.path;
      _persistState();
    } else if (result.error) {
      toast(result.error, "err");
    }
  });
}

function saveFile() {
  const dir      = document.getElementById("export-dir").value.trim();
  const filename = document.getElementById("filename-input").value.trim();
  const lang     = document.getElementById("lang-select").value;
  const code     = editor.getValue();

  if (!code.trim()) { toast("Nothing to save", "inf"); return; }
  if (!dir)         { toast("Set a destination folder first", "err"); return; }

  const call = window.pywebview
    ? window.pywebview.api.save_file(dir, filename || "snippet", lang, code)
    : Promise.resolve({ ok: false, error: "Not running in desktop app" });

  call.then(r => {
    if (r.ok) toast("saved  " + r.path.split(/[\\/]/).pop(), "ok");
    else      toast(r.error || "Save failed", "err");
    if (r.ok) _persistState();
  });
}

function clearAll() {
  if (!editor.getValue().trim()) return;
  editor.setValue("");
  editor.clearHistory();
  toast("Cleared", "inf");
}

function copyAll() {
  const code = editor.getValue();
  if (!code.trim()) { toast("Nothing to copy", "err"); return; }
  navigator.clipboard.writeText(code)
    .then(() => toast("Copied to clipboard", "ok"))
    .catch(() => {
      const ta = Object.assign(document.createElement("textarea"), { value: code });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast("Copied", "ok");
    });
}

function _persistState() {
  const payload = {
    language:   document.getElementById("lang-select").value,
    theme:      document.getElementById("theme-select").value,
    code:       editor.getValue(),
    export_dir: document.getElementById("export-dir").value.trim(),
    filename:   document.getElementById("filename-input").value.trim(),
  };
  if (window.pywebview) window.pywebview.api.save_note(payload);
  else try { localStorage.setItem("cs_state", JSON.stringify(payload)); } catch (_) {}
}

function _applyState(data) {
  if (!data) return;
  if (data.language && LANGS[data.language]) {
    document.getElementById("lang-select").value = data.language;
    onLangChange(data.language, false);
  }
  if (data.theme && THEMES[data.theme]) {
    _setTheme(data.theme, false);
  }
  if (data.code !== undefined) {
    editor.setValue(data.code);
    editor.clearHistory();
  }
  if (data.export_dir) document.getElementById("export-dir").value    = data.export_dir;
  if (data.filename)   document.getElementById("filename-input").value = data.filename;
}

function _loadState() {
  if (window.pywebview) window.pywebview.api.load_note().then(_applyState);
  else try {
    const raw = localStorage.getItem("cs_state");
    if (raw) _applyState(JSON.parse(raw));
  } catch (_) {}
}

function toast(msg, type) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = "show " + (type || "inf");
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = ""; }, 2100);
}

onLangChange("javascript", false);
window.addEventListener("pywebviewready", _loadState);
if (!window.pywebview) setTimeout(_loadState, 60);