# Archive record

- **Planned:** 2026-09-09 00:11 (+08:00)
- **Completed:** 2026-09-09 00:52 (+08:00)
- **Status:** Done — scaffold + Prototype 1 built and verified in a headless browser
  (desktop 1280×800 and mobile 390×844): obelisk renders, 12 QR squares pick correctly,
  each opens its own modal, no console/network errors, modal is a centred card on desktop
  and a bottom sheet on mobile.
- **Scope:** Site scaffold (multi-page static, GitHub Pages) + Prototype 1 (navigable 3D obelisk)

## What shipped vs. plan
- As planned. Notes:
  - Three.js r172 min build ships as **two** files (`three.module.min.js` +
    `three.core.min.js`); both are vendored plus `OrbitControls.js`.
  - Vertical FOV set to 35° (not 45°) to reduce keystone distortion on the tall model;
    default camera aims at a vertical edge so two faces read as 3D on load.
  - Inline SVG (QR-motif) favicon added to both pages.

---

# Iteration 2 — 2026-09-09 ~02:00 (+08:00) — poster stylisation

**Prompt:** match the exhibition poster; the base was the wrong way; each face should
have four vertically-stacked sections of randomised size with alternating QR alignment.

**Changes (obelisk.js + main.js + obelisk.css + qr-content.js):**
- Silhouette rebuilt: dark aubergine 3-sided **shaft** + **pointed pyramidion** on top +
  **square stepped plinth** at the bottom (was flat triangular caps — the "wrong way").
  The plinth steps are `BoxGeometry` (square), not triangular prisms — a triangular
  plinth read as a downward spike from most angles.
- Each face is now **4 panels stacked vertically**, seeded-random heights, each a rounded
  colour card (poster palette: pink / cyan / yellow / violet / teal) with a white QR chip
  whose horizontal alignment **alternates left / right** down the face. Whole panel is the
  click target. QR style alternates framed (scan brackets) / dense.
- Modal keys changed to `face{1..3}-{1..4}` (panel 1 = top). `qr-content.js` rewritten
  with 12 themed placeholder entries + `eyebrow` field.
- Scene background → warm cream; HUD pinned to a light palette regardless of system theme;
  mobile hint repositioned to bottom-left so it clears the control stack.
- Verified headless (desktop + mobile): 12 panels pick correctly, distinct modals, no
  console/network errors.

---

# Plan — QRCodedLife web: site scaffold + Prototype 1 (3D obelisk)

## Context

`QRCodedLife-web/` is an empty folder. It will become the digital companion site for a
physical exhibition series about QR codes. Each exhibition prototype is its own standalone,
responsive page; a small landing page links them together. The site will be hosted on
**GitHub Pages** as a project site (`https://<user>.github.io/QRCodedLife-web/`).

This plan covers (a) the minimal multi-page static scaffold and (b) the first prototype:
a navigable 3D model of the triangular obelisk that will host the exhibition, with 4
clickable QR squares per face (12 total), each opening its own modal.

Decisions made with the user:
- 3D built with **Three.js + OrbitControls** (vendored, pinned — the only dependency).
- Hosting: **GitHub Pages**, so all paths are relative and a `.nojekyll` file is included.
- No bundler / no build step. Plain ES modules + an import map.

## Folder structure

```
QRCodedLife-web/
├── index.html                     landing page — cards linking to each prototype
├── .nojekyll                      let Pages serve /assets/** verbatim
├── .gitignore
├── README.md                      local dev + deploy steps
├── archives/                      dated records of what was planned and done
├── prototypes/
│   └── obelisk/
│       └── index.html             Prototype 1 page (canvas + overlay UI + <dialog>)
└── assets/
    ├── css/
    │   ├── base.css               reset, design tokens, shared layout, modal styles
    │   └── obelisk.css            prototype-1 specifics (canvas, HUD, hint)
    ├── js/
    │   └── obelisk/
    │       ├── main.js            renderer/scene/camera/controls bootstrap + loop
    │       ├── obelisk.js         builds the prism + places the 12 QR squares
    │       ├── qr-content.js      the 12 modal entries — the file content editors touch
    │       └── modal.js           <dialog> open/close + content injection + raycast wiring
    └── vendor/
        └── three/
            ├── three.module.min.js       pinned release
            └── OrbitControls.js          matching examples/jsm build
```

Import map in each prototype HTML:

```html
<script type="importmap">
{ "imports": {
    "three": "../../assets/vendor/three/three.module.min.js",
    "three/addons/controls/OrbitControls.js": "../../assets/vendor/three/OrbitControls.js"
} }
</script>
```

## Prototype 1 — the 3D obelisk

### Geometry (world units = metres)
- Equilateral triangular prism: side **0.60 m**, height **2.00 m**.
- Built as **3 face groups** (not a cylinder) so QR placement is a per-face 2D problem:
  - Circumradius `R = 0.60 / √3 ≈ 0.3464`; apothem `a = 0.60 / (2√3) ≈ 0.1732`.
  - Each face = `PlaneGeometry(0.60, 2.00)`, pushed out by `a` along its normal, rotated
    `0° / 120° / 240°` about Y, parented to a root `Group`.
  - Triangular top/bottom caps via `Shape` → `ShapeGeometry`.
  - Optional tapered pyramidion cap, flagged off by default.
- Model centred on origin, on a subtle contact-shadow ground plane.

### QR squares (12)
- Per face: a **2 × 2 grid**, size ≈ **0.14 m**, inset from edges, +0.002 m along normal.
- `Mesh(PlaneGeometry, MeshBasicMaterial)` with `userData.qrId` (`face1-tl`, …), texture is
  a procedurally drawn QR-like pattern on an offscreen canvas with a quiet-zone border.
- Held in a flat `qrMeshes[]` for the raycaster.

### Interaction
- **OrbitControls**: `enableDamping`, `enablePan = false`, clamped zoom + polar angle. Slow
  `autoRotate` when idle; off under `prefers-reduced-motion` and while a modal is open.
- **Click vs drag**: pointerdown records pos/time; pointerup with < ~6 px movement raycasts
  `qrMeshes`; hit → open that QR's modal.
- **Hover** (fine pointer): `cursor: pointer` + emissive highlight on hovered square.
- **Render on demand**: render on controls `change`, during damping/auto-rotate, on resize.

### Modal
- One reused native `<dialog>`; `modal.js` injects `title`/`body`/optional `image` from
  `qr-content.js` keyed by `qrId`. Esc / backdrop / close button all dismiss.
- Responsive: centred card ≤ 32rem desktop; full-width bottom sheet ≤ 640px.
- `qr-content.js` exports `qrContent = { "face1-tl": { title, body, image }, … }` (12 entries,
  placeholder text for the prototype).

### Overlay UI
- Top-left: "← All prototypes" back link + prototype title.
- Bottom: one-line hint, auto-hides after first interaction.
- Buttons: Reset view, zoom + / −.

### Responsiveness / perf
- Canvas fills `100svh`/`100vw`; resize handler; `pixelRatio` capped at 2.
- `antialias: true`, `HemisphereLight` + one `DirectionalLight`.
- Camera framed so the whole obelisk fits a narrow phone viewport at load.
- Payload ≈ Three.js (~150 KB gzip) + a few KB app code; system fonts only.

## Landing page
- Title, intro paragraph, responsive card grid (one card now, room for prototype 2).
  Shares `base.css`, no JS.

## Local dev & deploy (README.md)
- Import maps need a server: `npx serve` or `python -m http.server 8000`. No `npm install`.
- Vendor step done during implementation: pinned `three.module.min.js` +
  `examples/jsm/controls/OrbitControls.js` into `assets/vendor/three/`.
- Deploy: `git init` → commit → push → Settings ▸ Pages ▸ `main` / root. `.nojekyll` included.

## Implementation order
1. Scaffold: folders, `.nojekyll`, `.gitignore`, `base.css`, landing `index.html`, `README.md`, `archives/`.
2. Vendor Three.js + OrbitControls (pinned release).
3. `prototypes/obelisk/index.html` + `obelisk.css` + overlay UI + empty `<dialog>`.
4. `main.js`: renderer/scene/camera/lights/controls/resize/on-demand render.
5. `obelisk.js`: prism geometry, caps, 12 QR squares with ids + procedural texture.
6. `modal.js` + `qr-content.js`: raycast, click-vs-drag, modal open/close, 12 placeholders.
7. Polish: hover highlight, reset/zoom buttons, hint auto-hide, reduced-motion, mobile QA.
8. `git init` + first commit (with user's go-ahead).

## Verification
- `npx serve`, load landing → card opens the obelisk page.
- Desktop: drag orbits w/ damping; scroll zoom within clamps; no going under floor;
  auto-rotate resumes idle; hover shows pointer + highlight; each of 12 opens its own modal;
  Esc/backdrop/close dismiss; a short drag ending on a QR does NOT open a modal.
- Mobile ~375px: whole obelisk visible at load; one-finger rotate, pinch zoom; modal is a
  bottom sheet; back link returns to landing.
- Throttled CPU: no repaint when idle.
- `prefers-reduced-motion`: no auto-rotate.
- Serve from a `/QRCodedLife-web/` subpath to confirm relative paths + import map resolve.
