/* ==========================================================================
   qr-content.js — the 12 modal entries for Prototype 1.

   This is the file to edit when writing real exhibition copy.
   Keys map to the panels on the obelisk, top to bottom on each face:
     face{1..3}-{1..4}     (face 1/2/3, panel 1 = top … panel 4 = bottom)

   Each entry: { eyebrow, title, body, image }
     eyebrow — small label above the title
     title   — heading shown in the modal
     body    — string, or array of paragraph strings; basic HTML allowed
     image   — optional { src, alt }; src is resolved relative to the page
   ========================================================================== */

export const qrContent = {
  // ---- Face 1 — "More than a code" -------------------------------------
  "face1-1": {
    eyebrow: "Face 1 · Panel 1",
    title: "Scan, explore, connect",
    body: "A small square that links a physical object to a bigger world. Placeholder copy — replace with the exhibition text for this panel.",
    image: null,
  },
  "face1-2": {
    eyebrow: "Face 1 · Panel 2",
    title: "From information to impact",
    body: [
      "QR codes turn everyday objects into digital experiences.",
      "Placeholder copy. The body accepts an array of paragraphs when you need more than one.",
    ],
    image: null,
  },
  "face1-3": {
    eyebrow: "Face 1 · Panel 3",
    title: "People, places, ideas",
    body: "The same code can bridge people, places and ideas. Placeholder copy for this panel.",
    image: null,
  },
  "face1-4": {
    eyebrow: "Face 1 · Panel 4",
    title: "Same code, brighter tomorrows",
    body: "Placeholder copy for the fourth panel of face 1.",
    image: null,
  },

  // ---- Face 2 — "How it works" ---------------------------------------
  "face2-1": {
    eyebrow: "Face 2 · Panel 1",
    title: "One scan, many stories",
    body: "A QR code stores information in a pattern of black and white squares. Placeholder copy.",
    image: null,
  },
  "face2-2": {
    eyebrow: "Face 2 · Panel 2",
    title: "Decoded instantly",
    body: "When scanned, the pattern is decoded into a link, text, image or more — instantly. Placeholder copy.",
    image: null,
  },
  "face2-3": {
    eyebrow: "Face 2 · Panel 3",
    title: "Nature · heritage · community",
    body: "From menus to museums, products to parks. Placeholder copy for this panel.",
    image: null,
  },
  "face2-4": {
    eyebrow: "Face 2 · Panel 4",
    title: "In daily life",
    body: "QR codes make everyday moments more interactive and convenient. Placeholder copy.",
    image: null,
  },

  // ---- Face 3 — "A brighter tomorrow" ------------------------------
  "face3-1": {
    eyebrow: "Face 3 · Panel 1",
    title: "Education",
    body: "Placeholder copy for the first panel of face 3.",
    image: null,
  },
  "face3-2": {
    eyebrow: "Face 3 · Panel 2",
    title: "Sustainability",
    body: "Placeholder copy for the second panel of face 3.",
    image: null,
  },
  "face3-3": {
    eyebrow: "Face 3 · Panel 3",
    title: "Stronger communities",
    body: "Placeholder copy for the third panel of face 3.",
    image: null,
  },
  "face3-4": {
    eyebrow: "Face 3 · Panel 4",
    title: "Positive change",
    body: "New ways to share, connect and create positive change. Placeholder copy.",
    image: null,
  },
};
