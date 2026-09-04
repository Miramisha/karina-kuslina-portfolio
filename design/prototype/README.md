# Portfolio source

Source of the published portfolio: https://karina-kuslina.pages.dev/ .

Run from the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory design/prototype
```

- `index.html`: content, navigation and contact links.
- `styles.css`: responsive graphite and amber theme.
- `prototype.js`: scroll reveals, portrait motion, Canvas trails and request-flow demonstration.
- `assets/`: portrait and monogram variants; the live site uses `kk-03.svg`.
- `logo-options.html`: design comparison excluded from the public build.

Build with `python3 scripts/build.py`. No npm packages are required. Content remains in HTML; animation is progressive enhancement. Scroll reveals repeat on re-entry. Decorative motion respects the reduced-motion preference.
