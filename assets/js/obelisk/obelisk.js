/* ==========================================================================
   obelisk.js — builds the triangular obelisk in the style of the exhibition
   poster: a dark 3-sided shaft on a stepped plinth, capped by a pyramidion.

   Each of the 3 shaft faces carries FOUR panels stacked vertically, each a
   randomised (seeded) height, each a rounded colour card with a QR code whose
   alignment alternates left / right down the face. Every panel is a click
   target -> its own modal.

   buildObelisk() -> {
     group,      THREE.Group   (add to the scene; centred on the origin)
     qrTargets,  Array<Mesh>   (raycaster targets — the 12 panels)
     height,     number        (full silhouette height in metres, for framing)
   }

   World units are metres.
   ========================================================================== */

import * as THREE from "three";

/* ---- silhouette dimensions (metres) --------------------------------- */
const SIDE = 0.6; // shaft triangle edge
const SHAFT_H = 2.0; // shaft height
const PYRAMIDION_H = 0.3; // pointed cap
const STEP1_H = 0.1; // upper base step
const STEP2_H = 0.09; // lower base step (widest)

const R = SIDE / Math.sqrt(3); // shaft circumradius
const APOTHEM = R / 2; // shaft centre -> face
const STEP1_W = SIDE * 1.35; // upper plinth step (square)
const STEP2_W = SIDE * 1.7; // lower plinth step (square, widest)

const ALIGN_ROT = Math.PI / 3; // rotate the shaft/cap so a face points +Z

// local y layout, base sitting at y = 0
const Y_STEP2 = STEP2_H / 2;
const Y_STEP1 = STEP2_H + STEP1_H / 2;
const Y_SHAFT = STEP2_H + STEP1_H + SHAFT_H / 2;
const Y_PYRAMIDION = STEP2_H + STEP1_H + SHAFT_H + PYRAMIDION_H / 2;
const TOTAL_H = STEP2_H + STEP1_H + SHAFT_H + PYRAMIDION_H;

/* ---- panel layout ---------------------------------------------------- */
const PANELS_PER_FACE = 4;
const FACE_MARGIN_Y = 0.06;
const FACE_MARGIN_X = 0.055;
const PANEL_GAP = 0.022;
const PANEL_W = SIDE - FACE_MARGIN_X * 2;
const CARD_RADIUS = 0.028;

// poster-ish palette: pink / cyan / yellow / violet / teal
const PALETTE = [0xff8fb1, 0x33c9ef, 0xffd23f, 0x9b5de5, 0x2ec4b6];
const BODY_COLOR = 0x241a30; // dark aubergine shaft + caps

/* ---- seeded RNG ----------------------------------------------------- */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---- QR-ish texture (transparent bg, dark modules + scan brackets) --- */
function makeQrTexture(seed, framed) {
  const modules = 21;
  const quiet = 2;
  const cells = modules + quiet * 2;
  const scale = 12;
  const px = cells * scale;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = px;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1b1420";

  const rand = mulberry32(seed);
  const dark = (c, r) =>
    ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);

  const finder = (ox, oy) => {
    for (let i = 0; i < 7; i++)
      for (let j = 0; j < 7; j++) {
        const edge = i === 0 || i === 6 || j === 0 || j === 6;
        const core = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        if (edge || core) dark(ox + i, oy + j);
      }
  };
  finder(0, 0);
  finder(modules - 7, 0);
  finder(0, modules - 7);

  const density = framed ? 0.32 : 0.5;
  for (let i = 0; i < modules; i++)
    for (let j = 0; j < modules; j++) {
      const inFinder =
        (i < 8 && j < 8) ||
        (i > modules - 9 && j < 8) ||
        (i < 8 && j > modules - 9);
      if (inFinder) continue;
      if (i === 6 || j === 6) {
        if ((i + j) % 2 === 0) dark(i, j);
      } else if (rand() > 1 - density) {
        dark(i, j);
      }
    }

  if (framed) {
    // corner scan brackets just outside the module grid
    const t = scale * 1.4;
    const len = scale * 6;
    const lo = scale * 0.4;
    const hi = px - scale * 0.4;
    const L = (x, y, fx, fy) => {
      ctx.fillRect(x, y, fx > 0 ? len : t, fx > 0 ? t : len);
      ctx.fillRect(x, y, fy > 0 ? t : len, fy > 0 ? len : t);
    };
    ctx.fillRect(lo, lo, len, t);
    ctx.fillRect(lo, lo, t, len);
    ctx.fillRect(hi - len, lo, len, t);
    ctx.fillRect(hi - t, lo, t, len);
    ctx.fillRect(lo, hi - t, len, t);
    ctx.fillRect(lo, hi - len, t, len);
    ctx.fillRect(hi - len, hi - t, len, t);
    ctx.fillRect(hi - t, hi - len, t, len);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* ---- rounded-rectangle shape --------------------------------------- */
function roundedRectShape(w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/* ---- one panel (rounded card + QR) -------------------------------- */
function makePanel(qrId, w, h, color, alignRight, seed, framed) {
  const panel = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRectShape(w, h, CARD_RADIUS)),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.55,
      metalness: 0.0,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0,
    }),
  );

  const qrDim = Math.min(h * 0.6, w * 0.42, 0.16);
  const chip = qrDim * 1.22;

  const backing = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRectShape(chip, chip, chip * 0.16)),
    new THREE.MeshBasicMaterial({ color: 0xfdfbf5 }),
  );
  backing.position.z = 0.001;

  const qr = new THREE.Mesh(
    new THREE.PlaneGeometry(qrDim, qrDim),
    new THREE.MeshBasicMaterial({
      map: makeQrTexture(seed, framed),
      transparent: true,
    }),
  );
  qr.position.z = 0.002;

  const chipGroup = new THREE.Group();
  chipGroup.add(backing, qr);
  const inset = w / 2 - chip / 2 - 0.028;
  chipGroup.position.set(alignRight ? inset : -inset, 0, 0.003);
  panel.add(chipGroup);

  panel.userData = { qrId, color: new THREE.Color(color) };
  qr.userData.panel = panel;
  return panel;
}

/* ---- one shaft face (4 stacked panels) --------------------------- */
function makeFace(faceIndex, qrTargets) {
  const group = new THREE.Group();
  const angle = (faceIndex * 2 * Math.PI) / 3;
  group.rotation.y = angle;
  group.position.set(Math.sin(angle) * APOTHEM, 0, Math.cos(angle) * APOTHEM);

  const rand = mulberry32((faceIndex + 1) * 9871 + 13);

  // randomised panel heights that fill the usable face height
  const usable = SHAFT_H - FACE_MARGIN_Y * 2 - PANEL_GAP * (PANELS_PER_FACE - 1);
  const weights = Array.from({ length: PANELS_PER_FACE }, () => 0.6 + rand() * 1.1);
  const wsum = weights.reduce((a, b) => a + b, 0);
  const heights = weights.map((wt) => (wt / wsum) * usable);

  let cursor = SHAFT_H / 2 - FACE_MARGIN_Y; // top edge of the usable band
  heights.forEach((ph, i) => {
    const centerY = cursor - ph / 2;
    cursor -= ph + PANEL_GAP;

    const qrId = `face${faceIndex + 1}-${i + 1}`;
    const color = PALETTE[(faceIndex * 2 + i) % PALETTE.length];
    const seed = (faceIndex + 1) * 1000 + i * 37 + 5;
    const panel = makePanel(
      qrId,
      PANEL_W,
      ph,
      color,
      i % 2 === 1, // alternate QR alignment down the face
      seed,
      i % 2 === 0, // alternate framed / dense QR style
    );
    panel.position.set(0, centerY, 0.006);
    group.add(panel);
    qrTargets.push(panel);
  });

  return group;
}

/* ---- triangular prism (shaft) / pyramidion ------------------------- */
function triPrism(radiusTop, radiusBottom, height, material) {
  const geo = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    3,
    1,
    false,
  );
  const mesh = new THREE.Mesh(geo, material);
  mesh.rotation.y = ALIGN_ROT;
  return mesh;
}

/* ---- contact shadow --------------------------------------------- */
function makeContactShadow(y) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, "rgba(35,20,45,0.28)");
  g.addColorStop(0.55, "rgba(35,20,45,0.12)");
  g.addColorStop(1, "rgba(35,20,45,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(STEP2_W * 1.7, 48),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      depthWrite: false,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y + 0.001;
  mesh.renderOrder = -1;
  mesh.userData.ignoreRaycast = true;
  return mesh;
}

/* ---- public builder --------------------------------------------- */
export function buildObelisk() {
  const group = new THREE.Group();
  const qrTargets = [];

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: BODY_COLOR,
    roughness: 0.72,
    metalness: 0.04,
  });

  // stepped square plinth (wider than the triangular shaft)
  const step2 = new THREE.Mesh(
    new THREE.BoxGeometry(STEP2_W, STEP2_H, STEP2_W),
    bodyMaterial,
  );
  step2.position.y = Y_STEP2;
  const step1 = new THREE.Mesh(
    new THREE.BoxGeometry(STEP1_W, STEP1_H, STEP1_W),
    bodyMaterial,
  );
  step1.position.y = Y_STEP1;

  // triangular shaft
  const shaft = triPrism(R, R, SHAFT_H, bodyMaterial);
  shaft.position.y = Y_SHAFT;

  // pyramidion (3-sided pointed cap)
  const cap = triPrism(0.0001, R, PYRAMIDION_H, bodyMaterial);
  cap.position.y = Y_PYRAMIDION;

  group.add(step2, step1, shaft, cap);
  group.add(makeContactShadow(0));

  // faces live on the shaft; parent them to a group at the shaft centre
  const shaftFaces = new THREE.Group();
  shaftFaces.position.y = Y_SHAFT;
  for (let f = 0; f < 3; f++) shaftFaces.add(makeFace(f, qrTargets));
  group.add(shaftFaces);

  // centre the whole silhouette on the origin
  group.position.y = -(TOTAL_H / 2);

  return { group, qrTargets, height: TOTAL_H };
}

/* ---- hover feedback ------------------------------------------------- */
export function setPanelHover(panel, hovered) {
  if (!panel || !panel.material) return;
  panel.material.emissiveIntensity = hovered ? 0.4 : 0;
  panel.scale.setScalar(hovered ? 1.03 : 1);
}
