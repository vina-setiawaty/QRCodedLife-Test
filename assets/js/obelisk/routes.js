/* ==========================================================================
   routes.js — QR id -> URL slug maps for the two link-format prototypes.

   Only these 3 QR codes are active in both prototypes (the rest of the
   obelisk is disabled) so the two architectures stay directly comparable:
   one deep-links to a modal, the other navigates to a standalone page.
   ========================================================================== */

export const modalRoutes = {
  "face1-1": "modal-1",
  "face1-2": "modal-2",
  "face1-3": "modal-3",
};

export const pageRoutes = {
  "face1-1": "page-1",
  "face1-2": "page-2",
  "face1-3": "page-3",
};

export function invert(routes) {
  return Object.fromEntries(
    Object.entries(routes).map(([qrId, slug]) => [slug, qrId]),
  );
}
