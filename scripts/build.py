"""Build the public site without bundling design drafts or planning documents."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "design/prototype"
OUTPUT = ROOT / "dist"
FILES = ["index.html", "styles.css", "prototype.js", "assets/karina-portrait.png", "assets/logos/kk-03.svg"]

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links = set(), []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            assert attrs["id"] not in self.ids, "Duplicate HTML id"
            self.ids.add(attrs["id"])
        for key in ("src", "href"):
            if key in attrs:
                self.links.append(attrs[key])

page = Page()
page.feed((SOURCE / "index.html").read_text())
for link in page.links:
    url = urlsplit(link)
    if url.scheme or url.netloc:
        continue
    if url.path:
        assert url.path in FILES, f"Missing public asset: {url.path}"
    if url.fragment:
        assert url.fragment in page.ids, f"Broken section link: {link}"
for file in FILES:
    assert (SOURCE / file).is_file(), f"Missing file: {file}"
OUTPUT.mkdir(exist_ok=True)
for file in FILES:
    dest = OUTPUT / file
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SOURCE / file, dest)
assert sorted(str(p.relative_to(OUTPUT)) for p in OUTPUT.rglob("*") if p.is_file()) == sorted(FILES), "Unexpected public files"
print(f"Built {len(FILES)} files; local assets, section links and IDs verified.")
