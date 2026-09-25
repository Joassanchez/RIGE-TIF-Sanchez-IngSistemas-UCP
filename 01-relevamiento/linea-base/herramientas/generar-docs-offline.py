#!/usr/bin/env python3
"""
Genera la documentación offline de OpenCode 1.18.25 en HTML estático.

Uso:
    python3 generar-docs-offline.py <carpeta_docs_del_tag> <carpeta_salida> <hash_commit>

<carpeta_docs_del_tag> es packages/web/src/content/docs del tag v1.18.25.
Toma las páginas .mdx en inglés del nivel raíz (sin subcarpetas de traducción),
elimina los componentes MDX sin alterar el texto, reescribe los enlaces internos
a archivos locales y genera un índice.

Requiere: pip install markdown
"""
import html
import re
import sys
from datetime import date
from pathlib import Path

import markdown

CONFIG_MJS = {  # valores de packages/web/config.mjs en producción
    "url": "https://opencode.ai",
    "console": "https://opencode.ai/auth",
    "email": "help@anoma.ly",
    "github": "https://github.com/anomalyco/opencode",
    "discord": "https://opencode.ai/discord",
}

ASIDE_TITLES = {"note": "Note", "tip": "Tip", "caution": "Caution", "info": "Info", "danger": "Danger"}

CSS = """
:root { --bg:#fff; --fg:#1f2328; --muted:#59636e; --line:#d1d9e0; --code:#f6f8fa; --accent:#0969da; }
@media (prefers-color-scheme: dark) {
  :root { --bg:#0d1117; --fg:#e6edf3; --muted:#9198a1; --line:#3d444d; --code:#151b23; --accent:#4493f8; }
}
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--fg);
       font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Ubuntu, sans-serif; }
.wrap { display:flex; min-height:100vh; }
nav { width:240px; flex:none; border-right:1px solid var(--line); padding:16px; font-size:14px;
      position:sticky; top:0; height:100vh; overflow-y:auto; }
nav a { display:block; padding:3px 6px; color:var(--fg); text-decoration:none; border-radius:4px; }
nav a:hover, nav a.actual { background:var(--code); }
nav .marca { font-weight:700; margin-bottom:12px; display:block; }
main { flex:1; max-width:860px; padding:24px 40px; min-width:0; }
a { color:var(--accent); }
pre { background:var(--code); padding:12px; overflow-x:auto; border-radius:6px; }
code { background:var(--code); padding:1px 4px; border-radius:4px; font-size:90%; }
pre code { background:none; padding:0; }
table { border-collapse:collapse; display:block; overflow-x:auto; }
th, td { border:1px solid var(--line); padding:6px 10px; text-align:left; }
.aside { border-left:4px solid var(--accent); background:var(--code); padding:8px 14px; margin:16px 0; border-radius:4px; }
.aside-t { font-weight:700; }
.tab-t { font-weight:700; margin-top:12px; }
.pie { color:var(--muted); font-size:13px; border-top:1px solid var(--line); margin-top:40px; padding-top:12px; }
"""


def split_frontmatter(text):
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip().strip('"')
    return meta, text[m.end():]


def clean_mdx(body):
    """Limpia MDX fuera de los bloques de código; el contenido de los bloques queda intacto."""
    out, in_code, fence = [], False, ""
    for line in body.splitlines():
        stripped = line.lstrip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            marker = stripped[:3]
            if not in_code:
                in_code, fence = True, marker
                # quitar atributos del fence (title="...", {1-3}); dejar sólo el lenguaje
                lang = stripped[3:].strip().split(" ")[0] if stripped[3:].strip() else ""
                lang = re.sub(r"[{}].*$", "", lang)
                indent = line[: len(line) - len(stripped)]
                out.append(f"{indent}{marker}{lang}")
                continue
            elif stripped.startswith(fence):
                in_code = False
                out.append(line)
                continue
        if in_code:
            out.append(line)
            continue
        # fuera de código
        if re.match(r"^import\s.+from\s", stripped):
            continue
        m = re.match(r"^:::(\w+)(?:\[(.*?)\])?\s*$", stripped)
        if m:
            kind = m.group(1)
            title = m.group(2) or ASIDE_TITLES.get(kind, kind.capitalize())
            out.append(f'<div class="aside" markdown="1"><div class="aside-t">{html.escape(title)}</div>\n')
            continue
        if stripped == ":::":
            out.append("\n</div>")
            continue
        m = re.match(r'^<TabItem\s+label="([^"]+)".*?>\s*$', stripped)
        if m:
            out.append(f'\n<div class="tab-t">{html.escape(m.group(1))}</div>\n')
            continue
        if re.match(r"^</?(Tabs|TabItem|Steps)\b[^>]*>\s*$", stripped):
            continue
        line = re.sub(r"\{config\.(\w+)\}", lambda mm: CONFIG_MJS.get(mm.group(1), mm.group(0)), line)
        out.append(line)
    return "\n".join(out)


def rewrite_links(text, pages):
    def repl(m):
        target, anchor = m.group(1), m.group(2) or ""
        target = target.strip("/")
        if target == "":
            return f"](index.html{anchor})"
        if target in pages:
            return f"]({target}.html{anchor})"
        return m.group(0)
    return re.sub(r"\]\((?:https://opencode\.ai)?/docs/?([a-z0-9\-/]*)(#[^)]*)?\)", repl, text)


def page_html(title, body_html, nav_html, commit):
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)} · OpenCode 1.18.25 (offline)</title>
<style>{CSS}</style></head>
<body><div class="wrap">
<nav>{nav_html}</nav>
<main><h1>{html.escape(title)}</h1>
{body_html}
<div class="pie">OpenCode 1.18.25 · offline documentation generated from tag v1.18.25 (commit {commit[:12]})</div>
</main></div></body></html>
"""


def main():
    src, dst, commit = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
    dst.mkdir(parents=True, exist_ok=True)
    files = sorted(p for p in src.glob("*.mdx"))
    pages = {p.stem for p in files}
    metas = {}
    for p in files:
        meta, _ = split_frontmatter(p.read_text(encoding="utf-8"))
        metas[p.stem] = meta.get("title", p.stem)

    order = ["index"] + sorted((s for s in pages if s != "index"), key=lambda s: metas[s].lower())

    def nav(current):
        links = ['<a class="marca" href="index.html">OpenCode 1.18.25 docs</a>']
        for s in order:
            cls = ' class="actual"' if s == current else ""
            label = "Introduction" if s == "index" else metas[s]
            links.append(f'<a{cls} href="{s}.html">{html.escape(label)}</a>')
        return "\n".join(links)

    for p in files:
        meta, body = split_frontmatter(p.read_text(encoding="utf-8"))
        body = rewrite_links(clean_mdx(body), pages)
        md = markdown.Markdown(extensions=["fenced_code", "tables", "toc", "md_in_html", "sane_lists"])
        body_html = md.convert(body)
        title = "Introduction" if p.stem == "index" else meta.get("title", p.stem)
        (dst / f"{p.stem}.html").write_text(page_html(title, body_html, nav(p.stem), commit), encoding="utf-8")

    (dst / "GENERACION.txt").write_text(
        f"Origen: tag v1.18.25 de anomalyco/opencode\n"
        f"Commit: {commit}\n"
        f"Carpeta: packages/web/src/content/docs (páginas .mdx del nivel raíz, en inglés)\n"
        f"Páginas: {len(files)}\n"
        f"Generado: {date.today().isoformat()}\n",
        encoding="utf-8",
    )
    print(f"{len(files)} páginas generadas en {dst}")


if __name__ == "__main__":
    main()
