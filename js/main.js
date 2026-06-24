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

const VOID_TAGS = new Set([
  "area","base","br","col","embed","hr","img","input",
  "link","meta","param","source","track","wbr",
]);

const CSS_VALUES = {
  "cursor": ["pointer", "default", "auto", "crosshair", "move", "not-allowed", "text", "wait", "help"],
  "display": ["block", "inline", "inline-block", "flex", "inline-flex", "grid", "inline-grid", "none", "table"],
  "position": ["relative", "absolute", "fixed", "sticky", "static"],
  "color": ["transparent", "currentColor", "inherit", "initial"],
  "background-color": ["transparent", "currentColor", "inherit", "initial"],
  "text-align": ["left", "center", "right", "justify"],
  "font-weight": ["normal", "bold", "bolder", "lighter", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  "text-decoration": ["none", "underline", "overline", "line-through"],
  "text-transform": ["none", "capitalize", "uppercase", "lowercase"],
  "visibility": ["visible", "hidden", "collapse"],
  "overflow": ["visible", "hidden", "scroll", "auto"],
  "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
  "flex-wrap": ["nowrap", "wrap", "wrap-reverse"],
  "justify-content": ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"],
  "align-items": ["stretch", "flex-start", "flex-end", "center", "baseline"],
  "box-sizing": ["content-box", "border-box"],
  "float": ["left", "right", "none"],
  "clear": ["left", "right", "both", "none"],
  "list-style-type": ["none", "disc", "circle", "square", "decimal"],
  "pointer-events": ["auto", "none"],
  "user-select": ["auto", "none", "text", "all"],
};

const CSS_SNIPPETS = {
  // Box Model
  m: "margin: ;", mt: "margin-top: ;", mr: "margin-right: ;", mb: "margin-bottom: ;", ml: "margin-left: ;",
  p: "padding: ;", pt: "padding-top: ;", pr: "padding-right: ;", pb: "padding-bottom: ;", pl: "padding-left: ;",
  w: "width: ;", miw: "min-width: ;", maw: "max-width: ;",
  h: "height: ;", mih: "min-height: ;", mah: "max-height: ;",
  bxz: "box-sizing: ;", "bxz:cb": "box-sizing: content-box;", "bxz:bb": "box-sizing: border-box;",
  
  // Display & Positioning
  d: "display: ;", dn: "display: none;", db: "display: block;", di: "display: inline;", dib: "display: inline-block;",
  df: "display: flex;", dif: "display: inline-flex;", dg: "display: grid;", dig: "display: inline-grid;", dt: "display: table;",
  pos: "position: ;", psr: "position: relative;", psa: "position: absolute;", psf: "position: fixed;", pss: "position: sticky;",
  t: "top: ;", r: "right: ;", b: "bottom: ;", l: "left: ;", z: "z-index: ;",
  fl: "float: ;", flr: "float: right;", fll: "float: left;", cl: "clear: ;", clb: "clear: both;",
  
  // Flexbox
  fx: "flex: ;", "fx:1": "flex: 1;", fxd: "flex-direction: ;", "fxd:r": "flex-direction: row;", "fxd:c": "flex-direction: column;",
  fxw: "flex-wrap: ;", "fxw:n": "flex-wrap: nowrap;", "fxw:w": "flex-wrap: wrap;",
  jc: "justify-content: ;", "jc:fs": "justify-content: flex-start;", "jc:fe": "justify-content: flex-end;", "jc:c": "justify-content: center;", "jc:sb": "justify-content: space-between;", "jc:sa": "justify-content: space-around;",
  ai: "align-items: ;", "ai:fs": "align-items: flex-start;", "ai:fe": "align-items: flex-end;", "ai:c": "align-items: center;", "ai:b": "align-items: baseline;", "ai:s": "align-items: stretch;",
  ac: "align-content: ;", "ac:fs": "align-content: flex-start;", "ac:fe": "align-content: flex-end;", "ac:c": "align-content: center;", "ac:sb": "align-content: space-between;", "ac:sa": "align-content: space-around;", "ac:s": "align-content: stretch;",
  as: "align-self: ;", "as:fs": "align-self: flex-start;", "as:fe": "align-self: flex-end;", "as:c": "align-self: center;", "as:b": "align-self: baseline;", "as:s": "align-self: stretch;",
  
  // Grid
  gtc: "grid-template-columns: ;", gtr: "grid-template-rows: ;", gta: "grid-template-areas: ;",
  gc: "grid-column: ;", gr: "grid-row: ;", ga: "grid-area: ;",
  gap: "gap: ;", rg: "row-gap: ;", cg: "column-gap: ;",
  
  // Typography
  c: "color: ;", "c:t": "color: transparent;",
  fz: "font-size: ;", fw: "font-weight: ;", "fw:n": "font-weight: normal;", "fw:b": "font-weight: bold;",
  ff: "font-family: ;", lh: "line-height: ;", ls: "letter-spacing: ;",
  ta: "text-align: ;", "ta:l": "text-align: left;", "ta:c": "text-align: center;", "ta:r": "text-align: right;", "ta:j": "text-align: justify;",
  td: "text-decoration: ;", "td:n": "text-decoration: none;", "td:u": "text-decoration: underline;", "td:o": "text-decoration: overline;", "td:lt": "text-decoration: line-through;",
  tt: "text-transform: ;", "tt:n": "text-transform: none;", "tt:c": "text-transform: capitalize;", "tt:u": "text-transform: uppercase;", "tt:l": "text-transform: lowercase;",
  ws: "white-space: ;", "ws:n": "white-space: normal;", "ws:nw": "white-space: nowrap;", "ws:p": "white-space: pre;", "ws:pw": "white-space: pre-wrap;",
  ww: "word-wrap: ;", "ww:bw": "word-wrap: break-word;",
  va: "vertical-align: ;", "va:t": "vertical-align: top;", "va:m": "vertical-align: middle;", "va:b": "vertical-align: bottom;", "va:bl": "vertical-align: baseline;",
  
  // Background
  bg: "background: ;", "bg+": "background: #fff url() 0 0 no-repeat;", bgc: "background-color: ;", "bgc:t": "background-color: transparent;",
  bgi: "background-image: url();", "bgi:n": "background-image: none;",
  bgr: "background-repeat: ;", "bgr:n": "background-repeat: no-repeat;", "bgr:x": "background-repeat: repeat-x;", "bgr:y": "background-repeat: repeat-y;",
  bgp: "background-position: 0 0;", bgs: "background-size: ;", "bgs:cv": "background-size: cover;", "bgs:ct": "background-size: contain;",
  bga: "background-attachment: ;", "bga:f": "background-attachment: fixed;", "bga:s": "background-attachment: scroll;",
  
  // Borders
  bd: "border: ;", "bd+": "border: 1px solid #000;", bdt: "border-top: ;", bdr: "border-right: ;", bdb: "border-bottom: ;", bdl: "border-left: ;",
  bdc: "border-color: ;", "bdc:t": "border-color: transparent;", bdw: "border-width: ;", bds: "border-style: ;",
  "bds:n": "border-style: none;", "bds:s": "border-style: solid;", "bds:d": "border-style: dashed;", "bds:do": "border-style: dotted;",
  bdrs: "border-radius: ;",
  
  // Lists
  lis: "list-style: ;", "lis:n": "list-style: none;", lisi: "list-style-image: url();", "lisi:n": "list-style-image: none;",
  list: "list-style-type: ;", "list:n": "list-style-type: none;", "list:c": "list-style-type: circle;", "list:d": "list-style-type: disc;", "list:s": "list-style-type: square;",
  
  // UI & Effects
  op: "opacity: ;", bxsh: "box-shadow: ;", "bxsh:n": "box-shadow: none;", tsh: "text-shadow: ;", "tsh:n": "text-shadow: none;",
  ov: "overflow: ;", "ov:h": "overflow: hidden;", "ov:s": "overflow: scroll;", "ov:a": "overflow: auto;", ovx: "overflow-x: ;", ovy: "overflow-y: ;",
  cur: "cursor: ;", "cur:p": "cursor: pointer;", "cur:d": "cursor: default;", "cur:n": "cursor: none;",
  pe: "pointer-events: ;", "pe:n": "pointer-events: none;", "pe:a": "pointer-events: auto;",
  us: "user-select: ;", "us:n": "user-select: none;", "us:a": "user-select: auto;",
  tr: "transition: ;", trf: "transform: ;", an: "animation: ;",
  out: "outline: ;", "out:n": "outline: none;",
  
};

const JS_SNIPPETS = {
  clg: "console.log();",
  ce: "console.error();",
  cw: "console.warn();",
  fn: "function(){\n  \n}",
  afn: "() => {\n  \n}",
  imp: "import  from '';",
  exp: "export default ;",
  ed: "export default ;",
  req: "require('');",
  ife: "if () {\n  \n} else {\n  \n}",
  "if": "if () {\n  \n}",
  "for": "for (let i = 0; i < ; i++) {\n  \n}",
  forof: "for (const item of ) {\n  \n}",
  forin: "for (const key in ) {\n  \n}",
  "while": "while () {\n  \n}",
  sw: "switch () {\n  case :\n    break;\n  default:\n    break;\n}",
  tc: "try {\n  \n} catch (error) {\n  \n}",
  st: "setTimeout(() => {\n  \n}, );",
  si: "setInterval(() => {\n  \n}, );",
  doc: "document.",
  qs: "document.querySelector('')",
  qsa: "document.querySelectorAll('')",
  gebi: "document.getElementById('')",
  ael: "addEventListener('', () => {\n  \n});",
  prom: "new Promise((resolve, reject) => {\n  \n});",
  then: ".then(res => {\n  \n})",
  "catch": ".catch(err => {\n  \n})",
  async: "async function () {\n  \n}",
  "const": "const  = ;",
  "let": "let  = ;",
  "class": "class  {\n  constructor() {\n    \n  }\n}",
};

const COMMON_HTML_TAGS = new Set([
  "a","abbr","address","area","article","aside","audio",
  "b","blockquote","body","br","button",
  "canvas","caption","cite","code","col","colgroup",
  "dd","del","details","dfn","dialog","div","dl","dt",
  "em","embed",
  "fieldset","figcaption","figure","footer","form",
  "h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html",
  "i","iframe","img","input",
  "kbd","label","legend","li","link",
  "main","map","mark","menu","meta","meter",
  "nav","noscript",
  "object","ol","optgroup","option","output",
  "p","param","picture","pre","progress",
  "q","rp","rt","ruby",
  "s","samp","script","section","select","slot","small","source","span",
  "strong","style","sub","summary","sup",
  "table","tbody","td","template","textarea","tfoot","th","thead","time","title","tr","track",
  "u","ul","var","video","wbr",
]);

function _parseElement(token) {
  let tag = "", id = "", classes = [], attrs = [], text = "", count = 1;

  const repMatch = token.match(/\*(\d+)$/);
  if (repMatch) {
    count = parseInt(repMatch[1], 10);
    token = token.slice(0, -repMatch[0].length);
  }

  const textMatch = token.match(/\{([^}]*)\}$/);
  if (textMatch) {
    text = textMatch[1];
    token = token.slice(0, -textMatch[0].length);
  }

  const attrMatches = token.match(/\[([^\]]*)\]/g);
  if (attrMatches) {
    for (const a of attrMatches) {
      attrs.push(a.slice(1, -1));
      token = token.replace(a, "");
    }
  }

  const idMatch = token.match(/#([\w-]+)/);
  if (idMatch) {
    id = idMatch[1];
    token = token.replace(idMatch[0], "");
  }

  const classMatches = token.match(/\.([\w-]+)/g);
  if (classMatches) {
    classes = classMatches.map(c => c.slice(1));
    token = token.replace(/\.[\w-]+/g, "");
  }

  tag = token || "div";
  return { tag, id, classes, attrs, text, count };
}

function _renderElement(el, childHTML, indent) {
  const { tag, id, classes, attrs, text } = el;

  const attrParts = [];
  if (id) attrParts.push(`id="${id}"`);
  if (classes.length) attrParts.push(`class="${classes.join(" ")}"`);
  attrParts.push(...attrs);

  const attrStr = attrParts.length ? " " + attrParts.join(" ") : "";
  const open = `<${tag}${attrStr}>`;

  if (VOID_TAGS.has(tag)) return indent + open;

  if (text) return `${indent}${open}${text}</${tag}>`;

  if (childHTML) return `${indent}${open}\n${childHTML}\n${indent}</${tag}>`;

  return `${indent}${open}</${tag}>`;
}

function _findDeepestLast(node) {
  if (node.type === "element") {
    if (node.children.length > 0) {
      return _findDeepestLast(node.children[node.children.length - 1]);
    }
    return node;
  }
  if (node.type === "group" && node.children.length > 0) {
    return _findDeepestLast(node.children[node.children.length - 1]);
  }
  return null;
}

function _parseAbbreviation(abbr) {
  let pos = 0;
  const len = abbr.length;

  function parseExpr() {
    const result = [];
    const contextStack = [];
    let currentSiblings = result;
    let lastNode = null;

    while (pos < len) {
      if (abbr[pos] === ")") break;

      const node = parseNode();
      if (!node) break;

      currentSiblings.push(node);
      lastNode = node;

      if (pos >= len || abbr[pos] === ")") break;

      const op = abbr[pos];

      if (op === ">") {
        pos++;
        contextStack.push(currentSiblings);
        if (lastNode.type === "group") {
          const target = _findDeepestLast(lastNode);
          currentSiblings = target ? target.children : [];
        } else {
          currentSiblings = lastNode.children;
        }
      } else if (op === "+") {
        pos++;

      } else if (op === "^") {
        while (pos < len && abbr[pos] === "^") {
          pos++;
          if (contextStack.length > 0) currentSiblings = contextStack.pop();
        }
      } else {
        break;
      }
    }

    return result;
  }

  function parseNode() {
    if (pos >= len) return null;
    if (abbr[pos] === "(") return parseGroup();
    return parseElementNode();
  }

  function parseGroup() {
    pos++;
    const children = parseExpr();
    if (pos < len && abbr[pos] === ")") pos++;

    let count = 1;
    if (pos < len && abbr[pos] === "*") {
      pos++;
      count = parseNumber();
    }
    return { type: "group", children, count };
  }

  function parseElementNode() {
    const start = pos;
    let depth = 0;

    while (pos < len) {
      const ch = abbr[pos];
      if (ch === "[" || ch === "{") depth++;
      else if (ch === "]" || ch === "}") depth--;
      else if (depth === 0 && ">+^()".includes(ch)) break;
      pos++;
    }

    const token = abbr.slice(start, pos);
    if (!token) return null;

    return { type: "element", el: _parseElement(token), children: [] };
  }

  function parseNumber() {
    let s = "";
    while (pos < len && /\d/.test(abbr[pos])) s += abbr[pos++];
    return parseInt(s, 10) || 1;
  }

  return parseExpr();
}

function _renderNodes(nodes, indent) {
  const parts = [];

  for (const node of nodes) {
    if (node.type === "group") {
      for (let r = 0; r < node.count; r++) {
        parts.push(_renderNodes(node.children, indent));
      }
    } else if (node.type === "element") {
      const { el, children } = node;

      for (let i = 0; i < el.count; i++) {
        const numberedText = el.text
          ? el.text.replace(/\$+/g, m => String(i + 1).padStart(m.length, "0"))
          : "";
        const numberedEl = { ...el, text: numberedText };

        let childHTML = "";
        if (children.length > 0) {
          childHTML = _renderNodes(children, indent + "  ");
        }

        parts.push(_renderElement(numberedEl, childHTML, indent));
      }
    }
  }

  return parts.join("\n");
}

function expandAbbreviation(abbr, indent = "") {
  abbr = abbr.trim();
  if (!abbr) return "";

  if (abbr === "!") {
    return [
      `${indent}<!DOCTYPE html>`,
      `${indent}<html lang="en">`,
      `${indent}<head>`,
      `${indent}  <meta charset="UTF-8">`,
      `${indent}  <meta name="viewport" content="width=device-width, initial-scale=1.0">`,
      `${indent}  <title>Document</title>`,
      `${indent}</head>`,
      `${indent}<body>`,
      `${indent}  `,
      `${indent}</body>`,
      `${indent}</html>`,
    ].join("\n");
  }

  const ast = _parseAbbreviation(abbr);
  return _renderNodes(ast, indent);
}

function _extractAbbr(lineUpToCursor) {
  let i = lineUpToCursor.length - 1;
  let depth = 0;

  while (i >= 0) {
    const ch = lineUpToCursor[i];
    if ("]})".includes(ch))       { depth++; i--; }
    else if ("[{(".includes(ch))  { if (depth <= 0) break; depth--; i--; }
    else if (depth > 0)           { i--; }
    else if (/[\w#.>+*^$!-]/.test(ch)) { i--; }
    else                          { break; }
  }

  const abbr = lineUpToCursor.slice(i + 1);
  if (!abbr) return null;
  if (!/^[a-zA-Z#.!]/.test(abbr)) return null;
  if (/[>+^]$/.test(abbr)) return null;
  return abbr;
}

function _looksLikeAbbreviation(abbr) {
  if (/[#.>+*\[\]{(^]/.test(abbr)) return true;
  const m = abbr.match(/^[a-zA-Z][\w-]*/);
  return !!(m && COMMON_HTML_TAGS.has(m[0].toLowerCase()));
}

function tryExpandAbbreviation(cm) {
  const lang = document.getElementById("lang-select").value;

  if (lang === "css") {
    const cur    = cm.getCursor();
    const line   = cm.getLine(cur.line);
    const before = line.slice(0, cur.ch);

    const match = before.match(/([\w]+)$/);
    if (!match) return false;

    const key     = match[1];
    const snippet = CSS_SNIPPETS[key];
    if (!snippet) return false;

    const from = { line: cur.line, ch: cur.ch - key.length };
    const to   = { line: cur.line, ch: cur.ch };
    cm.replaceRange(snippet, from, to);

    const newLine = cm.getLine(cur.line);
    const semi    = newLine.lastIndexOf(";");
    if (semi !== -1) cm.setCursor({ line: cur.line, ch: semi });
    return true;
  }

  if (!["html", "php"].includes(lang)) return false;

  const cur    = cm.getCursor();
  const line   = cm.getLine(cur.line);
  const before = line.slice(0, cur.ch);
  const abbr   = _extractAbbr(before);

  if (!abbr || !_looksLikeAbbreviation(abbr)) return false;

  const lineIndent = line.match(/^\s*/)[0];
  const from = { line: cur.line, ch: cur.ch - abbr.length };
  const to   = { line: cur.line, ch: cur.ch };

  let indent = "";
  if (from.ch <= lineIndent.length) {
    indent = lineIndent;
    from.ch = 0;
  }

  let expanded;
  try { expanded = expandAbbreviation(abbr, indent); } catch (_) { return false; }

  if (!expanded || expanded === abbr) return false;

  cm.replaceRange(expanded, from, to);

  const expandedLines = expanded.split("\n");
  for (let i = 0; i < expandedLines.length; i++) {
    const idx = expandedLines[i].search(/><\//);
    if (idx !== -1) {
      cm.setCursor({ line: from.line + i, ch: idx + 1 });
      return true;
    }
  }

  cm.setCursor({
    line: from.line + expandedLines.length - 1,
    ch: expandedLines[expandedLines.length - 1].length,
  });
  return true;
}

const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  theme:             "cs-dusk",
  lineNumbers:       true,
  matchBrackets:     true,
  autoCloseBrackets: { pairs: "()[]{}''\"\"", explode: "[](){}" },
  autoCloseTags:     true,
  styleActiveLine:   true,
  indentUnit:        2,
  tabSize:           2,
  indentWithTabs:    false,
  lineWrapping:      true,
  extraKeys: {
    "Tab": cm => {
      if (cm.somethingSelected()) {
        cm.execCommand("indentMore");
        return;
      }
      if (tryExpandAbbreviation(cm)) return;
      const spaces = " ".repeat(cm.getOption("indentUnit") || 2);
      cm.replaceSelection(spaces, "end");
    },
    "Enter": cm => {
      const lang = document.getElementById("lang-select").value;
      const cur  = cm.getCursor();
      const line = cm.getLine(cur.line);

      if (["html", "php"].includes(lang) && line.trim() === "!") {
        const indent   = line.match(/^\s*/)[0];
        const expanded = expandAbbreviation("!", indent);
        cm.replaceRange(expanded, { line: cur.line, ch: 0 }, { line: cur.line, ch: line.length });
        const expLines = expanded.split("\n");
        for (let i = 0; i < expLines.length; i++) {
          if (expLines[i].trimEnd().endsWith("<body>")) {
            cm.setCursor({ line: cur.line + i + 1, ch: (expLines[i + 1] || "").length });
            return;
          }
        }
        cm.setCursor({ line: cur.line + expLines.length - 1, ch: expLines[expLines.length - 1].length });
        return;
      }

      const before = line.slice(0, cur.ch);
      const after  = line.slice(cur.ch);
      if (/>$/.test(before) && /^<\//.test(after)) {
        const base = line.match(/^\s*/)[0];
        const unit = " ".repeat(cm.getOption("indentUnit") || 2);
        cm.replaceRange("\n" + base + unit + "\n" + base, cur, cur);
        cm.setCursor({ line: cur.line + 1, ch: base.length + unit.length });
        return;
      }

      if (["html", "php", "css"].includes(lang) && tryExpandAbbreviation(cm)) return;

      return CodeMirror.Pass;
    },
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
      const ln = cm.getCursor().line;
      const lineText = cm.getLine(ln);
      const indent = lineText.match(/^\s*/)[0];
      const end = lineText.length;
      cm.replaceRange("\n" + indent, { line: ln, ch: end });
      cm.setCursor({ line: ln + 1, ch: indent.length });
    },

    "Shift-Alt-Down": cm => {
      const cur = cm.getCursor();
      const text = cm.getLine(cur.line);
      cm.replaceRange("\n" + text, { line: cur.line, ch: text.length });
      cm.setCursor({ line: cur.line + 1, ch: cur.ch });
    },

    "Ctrl-O": () => openFile(),
    "Ctrl-N": () => newFile(),
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

function abbreviationHint(cm) {
  const cur  = cm.getCursor();
  const line = cm.getLine(cur.line);
  const lang = document.getElementById("lang-select").value;
  const before = line.slice(0, cur.ch);

  let list = [];

  if (lang === "css") {
    // Context-aware value completion (e.g. after 'cursor: ')
    const valMatch = before.match(/(?:^|[;{}])\s*([\w-]+)\s*:\s*([\w-]*)$/);
    if (valMatch) {
      const prop = valMatch[1];
      const word = valMatch[2];
      const vals = CSS_VALUES[prop] || [];
      const matchedVals = vals.filter(v => v.startsWith(word.toLowerCase()) && v !== word).sort();
      
      if (matchedVals.length) {
        const from = { line: cur.line, ch: cur.ch - word.length };
        const to   = { line: cur.line, ch: cur.ch };
        list = matchedVals.map(v => ({
          displayText: v,
          render(el) {
            el.innerHTML =
              '<span class="hint-icon"></span>' +
              '<span class="hint-name">' + v + '</span>' +
              '<span class="hint-label">Value</span>';
          },
          hint(cm) {
            cm.replaceRange(v, from, to);
          }
        }));
        return { list, from, to };
      }
    }

    // Property snippet completion
    const wm = before.match(/([\w-]+)$/);
    if (!wm) return null;
    const word = wm[1];
    const from = { line: cur.line, ch: cur.ch - word.length };
    const to   = { line: cur.line, ch: cur.ch };

    list = Object.keys(CSS_SNIPPETS)
      .filter(k => {
        const lowerWord = word.toLowerCase();
        const expanded = CSS_SNIPPETS[k];
        return (k.startsWith(lowerWord) || expanded.startsWith(lowerWord)) && k !== lowerWord;
      })
      .sort()
      .map(k => ({
        displayText: k,
        render(el) {
          el.innerHTML =
            '<span class="hint-icon"></span>' +
            '<span class="hint-name">' + k + '</span>' +
            '<span class="hint-label">' + CSS_SNIPPETS[k].replace(/ ;$/, '') + '</span>';
        },
        hint(cm) {
          cm.replaceRange(CSS_SNIPPETS[k], from, to);
          const nl = cm.getLine(cur.line);
          const si = nl.lastIndexOf(";");
          if (si !== -1) cm.setCursor({ line: cur.line, ch: si });
        },
      }));

    if (!list.length) return null;
    return { list, from, to };
  }

  if (lang === "javascript") {
    const wm = before.match(/([\w]+)$/);
    if (!wm) return null;
    const word = wm[1];
    const from = { line: cur.line, ch: cur.ch - word.length };
    const to   = { line: cur.line, ch: cur.ch };

    list = Object.keys(JS_SNIPPETS)
      .filter(k => {
        const lowerWord = word.toLowerCase();
        const expanded = JS_SNIPPETS[k];
        return (k.startsWith(lowerWord) || expanded.startsWith(lowerWord)) && k !== lowerWord;
      })
      .sort()
      .map(k => ({
        displayText: k,
        render(el) {
          el.innerHTML =
            '<span class="hint-icon"></span>' +
            '<span class="hint-name">' + k + '</span>' +
            '<span class="hint-label">' + JS_SNIPPETS[k].replace(/\n[\s\S]*/, '...') + '</span>';
        },
        hint(cm) {
          const indent = line.match(/^\s*/)[0];
          let expanded = JS_SNIPPETS[k].replace(/\n/g, "\n" + indent);
          const f = { line: cur.line, ch: cur.ch - word.length };
          
          if (f.ch <= indent.length) {
            f.ch = 0;
            expanded = indent + expanded;
          }
          
          cm.replaceRange(expanded, f, to);
          
          const endLines = expanded.split("\n");
          let placed = false;
          for (let i = 0; i < endLines.length; i++) {
            const l = endLines[i];
            const m = l.match(/\(\)|''|""/);
            if (m) {
              cm.setCursor({ line: f.line + i, ch: m.index + 1 });
              placed = true;
              break;
            }
          }
          if (!placed) {
            cm.setCursor({
              line: f.line + endLines.length - 1,
              ch: f.line === f.line + endLines.length - 1 ? f.ch + endLines[endLines.length - 1].length : endLines[endLines.length - 1].length,
            });
          }
        },
      }));

    if (!list.length) return null;
    return { list, from, to };
  }

  if (!["html", "php"].includes(lang)) return null;

  const abbr = _extractAbbr(before);
  const hasOperators = abbr && /[>+*^#.\[\]{(]/.test(abbr);

  const wm = before.match(/([a-zA-Z][\w-]*)$/);

  if (wm) {
    const prefix = line.slice(0, cur.ch - wm[1].length);
    const lt = prefix.lastIndexOf("<");
    const gt = prefix.lastIndexOf(">");
    if (lt > gt) return null;
  }

  const from = abbr && hasOperators
    ? { line: cur.line, ch: cur.ch - abbr.length }
    : wm
      ? { line: cur.line, ch: cur.ch - wm[1].length }
      : null;
  if (!from) return null;
  const to = { line: cur.line, ch: cur.ch };

  if (hasOperators && abbr) {
    try {
      const preview = expandAbbreviation(abbr).split("\n")[0];
      if (preview && preview !== abbr) {
        list.push({
          displayText: abbr,
          render(el) {
            el.innerHTML =
              '<span class="hint-icon"></span>' +
              '<span class="hint-name">' + abbr + '</span>' +
              '<span class="hint-label">Snippet</span>';
          },
          hint(cm) { tryExpandAbbreviation(cm); },
        });
      }
    } catch (_) {}
  }

  if (wm) {
    const word = wm[1].toLowerCase();
    const tags = Array.from(COMMON_HTML_TAGS)
      .filter(t => t.startsWith(word) && !list.some(l => l.displayText === t))
      .sort();
    for (const tag of tags) {
      list.push({
        displayText: tag,
        render(el) {
          el.innerHTML =
            '<span class="hint-icon"></span>' +
            '<span class="hint-name">' + tag + '</span>' +
            '<span class="hint-label">Snippet</span>';
        },
        hint(cm) {
          const indent = line.match(/^\s*/)[0];
          const expanded = expandAbbreviation(tag, indent);
          const f = { line: cur.line, ch: cur.ch - wm[1].length };

          if (f.ch <= indent.length) f.ch = 0;
          cm.replaceRange(expanded, f, to);
          const expLines = expanded.split("\n");
          for (let i = 0; i < expLines.length; i++) {
            const idx = expLines[i].search(/><\//);
            if (idx !== -1) {
              cm.setCursor({ line: f.line + i, ch: idx + 1 });
              return;
            }
          }
          cm.setCursor({
            line: f.line + expLines.length - 1,
            ch: expLines[expLines.length - 1].length,
          });
        },
      });
    }
  }

  if (!list.length) return null;
  return { list, from, to };
}

editor.on("inputRead", (cm, change) => {
  if (change.origin !== "+input") return;
  if (cm.state.completionActive) return;
  const lang = document.getElementById("lang-select").value;
  if (!["html", "php", "css", "javascript"].includes(lang)) return;

  const cur = cm.getCursor();
  const before = cm.getLine(cur.line).slice(0, cur.ch);
  if (!/[a-zA-Z]/.test(before.slice(-1))) return;

  cm.showHint({
    hint: abbreviationHint,
    completeSingle: false,
    alignWithWord:  true,
    closeOnUnfocus: true,
  });
});

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

function newFile() {
  editor.setValue("");
  editor.clearHistory();
  editor.setCursor({ line: 0, ch: 0 });
  document.getElementById("filename-input").value = "";
  document.getElementById("lang-select").value    = "javascript";
  onLangChange("javascript", false);
  _persistState();
  toast("New file", "inf");
  editor.focus();
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