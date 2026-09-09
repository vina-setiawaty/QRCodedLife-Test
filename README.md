# QRCodedLife — web

Digital companion pieces for the QRCodedLife exhibition series about QR codes.
Static site, no build step. Each prototype is its own page under `prototypes/`.

## Structure

```
index.html                 landing page (links to each prototype)
prototypes/obelisk/         Prototype 1 — navigable 3D obelisk
assets/css/                 base.css (shared) + per-prototype styles
assets/js/obelisk/          prototype 1 scripts
  qr-content.js               <- edit this to write the 12 QR modal texts
assets/vendor/three/        pinned Three.js r172 + OrbitControls (only dependency)
archives/                   dated records of what was planned / done
```

## Run locally

ES-module import maps need a real server (not `file://`). Pick one:

```bash
npx serve .
# or
python -m http.server 8000
```

Then open the printed URL and click through to a prototype. No `npm install`.

## Prototype 1 — The Obelisk

- Triangular prism, 0.60 m equilateral base, 2.00 m tall, centred on the origin.
- 3 faces × a 2×2 grid of QR squares = 12, ids `face{1..3}-{tl|tr|bl|br}`.
- Drag / one-finger to orbit, scroll / pinch or the on-screen buttons to zoom,
  tap a QR square to open its modal. Auto-rotates when idle (off under
  `prefers-reduced-motion`).
- All modal copy lives in [`assets/js/obelisk/qr-content.js`](assets/js/obelisk/qr-content.js).

## Deploy (GitHub Pages)

```bash
git init && git add . && git commit -m "Initial site + obelisk prototype"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Then **Settings ▸ Pages ▸ Build and deployment ▸ Deploy from a branch**, branch
`main`, folder `/ (root)`. The `.nojekyll` file makes Pages serve `assets/**`
untouched. The site works from a project sub-path — all links are relative.

## Updating Three.js

Replace the two files in `assets/vendor/three/` with a matching pair from the
same release:

```bash
V=0.172.0
curl -sSL -o assets/vendor/three/three.module.min.js \
  https://cdn.jsdelivr.net/npm/three@$V/build/three.module.min.js
curl -sSL -o assets/vendor/three/OrbitControls.js \
  https://cdn.jsdelivr.net/npm/three@$V/examples/jsm/controls/OrbitControls.js
```
