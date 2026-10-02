import html
import json
from pathlib import Path
from urllib.parse import quote

BASE_URL = "https://gamehubjogos.github.io"
registry = json.loads(Path("games.json").read_text(encoding="utf-8"))

games = []
seen = set()
for category in registry.get("categories", []):
    for game in category.get("games", []):
        raw_key = str(game.get("Link", "")).strip()
        # Keep this identical to asset-host.js: remove outer slashes and use the first path segment.
        key = raw_key.strip("/").split("/")[0]
        if key and key not in seen:
            seen.add(key)
            games.append(key)

lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url>',
    f'    <loc>{BASE_URL}/</loc>',
    '    <priority>1.0</priority>',
    '  </url>',
]
for key in games:
    # play.html loads play.js and reads the game key from the query string.
    url = f"{BASE_URL}/play.html?game={quote(key, safe='')}"
    lines.extend([
        '  <url>',
        f'    <loc>{html.escape(url, quote=False)}</loc>',
        '    <priority>0.8</priority>',
        '  </url>',
    ])
lines.append('</urlset>')
content = "\n".join(lines) + "\n"
# sitemap.xml is the canonical name submitted to search engines. Keep the
# historical filename as an alias so existing references continue to work.
for filename in ("sitemap.xml", "sitemap_github.xml"):
    Path(filename).write_text(content, encoding="utf-8")
print(f"Generated {len(games)} game URLs plus the homepage.")
print("First URL:", f"{BASE_URL}/play.html?game={quote(games[0], safe='')}")
print("Last URL:", f"{BASE_URL}/play.html?game={quote(games[-1], safe='')}")
