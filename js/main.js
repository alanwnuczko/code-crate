const LANGS = {
  javascript: { mode: "javascript",                          ext: ".js"    },
  typescript: { mode: { name: "javascript", typescript: true }, ext: ".ts" },
  json:       { mode: { name: "javascript", json: true },       ext: ".json"  },
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
  quartz:     { cm: "cs-quartz" },
  monarch:    { cm: "cs-monarch" },
  aurora:     { cm: "cs-aurora" },
  grove:      { cm: "cs-grove" },
  rose:       { cm: "cs-rose" },
  contrast:   { cm: "cs-contrast" },
  nord:       { cm: "cs-nord" },
  dracula:    { cm: "cs-dracula" },
};

document.documentElement.dataset.theme = "dusk";
let isPinned = false;

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
  m: "margin: ;", mt: "margin-top: ;", mr: "margin-right: ;", mb: "margin-bottom: ;", ml: "margin-left: ;",
  p: "padding: ;", pt: "padding-top: ;", pr: "padding-right: ;", pb: "padding-bottom: ;", pl: "padding-left: ;",
  w: "width: ;", miw: "min-width: ;", maw: "max-width: ;",
  h: "height: ;", mih: "min-height: ;", mah: "max-height: ;",
  bxz: "box-sizing: ;", "bxz:cb": "box-sizing: content-box;", "bxz:bb": "box-sizing: border-box;",
  
  d: "display: ;", dn: "display: none;", db: "display: block;", di: "display: inline;", dib: "display: inline-block;",
  df: "display: flex;", dif: "display: inline-flex;", dg: "display: grid;", dig: "display: inline-grid;", dt: "display: table;",
  pos: "position: ;", psr: "position: relative;", psa: "position: absolute;", psf: "position: fixed;", pss: "position: sticky;",
  t: "top: ;", r: "right: ;", b: "bottom: ;", l: "left: ;", z: "z-index: ;",
  fl: "float: ;", flr: "float: right;", fll: "float: left;", cl: "clear: ;", clb: "clear: both;",
  
  fx: "flex: ;", "fx:1": "flex: 1;", fxd: "flex-direction: ;", "fxd:r": "flex-direction: row;", "fxd:c": "flex-direction: column;",
  fxw: "flex-wrap: ;", "fxw:n": "flex-wrap: nowrap;", "fxw:w": "flex-wrap: wrap;",
  jc: "justify-content: ;", "jc:fs": "justify-content: flex-start;", "jc:fe": "justify-content: flex-end;", "jc:c": "justify-content: center;", "jc:sb": "justify-content: space-between;", "jc:sa": "justify-content: space-around;",
  ai: "align-items: ;", "ai:fs": "align-items: flex-start;", "ai:fe": "align-items: flex-end;", "ai:c": "align-items: center;", "ai:b": "align-items: baseline;", "ai:s": "align-items: stretch;",
  ac: "align-content: ;", "ac:fs": "align-content: flex-start;", "ac:fe": "align-content: flex-end;", "ac:c": "align-content: center;", "ac:sb": "align-content: space-between;", "ac:sa": "align-content: space-around;", "ac:s": "align-content: stretch;",
  as: "align-self: ;", "as:fs": "align-self: flex-start;", "as:fe": "align-self: flex-end;", "as:c": "align-self: center;", "as:b": "align-self: baseline;", "as:s": "align-self: stretch;",
  
  gtc: "grid-template-columns: ;", gtr: "grid-template-rows: ;", gta: "grid-template-areas: ;",
  gc: "grid-column: ;", gr: "grid-row: ;", ga: "grid-area: ;",
  gap: "gap: ;", rg: "row-gap: ;", cg: "column-gap: ;",
  
  c: "color: ;", "c:t": "color: transparent;",
  fz: "font-size: ;", fw: "font-weight: ;", "fw:n": "font-weight: normal;", "fw:b": "font-weight: bold;",
  ff: "font-family: ;", lh: "line-height: ;", ls: "letter-spacing: ;",
  ta: "text-align: ;", "ta:l": "text-align: left;", "ta:c": "text-align: center;", "ta:r": "text-align: right;", "ta:j": "text-align: justify;",
  td: "text-decoration: ;", "td:n": "text-decoration: none;", "td:u": "text-decoration: underline;", "td:o": "text-decoration: overline;", "td:lt": "text-decoration: line-through;",
  tt: "text-transform: ;", "tt:n": "text-transform: none;", "tt:c": "text-transform: capitalize;", "tt:u": "text-transform: uppercase;", "tt:l": "text-transform: lowercase;",
  ws: "white-space: ;", "ws:n": "white-space: normal;", "ws:nw": "white-space: nowrap;", "ws:p": "white-space: pre;", "ws:pw": "white-space: pre-wrap;",
  ww: "word-wrap: ;", "ww:bw": "word-wrap: break-word;",
  va: "vertical-align: ;", "va:t": "vertical-align: top;", "va:m": "vertical-align: middle;", "va:b": "vertical-align: bottom;", "va:bl": "vertical-align: baseline;",
  
  bg: "background: ;", "bg+": "background: #fff url() 0 0 no-repeat;", bgc: "background-color: ;", "bgc:t": "background-color: transparent;",
  bgi: "background-image: url();", "bgi:n": "background-image: none;",
  bgr: "background-repeat: ;", "bgr:n": "background-repeat: no-repeat;", "bgr:x": "background-repeat: repeat-x;", "bgr:y": "background-repeat: repeat-y;",
  bgp: "background-position: 0 0;", bgs: "background-size: ;", "bgs:cv": "background-size: cover;", "bgs:ct": "background-size: contain;",
  bga: "background-attachment: ;", "bga:f": "background-attachment: fixed;", "bga:s": "background-attachment: scroll;",
  
  bd: "border: ;", "bd+": "border: 1px solid #000;", bdt: "border-top: ;", bdr: "border-right: ;", bdb: "border-bottom: ;", bdl: "border-left: ;",
  bdc: "border-color: ;", "bdc:t": "border-color: transparent;", bdw: "border-width: ;", bds: "border-style: ;",
  "bds:n": "border-style: none;", "bds:s": "border-style: solid;", "bds:d": "border-style: dashed;", "bds:do": "border-style: dotted;",
  bdrs: "border-radius: ;",
  
  lis: "list-style: ;", "lis:n": "list-style: none;", lisi: "list-style-image: url();", "lisi:n": "list-style-image: none;",
  list: "list-style-type: ;", "list:n": "list-style-type: none;", "list:c": "list-style-type: circle;", "list:d": "list-style-type: disc;", "list:s": "list-style-type: square;",
  
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

    "Ctrl-S": () => saveFile(),
    "Cmd-S": () => saveFile(),
    "Ctrl-O": () => openFile(),
    "Ctrl-N": () => newFile(),
    "Ctrl-=": () => zoomEditor(1),
    "Ctrl-+": () => zoomEditor(1),
    "Ctrl--": () => zoomEditor(-1),
    "Ctrl-0": () => resetZoom(),
    "Cmd-=": () => zoomEditor(1),
    "Cmd-+": () => zoomEditor(1),
    "Cmd--": () => zoomEditor(-1),
    "Cmd-0": () => resetZoom(),
    "Ctrl-Shift-P": () => openCommandPalette(),
    "Cmd-Shift-P": () => openCommandPalette(),
    "F1": () => openCommandPalette(),
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

let tabs = [];
let activeTabId = null;
let tabIdCounter = 1;
let isSwitchingTab = false;

let isDirty = false;
let _saveTimer = null;
function _scheduleSave() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(_persistState, 1400);
}
editor.on("change", () => {
  if (isSwitchingTab) return;
  if (editor.getValue().trim() !== "") isDirty = true;
  const currentTab = tabs.find(t => t.id === activeTabId);
  if (currentTab) {
    currentTab.code = editor.getValue();
    currentTab.isDirty = isDirty;
  }
  renderTabs();
  _scheduleSave();
});

setTimeout(() => {
  const fi = document.getElementById("filename-input");
  if (fi) {
    fi.addEventListener("input", () => {
      if (isSwitchingTab) return;
      const currentTab = tabs.find(t => t.id === activeTabId);
      if (currentTab) {
        currentTab.filename = _stripExtension(fi.value.trim(), currentTab.language) || "untitled";
        renderTabs();
        _scheduleSave();
      }
    });
  }
}, 100);

let currentFontSize = 13;

function setEditorFontSize(size, shouldPersist = true) {
  const newSize = Math.min(Math.max(size, 8), 48);
  currentFontSize = newSize;
  if (typeof editor !== "undefined" && editor) {
    const scrollInfo = editor.getScrollInfo();
    const topVisibleLine = editor.lineAtHeight(scrollInfo.top, "local");
    const lineTopOffset = scrollInfo.top - editor.heightAtLine(topVisibleLine, "local");
    const oldLineHeight = editor.defaultTextHeight() || 1;

    editor.getWrapperElement().style.fontSize = currentFontSize + "px";
    editor.refresh();

    const newLineHeight = editor.defaultTextHeight() || 1;
    const scaledOffset = lineTopOffset * (newLineHeight / oldLineHeight);
    const newTop = editor.heightAtLine(topVisibleLine, "local") + scaledOffset;
    editor.scrollTo(scrollInfo.left, newTop);
  }
  if (shouldPersist) _scheduleSave();
}

function zoomEditor(step) {
  setEditorFontSize(currentFontSize + step, true);
  toast("Zoom: " + currentFontSize + "px", "inf");
}

function resetZoom() {
  setEditorFontSize(13, true);
  toast("Zoom reset: 13px", "inf");
}

window.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === "=" || e.key === "+" || e.code === "NumpadAdd") {
      e.preventDefault();
      zoomEditor(1);
    } else if (e.key === "-" || e.code === "NumpadSubtract") {
      e.preventDefault();
      zoomEditor(-1);
    } else if (e.key === "0" || e.code === "Numpad0") {
      e.preventDefault();
      resetZoom();
    }
  }
});

window.addEventListener("wheel", (e) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (e.deltaY < 0) {
      zoomEditor(1);
    } else if (e.deltaY > 0) {
      zoomEditor(-1);
    }
  }
}, { capture: true, passive: false });

function _protectFromWindowDrag(selector) {
  document.querySelectorAll(selector).forEach(el => {
    ["mousedown", "pointerdown", "touchstart"].forEach(type => {
      el.addEventListener(type, event => event.stopPropagation());
    });
  });
}

_protectFromWindowDrag("#editor-wrap, input, select, button");

function renderTabs() {
  const bar = document.getElementById("tabbar");
  if (!bar) return;
  bar.innerHTML = "";
  tabs.forEach(tab => {
    const el = document.createElement("div");
    el.className = "doc-tab" + (tab.id === activeTabId ? " active" : "");
    el.onclick = (e) => {
      if (e.target.closest(".doc-tab-close")) return;
      switchTab(tab.id);
    };
    const def = LANGS[tab.language] || LANGS.javascript;
    const ext = def ? def.ext : ".js";
    const titleSpan = document.createElement("span");
    titleSpan.className = "doc-tab-title";
    titleSpan.textContent = (tab.filename || "untitled") + ext + (tab.isDirty ? " •" : "");
    el.appendChild(titleSpan);

    const closeBtn = document.createElement("span");
    closeBtn.className = "doc-tab-close";
    closeBtn.innerHTML = "&times;";
    closeBtn.title = "Close tab";
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    };
    el.appendChild(closeBtn);
    bar.appendChild(el);
  });

  const newBtn = document.createElement("button");
  newBtn.className = "doc-tab-new";
  newBtn.innerHTML = "+";
  newBtn.title = "New tab (Ctrl+T)";
  newBtn.onclick = () => createTab();
  bar.appendChild(newBtn);
}

function switchTab(id) {
  if (activeTabId === id && !isSwitchingTab) return;
  const currentTab = tabs.find(t => t.id === activeTabId);
  if (currentTab && !isSwitchingTab) {
    currentTab.code = editor.getValue();
    currentTab.filename = document.getElementById("filename-input").value.trim() || "untitled";
    currentTab.language = document.getElementById("lang-select").value;
    currentTab.isDirty = isDirty;
    currentTab.path = document.getElementById("export-dir").value.trim();
  }
  isSwitchingTab = true;
  activeTabId = id;
  const nextTab = tabs.find(t => t.id === id);
  if (nextTab) {
    document.getElementById("filename-input").value = (nextTab.filename && nextTab.filename !== "untitled" && nextTab.filename !== "snippet") ? _stripExtension(nextTab.filename, nextTab.language) : "";
    document.getElementById("lang-select").value = nextTab.language || "javascript";
    const def = LANGS[nextTab.language] || LANGS.javascript;
    editor.setOption("mode", def.mode);
    document.getElementById("ext-badge").textContent = def.ext;
    document.getElementById("filename-ext").textContent = def.ext;
    if (typeof updateLangDropdownActive === "function") updateLangDropdownActive();
    editor.setValue(nextTab.code || "");
    editor.clearHistory();
    isDirty = nextTab.isDirty || false;
    document.getElementById("export-dir").value = nextTab.path || "";
  }
  isSwitchingTab = false;
  renderTabs();
  updateGitBranch();
  _persistState();
}

function _stripExtension(filename, lang) {
  if (!filename || filename === "untitled" || filename === "snippet") return filename || "untitled";
  let name = filename.trim();
  const def = LANGS[lang] || LANGS.javascript;
  if (def && def.ext && name.toLowerCase().endsWith(def.ext.toLowerCase())) {
    return name.slice(0, -def.ext.length);
  }
  const dotIdx = name.lastIndexOf(".");
  if (dotIdx > 0) {
    const ext = name.slice(dotIdx).toLowerCase();
    for (const val of Object.values(LANGS)) {
      if (val.ext && val.ext.toLowerCase() === ext) {
        return name.slice(0, dotIdx);
      }
    }
  }
  return name;
}

let lastCreateTabTime = 0;
function createTab(filename = "untitled", lang = "javascript", code = "", path = null) {
  const now = Date.now();
  if (now - lastCreateTabTime < 250) return;
  lastCreateTabTime = now;
  const currentTab = tabs.find(t => t.id === activeTabId);
  if (currentTab && !isSwitchingTab) {
    currentTab.code = editor.getValue();
    currentTab.filename = _stripExtension(document.getElementById("filename-input").value.trim(), document.getElementById("lang-select").value) || "untitled";
    currentTab.language = document.getElementById("lang-select").value;
    currentTab.isDirty = isDirty;
    currentTab.path = document.getElementById("export-dir").value.trim();
  }
  const id = tabIdCounter++;
  const currentDir = document.getElementById("export-dir") ? document.getElementById("export-dir").value.trim() : "";
  const effectivePath = (path !== null && path !== "") ? path : currentDir;
  const cleanFilename = _stripExtension(filename, lang);
  tabs.push({ id, filename: cleanFilename, language: lang, code, isDirty: false, path: effectivePath });
  switchTab(id);
  toast("New tab", "inf");
}

let pendingCloseTabId = null;

function closeTab(id, force = false) {
  const idx = tabs.findIndex(t => t.id === id);
  if (idx === -1) return;
  const targetTab = tabs[idx];
  const targetDirty = (id === activeTabId) ? isDirty : targetTab.isDirty;

  if (targetDirty && !force) {
    pendingCloseTabId = id;
    const modal = document.getElementById("close-tab-confirm-modal");
    if (modal) modal.classList.remove("hidden");
    return;
  }

  tabs.splice(idx, 1);
  if (tabs.length === 0) {
    activeTabId = null;
    tabIdCounter = 1;
    createTab("untitled", "javascript", "");
  } else if (activeTabId === id) {
    const nextIdx = Math.min(idx, tabs.length - 1);
    switchTab(tabs[nextIdx].id);
  } else {
    renderTabs();
    _persistState();
  }
}

function cancelCloseTab() {
  pendingCloseTabId = null;
  const modal = document.getElementById("close-tab-confirm-modal");
  if (modal) modal.classList.add("hidden");
}

function confirmCloseTab() {
  if (pendingCloseTabId !== null) {
    const id = pendingCloseTabId;
    cancelCloseTab();
    closeTab(id, true);
  } else {
    cancelCloseTab();
  }
}

function onLangChange(key, shouldPersist = true) {
  const def = LANGS[key];
  if (!def) return;
  const select = document.getElementById("lang-select");
  if (select && select.value !== key) select.value = key;
  editor.setOption("mode", def.mode);
  document.getElementById("ext-badge").textContent    = def.ext;
  document.getElementById("filename-ext").textContent = def.ext;
  if (typeof updateLangDropdownActive === "function") updateLangDropdownActive();
  if (!isSwitchingTab) {
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (currentTab) {
      currentTab.language = key;
      renderTabs();
    }
  }
  if (shouldPersist) _persistState();
}

function _setTheme(key, shouldPersist) {
  const next = THEMES[key] ? key : "dusk";
  document.documentElement.dataset.theme = next;
  const select = document.getElementById("theme-select");
  if (select && select.value !== next) select.value = next;
  if (typeof updateThemeDropdownActive === "function") updateThemeDropdownActive();
  editor.setOption("theme", THEMES[next].cm);
  editor.refresh();
  if (shouldPersist) _persistState();
}

function onThemeChange(key) {
  _setTheme(key, true);
}
window.setTheme = onThemeChange;

function toggleLangDropdown(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById("lang-dropdown-menu");
  if (!menu) return;
  const isHidden = menu.classList.contains("hidden");
  closeAllCustomDropdowns();
  if (isHidden) {
    menu.classList.remove("hidden");
    updateLangDropdownActive();
  }
}

function closeLangDropdown() {
  const menu = document.getElementById("lang-dropdown-menu");
  if (menu) menu.classList.add("hidden");
}

function selectLang(key, event) {
  if (event) event.stopPropagation();
  closeLangDropdown();
  const select = document.getElementById("lang-select");
  if (select) select.value = key;
  onLangChange(key);
}

function updateLangDropdownActive() {
  const select = document.getElementById("lang-select");
  const currentKey = select ? select.value : "javascript";
  const items = document.querySelectorAll("#lang-dropdown-menu .custom-dropdown-item");
  items.forEach(item => {
    item.classList.toggle("active", item.dataset.key === currentKey);
  });
}

function toggleThemeDropdown(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById("theme-dropdown-menu");
  if (!menu) return;
  const isHidden = menu.classList.contains("hidden");
  closeAllCustomDropdowns();
  if (isHidden) {
    menu.classList.remove("hidden");
    updateThemeDropdownActive();
  }
}

function closeThemeDropdown() {
  const menu = document.getElementById("theme-dropdown-menu");
  if (menu) menu.classList.add("hidden");
}

function selectTheme(key, event) {
  if (event) event.stopPropagation();
  closeThemeDropdown();
  const select = document.getElementById("theme-select");
  if (select) select.value = key;
  onThemeChange(key);
}

function updateThemeDropdownActive() {
  const select = document.getElementById("theme-select");
  const currentKey = select ? select.value : "dusk";
  const display = document.getElementById("theme-display");
  const themeNames = {
    dusk: "Ember", quartz: "Quartz", monarch: "Monarch", aurora: "Aurora",
    grove: "Grove", rose: "Rose", contrast: "Contrast", nord: "Nord", dracula: "Dracula"
  };
  if (display) display.textContent = themeNames[currentKey] || "Ember";
  const items = document.querySelectorAll("#theme-dropdown-menu .custom-dropdown-item");
  items.forEach(item => {
    item.classList.toggle("active", item.dataset.key === currentKey);
  });
}

function closeAllCustomDropdowns() {
  closeLangDropdown();
  closeThemeDropdown();
}

window.addEventListener("click", (e) => {
  if (!e.target.closest(".doc-ext-wrapper") && !e.target.closest("#lang-dropdown-menu")) {
    closeLangDropdown();
  }
  if (!e.target.closest(".theme-dropdown-wrap") && !e.target.closest("#theme-dropdown-menu")) {
    closeThemeDropdown();
  }
});


function togglePin() {
  isPinned = !isPinned;
  const btn = document.getElementById('btn-pin');
  if (btn) btn.classList.toggle('pinned', isPinned);
  if (window.pywebview) {
    window.pywebview.api.toggle_pin(isPinned).then(r => {
      if (!r.ok) {
        isPinned = !isPinned;
        if (btn) btn.classList.toggle('pinned', isPinned);
        toast(r.error || 'Pin failed', 'err');
      }
    });
  }
  _persistState();
}

window.__setPinUI = function(val) {
  isPinned = !!val;
  const btn = document.getElementById('btn-pin');
  if (btn) btn.classList.toggle('pinned', isPinned);
};

function onExportDirChange(val) {
  const currentTab = tabs.find(t => t.id === activeTabId);
  if (currentTab) currentTab.path = (val || "").trim();
  updateGitBranch();
}

let _gitLookupId = 0;
const _gitBranchCache = {};
function updateGitBranch() {
  const el = document.getElementById('git-branch');
  const nameEl = document.getElementById('git-branch-name');
  if (!el || !nameEl) return;
  if (!window.pywebview) { el.style.display = 'none'; return; }

  const dir = document.getElementById('export-dir').value.trim();
  if (!dir) { el.style.display = 'none'; return; }

  if (_gitBranchCache[dir] !== undefined) {
    if (_gitBranchCache[dir]) {
      nameEl.textContent = _gitBranchCache[dir];
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  } else {
    el.style.display = 'none';
  }

  const lookupId = ++_gitLookupId;
  window.pywebview.api.get_git_branch(dir).then(r => {
    if (r.ok && r.branch) {
      _gitBranchCache[dir] = r.branch;
    } else {
      _gitBranchCache[dir] = null;
    }
    if (lookupId !== _gitLookupId) return;
    if (r.ok && r.branch) {
      nameEl.textContent = r.branch;
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  }).catch(() => {
    _gitBranchCache[dir] = null;
    if (lookupId === _gitLookupId) el.style.display = 'none';
  });
}

setInterval(updateGitBranch, 30000);

function newFile() {
  createTab("untitled", "javascript", "");
}

function openFile() {
  if (!window.pywebview) { toast("File open only works in the desktop app", "inf"); return; }
  window.pywebview.api.open_file().then(result => {
    if (!result.ok) {
      if (result.error) toast(result.error, "err");
      return;
    }
    const filename = result.filename || "untitled";
    const lang = LANGS[result.language] ? result.language : "javascript";
    const dir = result.path.replace(/[\\/][^\\/]+$/, "");
    createTab(filename, lang, result.code, dir || "");
    toast("Opened " + filename, "ok");
  });
}

function pickFolder() {
  if (!window.pywebview) { toast("Folder picker only works in the desktop app", "inf"); return; }
  window.pywebview.api.pick_folder().then(result => {
    if (result.ok) {
      document.getElementById("export-dir").value = result.path;
      const currentTab = tabs.find(t => t.id === activeTabId);
      if (currentTab) currentTab.path = result.path;
      _persistState();
      updateGitBranch();
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
    ? window.pywebview.api.save_file(dir, filename || "untitled", lang, code)
    : Promise.resolve({ ok: false, error: "Not running in desktop app" });

  call.then(r => {
    if (r.ok) {
      toast("saved  " + r.path.split(/[\\/]/).pop(), "ok");
      isDirty = false;
      const currentTab = tabs.find(t => t.id === activeTabId);
      if (currentTab) {
        currentTab.isDirty = false;
        currentTab.path = dir;
        currentTab.filename = _stripExtension(filename || "untitled", lang);
      }
      renderTabs();
      updateGitBranch();
      _persistState();
    } else {
      toast(r.error || "Save failed", "err");
    }
  });
}

async function saveAllTabs() {
  if (!tabs || tabs.length === 0) {
    toast("No tabs to save", "inf");
    return;
  }

  let parent = document.getElementById("export-dir").value.trim();

  if (!parent) {
    if (window.pywebview && window.pywebview.api && window.pywebview.api.pick_folder) {
      try {
        const result = await window.pywebview.api.pick_folder();
        if (result && result.ok && result.path) {
          parent = result.path;
        } else {
          return;
        }
      } catch (_) {
        toast("Folder selection failed", "err");
        return;
      }
    } else {
      toast("Set a destination folder first", "err");
      return;
    }
  }

  if (!parent) {
    toast("No destination folder", "err");
    return;
  }

  const first = tabs[0] || {};
  let defaultName = (first.filename && first.filename !== "untitled") ? first.filename : "code-crate";
  const folderName = await showFolderNameModal(defaultName);
  if (!folderName) {
    return;
  }

  let dir = parent;
  if (window.pywebview && window.pywebview.api && window.pywebview.api.create_folder) {
    try {
      const createRes = await window.pywebview.api.create_folder(parent, folderName);
      if (createRes && createRes.ok && createRes.path) {
        dir = createRes.path;
        document.getElementById("export-dir").value = dir;
        onExportDirChange(dir);
        _persistState();
      } else {
        toast(createRes && createRes.error ? createRes.error : "Failed to create folder", "err");
        return;
      }
    } catch (_) {
      toast("Could not create subfolder", "err");
      return;
    }
  } else {
    const sep = parent.includes("\\") ? "\\" : "/";
    dir = parent.endsWith(sep) ? parent + folderName : parent + sep + folderName;
  }

  const currentTab = tabs.find(t => t.id === activeTabId);
  if (currentTab) {
    currentTab.code = editor.getValue();
    currentTab.filename = _stripExtension(document.getElementById("filename-input").value.trim(), currentTab.language) || "untitled";
    currentTab.language = document.getElementById("lang-select").value;
    currentTab.path = dir;
    currentTab.isDirty = isDirty;
  }

  const usedNames = new Set();
  const results = [];

  for (const tab of tabs) {
    let base = (tab.filename || "untitled").trim() || "untitled";
    const lang = tab.language || "text";
    let candidate = base;
    let counter = 1;
    while (usedNames.has(candidate.toLowerCase())) {
      candidate = `${base} (${counter++})`;
    }
    usedNames.add(candidate.toLowerCase());

    const code = tab.code || "";

    try {
      const call = window.pywebview && window.pywebview.api
        ? window.pywebview.api.save_file(dir, candidate, lang, code)
        : Promise.resolve({ ok: false, error: "Not running in desktop app" });

      const r = await call;

      if (r && r.ok) {
        tab.isDirty = false;
        tab.path = dir;
        tab.filename = _stripExtension(candidate, lang);
        results.push({ ok: true, name: (r.path || candidate).split(/[\\/]/).pop() });
      } else {
        results.push({ ok: false, name: candidate, error: (r && r.error) || "unknown" });
      }
    } catch (e) {
      results.push({ ok: false, name: candidate, error: e.message || e });
    }
  }

  renderTabs();
  updateGitBranch();
  _persistState();

  const saved = results.filter(r => r.ok).length;
  const failed = results.length - saved;
  const folderDisplay = dir.split(/[\\/]/).pop() || "folder";

  if (saved > 0 && failed === 0) {
    toast(`Saved ${saved} file${saved !== 1 ? "s" : ""} to "${folderDisplay}"`, "ok");
  } else if (saved > 0) {
    toast(`Saved ${saved}, ${failed} failed`, "err");
  } else {
    toast("Failed to save tabs", "err");
  }
}

function clearAll() {
  if (!editor.getValue().trim()) return;
  editor.setValue("");
  editor.clearHistory();
  isDirty = false;
  const currentTab = tabs.find(t => t.id === activeTabId);
  if (currentTab) {
    currentTab.code = "";
    currentTab.isDirty = false;
  }
  renderTabs();
  toast("Cleared", "inf");
}

function toggleHamburgerMenu(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById("hamburger-menu");
  if (menu) menu.classList.toggle("hidden");
}

function closeHamburgerMenu() {
  const menu = document.getElementById("hamburger-menu");
  if (menu) menu.classList.add("hidden");
}

function onRequestClear(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  if (!editor.getValue().trim()) return;
  if (isDirty) {
    const modal = document.getElementById("clear-confirm-modal");
    if (modal) modal.classList.remove("hidden");
  } else {
    clearAll();
  }
}

function cancelClear() {
  const modal = document.getElementById("clear-confirm-modal");
  if (modal) modal.classList.add("hidden");
}

function confirmClear() {
  clearAll();
  cancelClear();
}

let pendingFolderResolve = null;
function showFolderNameModal(defaultName) {
  const modal = document.getElementById("folder-name-modal");
  const input = document.getElementById("folder-name-input");
  if (!modal || !input) return Promise.resolve(null);
  input.value = defaultName || "";
  modal.classList.remove("hidden");
  setTimeout(() => { input.focus(); input.select(); }, 10);
  input.onkeydown = function(e) {
    if (e.key === "Enter") { e.preventDefault(); confirmFolderName(); }
    if (e.key === "Escape") { e.preventDefault(); cancelFolderName(); }
  };
  return new Promise(function(resolve) { pendingFolderResolve = resolve; });
}
function cancelFolderName() {
  const modal = document.getElementById("folder-name-modal");
  if (modal) modal.classList.add("hidden");
  if (pendingFolderResolve) { pendingFolderResolve(null); pendingFolderResolve = null; }
}
function confirmFolderName() {
  const modal = document.getElementById("folder-name-modal");
  const input = document.getElementById("folder-name-input");
  const value = input ? input.value.trim() : "";
  if (modal) modal.classList.add("hidden");
  if (pendingFolderResolve) { pendingFolderResolve(value || null); pendingFolderResolve = null; }
}

window.addEventListener("click", (e) => {
  const menu = document.getElementById("hamburger-menu");
  const btnHam = document.getElementById("btn-hamburger");
  if (menu && !menu.classList.contains("hidden")) {
    if (!menu.contains(e.target) && (!btnHam || !btnHam.contains(e.target))) {
      closeHamburgerMenu();
    }
  }

  const modal = document.getElementById("clear-confirm-modal");
  if (modal && !modal.classList.contains("hidden")) {
    const box = modal.querySelector(".app-confirm-box, .vscode-confirm-box");
    const clearBtn = e.target.closest ? e.target.closest('[onclick*="onRequestClear"]') : null;
    if (box && !box.contains(e.target) && !clearBtn) {
      cancelClear();
    }
  }

  const tabModal = document.getElementById("close-tab-confirm-modal");
  if (tabModal && !tabModal.classList.contains("hidden")) {
    const box = tabModal.querySelector(".app-confirm-box");
    const closeBtn = e.target.closest ? e.target.closest('.doc-tab-close') : null;
    if (box && !box.contains(e.target) && !closeBtn) {
      cancelCloseTab();
    }
  }

  const folderModal = document.getElementById("folder-name-modal");
  if (folderModal && !folderModal.classList.contains("hidden")) {
    const box = folderModal.querySelector(".app-confirm-box");
    const folderBtn = e.target.closest ? e.target.closest('[onclick*="FolderName"]') : null;
    if (box && !box.contains(e.target) && !folderBtn) {
      cancelFolderName();
    }
  }
});

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
  const currentTab = tabs.find(t => t.id === activeTabId);
  if (currentTab) {
    currentTab.code = editor.getValue();
    currentTab.filename = document.getElementById("filename-input").value.trim() || "untitled";
    currentTab.language = document.getElementById("lang-select").value;
    currentTab.isDirty = isDirty;
    currentTab.path = document.getElementById("export-dir").value.trim();
  }
  const payload = {
    language:   document.getElementById("lang-select").value,
    theme:      document.getElementById("theme-select").value,
    code:       editor.getValue(),
    export_dir: document.getElementById("export-dir").value.trim(),
    filename:   document.getElementById("filename-input").value.trim(),
    fontSize:   currentFontSize,
    tabs:       tabs,
    activeTabId: activeTabId,
    tabIdCounter: tabIdCounter,
    pinned: isPinned
  };
  if (window.pywebview) window.pywebview.api.save_note(payload);
  else try { localStorage.setItem("cs_state", JSON.stringify(payload)); } catch (_) {}
}

function _applyState(data) {
  if (!data) return;
  let themeKey = data.theme;
  if (themeKey === "paper") themeKey = "quartz";
  if (themeKey && THEMES[themeKey]) {
    _setTheme(themeKey, false);
  }
  if (data.fontSize !== undefined && typeof data.fontSize === "number") {
    setEditorFontSize(data.fontSize, false);
  }
  if (data.pinned) {
    isPinned = true;
    const btn = document.getElementById('btn-pin');
    if (btn) btn.classList.add('pinned');
    if (window.pywebview) {
      window.pywebview.api.toggle_pin(true).catch(() => {});
    }
  }
  if (data.export_dir) document.getElementById("export-dir").value = data.export_dir;

  if (data.tabs && Array.isArray(data.tabs) && data.tabs.length > 0) {
    tabs = data.tabs.map(t => ({
      ...t,
      path: t.path !== undefined ? t.path : (data.export_dir || "")
    }));
    tabIdCounter = data.tabIdCounter || (Math.max(...tabs.map(t => t.id || 0)) + 1);
    const targetId = data.activeTabId || tabs[0].id;
    isSwitchingTab = true;
    activeTabId = targetId;
    const nextTab = tabs.find(t => t.id === targetId) || tabs[0];
    activeTabId = nextTab.id;
    document.getElementById("filename-input").value = (nextTab.filename && nextTab.filename !== "untitled" && nextTab.filename !== "snippet") ? nextTab.filename : "";
    document.getElementById("lang-select").value = nextTab.language || "javascript";
    const def = LANGS[nextTab.language] || LANGS.javascript;
    editor.setOption("mode", def.mode);
    document.getElementById("ext-badge").textContent = def.ext;
    document.getElementById("filename-ext").textContent = def.ext;
    editor.setValue(nextTab.code || "");
    editor.clearHistory();
    isDirty = nextTab.isDirty || false;
    document.getElementById("export-dir").value = nextTab.path || "";
    isSwitchingTab = false;
    renderTabs();
    updateGitBranch();
    if (typeof updateLangDropdownActive === "function") updateLangDropdownActive();
    if (typeof updateThemeDropdownActive === "function") updateThemeDropdownActive();
  } else {
    const filename = data.filename || "untitled";
    const lang = (data.language && LANGS[data.language]) ? data.language : "javascript";
    const code = data.code || "";
    tabs = [{ id: 1, filename, language: lang, code, isDirty: false, path: data.export_dir || "" }];
    tabIdCounter = 2;
    activeTabId = 1;
    document.getElementById("filename-input").value = (filename && filename !== "untitled" && filename !== "snippet") ? filename : "";
    document.getElementById("lang-select").value = lang;
    const def = LANGS[lang] || LANGS.javascript;
    editor.setOption("mode", def.mode);
    document.getElementById("ext-badge").textContent = def.ext;
    document.getElementById("filename-ext").textContent = def.ext;
    editor.setValue(code);
    editor.clearHistory();
    isDirty = false;
    renderTabs();
    updateGitBranch();
    if (typeof updateLangDropdownActive === "function") updateLangDropdownActive();
    if (typeof updateThemeDropdownActive === "function") updateThemeDropdownActive();
  }
}

function _loadState() {
  const checkEmpty = () => {
    if (tabs.length === 0) {
      createTab("untitled", "javascript", "");
    }
  };
  if (window.pywebview) {
    window.pywebview.api.load_note().then(res => {
      _applyState(res);
      checkEmpty();
    }).catch(checkEmpty);
  } else {
    try {
      const raw = localStorage.getItem("cs_state");
      if (raw) _applyState(JSON.parse(raw));
    } catch (_) {}
    checkEmpty();
  }
}

function toast(msg, type) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = "show " + (type || "inf");
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = ""; }, 2100);
}

window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.ctrlKey || e.metaKey) {
    const k = e.key.toLowerCase();
    if (!e.shiftKey && k === "s") {
      e.preventDefault();
      saveFile();
    } else if (!e.shiftKey && k === "t") {
      e.preventDefault();
      createTab();
    } else if (!e.shiftKey && k === "o") {
      e.preventDefault();
      openFile();
    } else if (!e.shiftKey && k === "w") {
      e.preventDefault();
      if (activeTabId !== null) closeTab(activeTabId);
    }
  }
});

function _setupWindowDragging() {
  let isDragging = false;
  let lastX = 0, lastY = 0;
  let pendingDx = 0, pendingDy = 0;
  let rafId = null;

  function _tick() {
    if (!isDragging) {
      rafId = null;
      return;
    }
    if (pendingDx !== 0 || pendingDy !== 0) {
      const dx = pendingDx;
      const dy = pendingDy;
      pendingDx = 0;
      pendingDy = 0;
      if (window.pywebview && window.pywebview.api && window.pywebview.api.move_window_by) {
        window.pywebview.api.move_window_by(dx, dy);
      }
    }
    rafId = requestAnimationFrame(_tick);
  }

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    pendingDx += e.screenX - lastX;
    pendingDy += e.screenY - lastY;
    lastX = e.screenX;
    lastY = e.screenY;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  const regions = [document.getElementById("topbar"), document.getElementById("tabbar"), document.getElementById("footer")];
  regions.forEach(el => {
    if (!el) return;
    el.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      if (e.target.closest("button, input, select, option, .doc-ext-wrapper, .theme-dropdown-wrap, .custom-dropdown-menu, .path-input-wrap")) return;
      isDragging = true;
      lastX = e.screenX;
      lastY = e.screenY;
      pendingDx = 0;
      pendingDy = 0;
      if (!rafId) rafId = requestAnimationFrame(_tick);
      if (window.pywebview && window.pywebview.api && window.pywebview.api.start_drag) {
        window.pywebview.api.start_drag();
      }
    });
  });
}
_setupWindowDragging();

onLangChange("javascript", false);
window.addEventListener("pywebviewready", _loadState);
if (!window.pywebview) setTimeout(_loadState, 60);

const COMMAND_PALETTE_ITEMS = [
  { title: "New Document Tab", category: "Tab", action: () => newFile() },
  { title: "Close Current Tab", category: "Tab", action: () => closeTab() },
  { title: "Open File from Disk...", category: "Tab", action: () => openFile() },
  { title: "Save File to Disk...", category: "Tab", action: () => saveFile() },
  { title: "Save All Tabs as Folder...", category: "Tab", action: () => saveAllTabs() },
  { title: "Clear Editor Content", category: "Tab", action: () => promptClear() },
  { title: "Copy Editor Content", category: "Tab", action: () => copyText() },
  { title: "Toggle Always on Top (Pin / Unpin)", category: "Window", action: () => togglePin() },
  { title: "Theme: Dusk (Dark)", category: "Theme", action: () => setTheme("dusk") },
  { title: "Theme: Quartz (Blue Light)", category: "Theme", action: () => setTheme("quartz") },
  { title: "Theme: Monarch (Warm Light)", category: "Theme", action: () => setTheme("monarch") },
  { title: "Theme: Aurora (Pastel Dark)", category: "Theme", action: () => setTheme("aurora") },
  { title: "Theme: Grove (Forest Dark)", category: "Theme", action: () => setTheme("grove") },
  { title: "Theme: Rose (Pink Dark)", category: "Theme", action: () => setTheme("rose") },
  { title: "Theme: Contrast (High Contrast Dark)", category: "Theme", action: () => setTheme("contrast") },
  { title: "Theme: Nord (Arctic Dark)", category: "Theme", action: () => setTheme("nord") },
  { title: "Theme: Dracula (Vibrant Dark)", category: "Theme", action: () => setTheme("dracula") },
  { title: "Language: Plain Text (.txt)", category: "Language", action: () => onLangChange("text") },
  { title: "Language: JavaScript (.js)", category: "Language", action: () => onLangChange("javascript") },
  { title: "Language: TypeScript (.ts)", category: "Language", action: () => onLangChange("typescript") },
  { title: "Language: JSON (.json)", category: "Language", action: () => onLangChange("json") },
  { title: "Language: Python (.py)", category: "Language", action: () => onLangChange("python") },
  { title: "Language: C / C++ (.cpp)", category: "Language", action: () => onLangChange("c_cpp") },
  { title: "Language: Java (.java)", category: "Language", action: () => onLangChange("java") },
  { title: "Language: C# (.cs)", category: "Language", action: () => onLangChange("csharp") },
  { title: "Language: Rust (.rs)", category: "Language", action: () => onLangChange("rust") },
  { title: "Language: Go (.go)", category: "Language", action: () => onLangChange("go") },
  { title: "Language: Bash / Shell (.sh)", category: "Language", action: () => onLangChange("shell") },
  { title: "Language: HTML (.html)", category: "Language", action: () => onLangChange("html") },
  { title: "Language: CSS (.css)", category: "Language", action: () => onLangChange("css") },
  { title: "Language: SQL (.sql)", category: "Language", action: () => onLangChange("sql") },
  { title: "Language: PHP (.php)", category: "Language", action: () => onLangChange("php") },
  { title: "Language: Ruby (.rb)", category: "Language", action: () => onLangChange("ruby") },
  { title: "Language: Swift (.swift)", category: "Language", action: () => onLangChange("swift") },
  { title: "Language: YAML (.yaml)", category: "Language", action: () => onLangChange("yaml") },
  { title: "Zoom: Zoom In (+)", category: "View", action: () => zoomEditor(1) },
  { title: "Zoom: Zoom Out (-)", category: "View", action: () => zoomEditor(-1) },
  { title: "Zoom: Reset Zoom (100%)", category: "View", action: () => resetZoom() }
];

let activeCmdPaletteIndex = 0;
let filteredCmdPaletteItems = [];

function openCommandPalette() {
  const backdrop = document.getElementById("cmd-palette-backdrop");
  const input = document.getElementById("cmd-palette-input");
  if (!backdrop || !input) return;
  backdrop.classList.remove("hidden");
  input.value = "";
  activeCmdPaletteIndex = 0;
  filterCommandPalette("");
  setTimeout(() => input.focus(), 10);
}

function closeCommandPalette() {
  const backdrop = document.getElementById("cmd-palette-backdrop");
  if (backdrop) backdrop.classList.add("hidden");
  if (editor && typeof editor.focus === "function") editor.focus();
}

function filterCommandPalette(query) {
  const listEl = document.getElementById("cmd-palette-list");
  if (!listEl) return;
  const q = (query || "").trim().toLowerCase();
  if (!q) {
    filteredCmdPaletteItems = [...COMMAND_PALETTE_ITEMS];
  } else {
    filteredCmdPaletteItems = COMMAND_PALETTE_ITEMS.filter(item => {
      const titleLower = item.title.toLowerCase();
      const catLower = item.category.toLowerCase();
      return titleLower.includes(q) || catLower.includes(q);
    });
  }
  if (activeCmdPaletteIndex >= filteredCmdPaletteItems.length) {
    activeCmdPaletteIndex = Math.max(0, filteredCmdPaletteItems.length - 1);
  }
  renderCommandPaletteList();
}

function renderCommandPaletteList() {
  const listEl = document.getElementById("cmd-palette-list");
  if (!listEl) return;
  if (filteredCmdPaletteItems.length === 0) {
    listEl.innerHTML = '<div class="cmd-palette-empty">No matching commands found</div>';
    return;
  }
  let html = "";
  for (let i = 0; i < filteredCmdPaletteItems.length; i++) {
    const item = filteredCmdPaletteItems[i];
    const activeClass = i === activeCmdPaletteIndex ? "CodeMirror-hint-active" : "";
    html += '<div class="CodeMirror-hint ' + activeClass + '" onclick="executeCommandPaletteItem(' + i + ')" onmousemove="setActiveCmdPaletteIndex(' + i + ')">' +
            '<span class="hint-icon"></span>' +
            '<span class="hint-name">' + _escapeHtml(item.title) + '</span>' +
            '<span class="hint-label">' + _escapeHtml(item.category) + '</span>' +
            '</div>';
  }
  listEl.innerHTML = html;
  const activeEl = listEl.children[activeCmdPaletteIndex];
  if (activeEl && typeof activeEl.scrollIntoView === "function") {
    activeEl.scrollIntoView({ block: "nearest" });
  }
}

function setActiveCmdPaletteIndex(index) {
  if (index === activeCmdPaletteIndex || index < 0 || index >= filteredCmdPaletteItems.length) return;
  activeCmdPaletteIndex = index;
  renderCommandPaletteList();
}

function navigateCommandPalette(dir) {
  if (filteredCmdPaletteItems.length === 0) return;
  activeCmdPaletteIndex = (activeCmdPaletteIndex + dir + filteredCmdPaletteItems.length) % filteredCmdPaletteItems.length;
  renderCommandPaletteList();
}

function executeCommandPaletteItem(index) {
  const item = filteredCmdPaletteItems[index];
  if (!item || typeof item.action !== "function") return;
  closeCommandPalette();
  setTimeout(() => item.action(), 20);
}

function _escapeHtml(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("cmd-palette-input");
  if (input) {
    input.addEventListener("input", (e) => {
      activeCmdPaletteIndex = 0;
      filterCommandPalette(e.target.value);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        navigateCommandPalette(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        navigateCommandPalette(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        executeCommandPaletteItem(activeCmdPaletteIndex);
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeCommandPalette();
      }
    });
  }
});

window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "P" || e.key === "p")) || e.key === "F1") {
    e.preventDefault();
    openCommandPalette();
  } else if (e.key === "Escape") {
    const backdrop = document.getElementById("cmd-palette-backdrop");
    if (backdrop && !backdrop.classList.contains("hidden")) {
      e.preventDefault();
      closeCommandPalette();
    } else {
      const folderM = document.getElementById("folder-name-modal");
      if (folderM && !folderM.classList.contains("hidden")) {
        e.preventDefault();
        cancelFolderName();
      }
    }
  }
});

function _detectLangFromFilename(filename) {
  const ext = (filename.slice(filename.lastIndexOf(".")) || "").toLowerCase();
  for (const [key, val] of Object.entries(LANGS)) {
    if (val.ext === ext) return key;
  }
  if (ext === ".c" || ext === ".h" || ext === ".hpp") return "c_cpp";
  if (ext === ".yaml" || ext === ".yml") return "yaml";
  if (ext === ".htm") return "html";
  return "text";
}

window.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  const ew = document.getElementById("editor-wrap");
  if (ew && !ew.classList.contains("drag-over")) ew.classList.add("drag-over");
}, true);

window.addEventListener("dragleave", (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.relatedTarget === null || e.target === document.documentElement) {
    const ew = document.getElementById("editor-wrap");
    if (ew) ew.classList.remove("drag-over");
  }
}, true);

window.onNativeDrop = function(res) {
  if (!res || !res.ok) return;
  const filename = res.filename || "untitled";
  window.__lastNativeDropFilename = filename;
  const lang = res.language || "javascript";
  const dir = res.path ? res.path.replace(/[\\/][^\\/]+$/, "") : "";
  const cleanName = _stripExtension(filename, lang);
  createTab(cleanName, lang, res.code, dir || "");
  toast("Opened " + cleanName, "ok");
};

window.addEventListener("drop", (e) => {
  e.preventDefault();
  const ew = document.getElementById("editor-wrap");
  if (ew) ew.classList.remove("drag-over");


  const dt = e.dataTransfer;
  if (dt && dt.files && dt.files.length > 0 &&
      window.chrome && window.chrome.webview &&
      typeof window.chrome.webview.postMessageWithAdditionalObjects === "function") {
    try {
      window.chrome.webview.postMessageWithAdditionalObjects("FilesDropped", dt.files);
    } catch (_) {}
  }

  const files = dt && dt.files;
  if (!files || files.length === 0) return;

  function _readAndCreateTab(file, filename, lang, dir) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const code = evt.target.result || "";
      const cleanName = _stripExtension(filename, lang);
      createTab(cleanName, lang, code, dir ? dir : null);
      toast("Opened " + cleanName, "ok");
    };
    reader.onerror = () => {
      toast("Failed to read " + filename, "err");
    };
    reader.readAsText(file);
  }

  Array.from(files).forEach(file => {
    const filename = file.name || "untitled";
    const lang = _detectLangFromFilename(filename);
    const initialDir = (file.path || file._path || file.webkitRelativePath || "").replace(/[\\/][^\\/]+$/, "");

    setTimeout(() => {
      if (window.__lastNativeDropFilename === (filename.replace(/\.[^/.]+$/, "") || filename) || window.__lastNativeDropFilename === filename) {
        window.__lastNativeDropFilename = null;
        return;
      }

      if (window.pywebview && window.pywebview.api && window.pywebview.api.get_dropped_file_path) {
        window.pywebview.api.get_dropped_file_path(filename).then(fullPath => {
          if (fullPath && typeof fullPath === "string" && fullPath.trim() !== "") {
            if (window.pywebview.api.open_file_by_path) {
              window.pywebview.api.open_file_by_path(fullPath).then(res => {
                if (res && res.ok) {
                  const dir = fullPath.replace(/[\\/][^\\/]+$/, "");
                  const cleanName = _stripExtension(res.filename || filename, res.language || lang);
                  createTab(cleanName, res.language || lang, res.code, dir || "");
                  toast("Opened " + cleanName, "ok");
                } else {
                  const dir = fullPath.replace(/[\\/][^\\/]+$/, "");
                  _readAndCreateTab(file, filename, lang, dir);
                }
              }).catch(() => {
                const dir = fullPath.replace(/[\\/][^\\/]+$/, "");
                _readAndCreateTab(file, filename, lang, dir);
              });
            } else {
              const dir = fullPath.replace(/[\\/][^\\/]+$/, "");
              _readAndCreateTab(file, filename, lang, dir);
            }
          } else {
            _readAndCreateTab(file, filename, lang, initialDir);
          }
        }).catch(() => {
          _readAndCreateTab(file, filename, lang, initialDir);
        });
      } else {
        _readAndCreateTab(file, filename, lang, initialDir);
      }
    }, 120);
  });
}, true);