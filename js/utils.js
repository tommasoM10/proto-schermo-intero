export function iou(a, b) {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const ua = a.w * a.h + b.w * b.h - inter;
  return ua > 0 ? inter / ua : 0;
}
export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
export function now() { return performance.now() / 1000; }
export function rgba(r,g,b,a){ function hx(c){return Math.round(Math.max(0,Math.min(255,c))).toString(16).padStart(2,'0');}
  return `#${hx(r)}${hx(g)}${hx(b)}${hx(a*255)}`; }
