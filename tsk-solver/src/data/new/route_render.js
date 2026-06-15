// Reference renderer for the Scarlet Keys planned course.
import logic from "./logic.json" assert { type: "json" };
const R = logic.routing, defK = R.curve.k, defSign = R.curve.sign;
const pos = id => logic.locations[id].position;            // {x,y} 0..1
const ekey = (a, b) => [a, b].sort().join("|");
const wrapOf = (a, b) => logic.wrapEdges.find(w =>
  (w.west === a && w.east === b) || (w.west === b && w.east === a));

// Direction-independent bezier samples for a normal edge, oriented a -> b.
function legPoints(a, b, n = R.curve.samplesHint) {
  const [c0, c1] = [a, b].sort();                          // canonical order
  const ov = R.edgeOverrides[ekey(a, b)] || {};
  const k = ov.k ?? defK, sign = ov.sign ?? defSign;
  const p0 = pos(c0), p1 = pos(c1);
  const dx = p1.x - p0.x, dy = p1.y - p0.y, len = Math.hypot(dx, dy) || 1e-6;
  const nx = -dy / len, ny = dx / len;
  const cx = (p0.x + p1.x) / 2 + nx * k * len * sign;
  const cy = (p0.y + p1.y) / 2 + ny * k * len * sign;
  let pts = [];
  for (let i = 0; i <= n; i++) { const t = i/n, m = 1-t;
    pts.push({ x: m*m*p0.x + 2*m*t*cx + t*t*p1.x, y: m*m*p0.y + 2*m*t*cy + t*t*p1.y }); }
  if (a !== c0) pts.reverse();                             // orient a -> b for arrows
  return pts;
}

// A wrap leg returns TWO upward-bowing curves (to/from the seam edges), oriented a -> b.
function wrapHalf(node, seam, n = 16) {
  const k = (logic.routing.wrap?.bowUpK ?? 0.30);
  const cx = (node.x + seam.x) / 2;
  const cy = (node.y + seam.y) / 2 - k * Math.abs(node.x - seam.x);   // bow upward
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = i/n, m = 1-t;
    pts.push({ x: m*m*node.x + 2*m*t*cx + t*t*seam.x, y: m*m*node.y + 2*m*t*cy + t*t*seam.y }); }
  return pts;
}
function wrapLegPoints(a, b) {
  const w = wrapOf(a, b);
  const westHalf = wrapHalf(pos(w.west), w.westSeam);   // west node -> left edge (x=0)
  const eastHalf = wrapHalf(pos(w.east), w.eastSeam).reverse(); // right edge -> east node
  return a === w.west ? [westHalf, eastHalf] : [eastHalf.slice().reverse(), westHalf.slice().reverse()];
}

// Returns drawable subpaths (each an array of {x,y}) for the whole course, in pixels.
function coursePolylines(route, mapW, mapH) {
  const out = [];
  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i], b = route[i + 1];
    const parts = wrapOf(a, b) ? wrapLegPoints(a, b) : [legPoints(a, b)];
    for (const part of parts) out.push(part.map(p => ({ x: p.x * mapW, y: p.y * mapH })));
  }
  return out;                                              // stroke each; arrowhead at end of each
}
export { legPoints, wrapLegPoints, coursePolylines, ekey };
