# Browser design prototype

A local, dependency-free prototype of Karina Kuslina's resume website. This is the reviewable design for stage 2; it has not been publicly deployed.

Open `index.html` directly in a browser, or serve this directory:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open http://127.0.0.1:8765/.

## Files

- `index.html`: semantic content, projects, navigation and contact links.
- `styles.css`: graphite/amber theme, responsive layout and interaction states.
- `prototype.js`: request animation, section reveals and reading progress.

No package installation, API keys, external requests, analytics or paid services are required. Project and contact links navigate to their respective destinations when clicked. The system diagram is illustrative and does not send real requests. Typography uses Inter when locally available, then Helvetica Neue or Arial.

## Motion

The request animation runs once when visible and can be replayed. It highlights the interface, API and data nodes in sequence over 1.8 seconds. Scroll reveals run once per section. `prefers-reduced-motion` disables decorative movement; content remains visible without JavaScript. Hover effects have keyboard focus equivalents.

## Review scope

Review the visual direction, content hierarchy, project descriptions, responsive layout and motion. Production packaging, final accessibility/performance checks, domain and hosting remain separate stages requiring approval.
