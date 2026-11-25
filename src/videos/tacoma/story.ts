// Timeline of the Tacoma Narrows short: shots timed to the voice beats
// (~/workspace/tacoma-short/vo/timings.json — 8 beats, Jessica, 72.88 s total).
// Story physics: wind gallop (vertical bounce) growing from beat 3, torsional
// twist from beat 4, deck snap at SNAP, drop, then the rebuilt bridge.
// Camera grammar (from the bridge template): continuous slow push-ins; symmetric
// smootherstep glides 18-40 f; big reframes are cuts; impacts are 7-frame kicks
// that flip sign every frame; no hand-held float.
export const FPS = 30;
export const TOTAL = 2250; // 75.0 s: VO 72.88 s + 0.3 s gaps between the 8 beats
export const D0 = 6.0; // bank top + deck height (m)
export const HALF = 27; // towers at z = +-27, span 54 m
export const PARK: V3 = [70, D0, -75]; // swing pivot base (x, ground y, z)
export const TUNNEL: V3 = [52, D0, -58]; // wind-tunnel set (park lawn)
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
const lin = (pts: [number, number][], x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
};

// ---------------- story physics (t = video time in seconds) ----------------
// Beat starts (s): b1 0, b2 6.18, b3 16.33, b4 26.66, b5 43.29, b6 50.12, b7 63.14, b8 67.75.
export const SNAP = 37.48; // "patah." — beat 4, 10.82 s in
export const DROP0 = 38.0, DROP1 = 38.6;
export const DROP_H = 6.6;
/** 1940s cars on the deck: [start z, speed m/s, direction]. Maroon (i=1) is Tubby's car:
 *  frozen at z = -20 when the deck falls, so the dog sits beside it in shot 10. */
export const CARS = [
  { start: -18, speed: 2.0, dir: 1, color: "#3a7a4a" }, // green
  { start: -6.24, speed: 1.6, dir: -1, color: "#9a4040" }, // maroon — Tubby's
  { start: 5, speed: 2.4, dir: 1, color: "#4a5a8a" }, // navy
  { start: -8, speed: 1.8, dir: -1, color: "#3a3a3a" }, // dark grey
];
/** car story-time: frozen after the drop; shot 12 replays the gallop (beat 3) as a flashback */
export const carTau = (id: number, t: number) => (id === 12 ? t - 40.33 : id >= 9 && id <= 10 ? Math.min(t, DROP1) : t);
export const carZ = (i: number, id: number, t: number) => {
  const c = CARS[i], raw = c.start + c.dir * c.speed * carTau(id, t);
  return (((raw + 24) % 48) + 48) % 48 - 24; // wrap into [-24, 24]
};
/** vertical gallop amplitude (m): still until beat 3, grows through the snap */
export const gallopAmp = (t: number) =>
  lin([[16.33, 0], [20, 0.12], [26.66, 0.22], [30.5, 0.35], [SNAP, 0.5], [SNAP + 0.4, 0]], t);
/** torsional twist amplitude (rad): starts with "Lantai bajanya mulai berputar" (beat 4, 3.84 s in = 30.50 s);
 *  the real deck twisted ~30 deg before it broke, so the peak is large on purpose */
export const twistAmp = (t: number) =>
  lin([[30.5, 0], [33, 0.15], [35.5, 0.3], [SNAP, 0.5], [SNAP + 0.4, 0]], t);
const OSC = 0.55; // wind oscillation frequency (Hz) — slow, heavy, ~1.8 s per cycle
export const shapeZ = (z: number) => (Math.abs(z) < HALF ? Math.cos((Math.PI * z) / (2 * HALF)) : 0);
export const dropW = (z: number) => smooth((20 - z) / 26); // 1 on the near half, 0 at the far tower
export const dropU = (t: number) => (t < DROP0 ? 0 : Math.min(1, ((t - DROP0) / (DROP1 - DROP0)) ** 2));

export type BridgeState = { bounce: number; twist: number; drop: number; snap: number; collapsed: boolean };
/** deck height at (x, z): bounce + twist about the centreline + drop on the near half */
export const deckY = (x: number, z: number, b: BridgeState) =>
  D0 + b.bounce * shapeZ(z) - b.drop * DROP_H * dropW(z) + b.twist * shapeZ(z) * (x / 2.5);

// ---------------- shots ----------------
export type Light = "day" | "golden";
export type Crowd = "cars" | "drivers" | "fall" | "water" | "swing" | "tunnel" | "none";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd; towns?: boolean };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 70, light: "day", crowd: "cars" }, // hook wide: bridge in the wind
  { id: 2, a: 70, b: 176, light: "day", crowd: "drivers" }, // hook close: deck ripples, drivers
  { id: 3, a: 185, b: 330, light: "day", crowd: "cars", towns: true }, // setting aerial: town + bridge, 1940
  { id: 4, a: 330, b: 481, light: "day", crowd: "cars" }, // setting push: "terpanjang ketiga"
  { id: 5, a: 490, b: 640, light: "day", crowd: "cars" }, // galloping side: deck waves
  { id: 6, a: 640, b: 791, light: "day", crowd: "drivers" }, // galloping drivers: "Galloping Gertie"
  { id: 7, a: 800, b: 950, light: "day", crowd: "cars" }, // snap wide: wind hits, twist starts
  { id: 8, a: 950, b: 1130, light: "day", crowd: "cars" }, // snap twist: deck like a ribbon
  { id: 9, a: 1130, b: 1290, light: "day", crowd: "fall" }, // deck falls, splash
  { id: 10, a: 1299, b: 1495, light: "day", crowd: "water" }, // Tubby in the water
  { id: 11, a: 1504, b: 1700, light: "golden", crowd: "swing" }, // swing analogy (golden)
  { id: 12, a: 1700, b: 1885, light: "day", crowd: "cars" }, // wind pushes in rhythm
  { id: 13, a: 1894, b: 2024, light: "day", crowd: "tunnel" }, // wind tunnel: engineers + model
  { id: 14, a: 2033, b: 2250, light: "day", crowd: "cars", towns: true }, // callback: new bridge, calm
];
/** crossfades (frames) at place/time changes; a white 4-frame flash after the hook */
export const XFADE: Record<number, number> = { 3: 8, 11: 8, 13: 8, 14: 8 };
export const FLASH_AT = 176;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** layers to draw at frame f: base shot, plus the next shot fading in during a crossfade */
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

export const bridgeState = (id: number, t: number): BridgeState => {
  if (id === 14) return { bounce: 0, twist: 0, drop: 0, snap: 0, collapsed: false }; // rebuilt bridge: calm
  if (id === 9) return { bounce: 0, twist: 0, drop: dropU(t), snap: clamp01((t - SNAP) / 0.7), collapsed: t >= DROP1 };
  if (id === 10) return { bounce: 0, twist: 0, drop: 1, snap: 1, collapsed: true }; // wreck in the water
  if (id === 11) return { bounce: 0.3 * Math.sin(2 * Math.PI * 0.7 * (t - 50.12)), twist: 0, drop: 0, snap: 0, collapsed: false }; // gentle sway echo
  const bounce = -gallopAmp(t) * Math.cos(2 * Math.PI * OSC * t);
  const twist = twistAmp(t) * Math.sin(2 * Math.PI * OSC * t);
  if (id === 8) return { bounce, twist, drop: dropU(t), snap: clamp01((t - SNAP) / 0.7), collapsed: t >= DROP1 };
  return { bounce, twist, drop: 0, snap: 0, collapsed: false };
};

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
/** reference camera ease: symmetric smootherstep (attack = release, ~10 f each on a 23 f move) */
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const T = (f: number) => f / FPS;
/** push-in factor since f0: the subject grows ~rate per frame; `punch` raises it (with 8 f soft edges) for the first n frames */
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
/** dolly push: camera slides toward the look point by factor k */
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
/** zoom push (camera stays put): tan(fov/2) shrinks by k */
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });
/** a roll-only move on top of an existing framing */
const rolled = (s: (f: number) => Shot, roll: number) => (f: number): Shot => ({ ...s(f), roll });

// ---- framings (f -> camera); each pushes in from the frame its key starts ----
const S1a = (f: number) => dolly([20, 15, -58], [0, 7, 0], pushK(f, 0, 0.002), { fov: 44 });
const S2a = (f: number) => dolly([8, D0 + 2.5, -4], [0, D0 + 1.2, -12], pushK(f, 70, 0.0025), { fov: 40, roll: -0.03 });
const S2b = (f: number) => dolly([6, D0 + 2.2, -6], [0, D0 + 1.3, -12], pushK(f, 120, 0.002), { fov: 36, roll: 0.03 });
const S3a = (f: number) => zoom([17, 13, -52], [0, 9, 4], 44, pushK(f, 185, 0.002));
const S3b = (f: number) => zoom([10, 10.5, -42], [0, 8, 8], 42, pushK(f, 240, 0.002));
const S3c = (f: number) => zoom([5, 10, -31], [0, 8.6, 30], 40, pushK(f, 290, 0.0015, 0.006, 35));
const S4a = (f: number) => dolly([6, 11, -34], [0, 8, 20], pushK(f, 330, 0.002), { fov: 42 });
const S4b = (f: number) => dolly([3, 9, -26], [0, 8.6, 28], pushK(f, 400, 0.0015, 0.006, 35), { fov: 40 });
const S5a = (f: number) => dolly([20, D0 + 3, 7], [0, D0 + 1, 7], pushK(f, 490, 0.002), { fov: 42 });
const S5b = (f: number) => dolly([15, D0 + 2, 5.5], [0, D0 + 0.9, 5.5], pushK(f, 560, 0.0015, 0.006, 30), { fov: 38, roll: -0.035 });
const S6a = (f: number) => dolly([12, D0 + 3, -4], [0, D0 + 1.3, 5], pushK(f, 640, 0.0025), { fov: 38 });
const S6b = (f: number) => dolly([9, D0 + 2.5, -2], [0, D0 + 1.4, 6], pushK(f, 710, 0.002), { fov: 34, roll: 0.04 });
const S7a = (f: number) => zoom([-6, D0 + 2, -12], [0, D0 + 0.8, -2], 46, pushK(f, 800, 0.002), { roll: -0.03 });
const S7b = (f: number) => dolly([-8, D0 + 2.5, -6], [0, D0 + 1.5, 2], pushK(f, 870, 0.003), { fov: 40, roll: 0.02 });
const S8a = (f: number) => dolly([16, D0 + 2, -6], [0, D0 + 1, 0], pushK(f, 950, 0.0025), { fov: 40 });
const S8b = (f: number) => dolly([12, D0 + 2.5, -3], [0, D0 + 1.2, 2], pushK(f, 1030, 0.002, 0.006, 35), { fov: 36, roll: -0.04 });
const S9a = (f: number) => dolly([16, 12, -28], [0, 3.5, -8], pushK(f, 1130, 0.0025), { fov: 42 });
const S9b = (f: number) => dolly([8, 3, -28], [0, 1.5, -18], pushK(f, 1210, 0.002), { fov: 44, roll: -0.04 });
const S10a = (f: number) => dolly([5, 1.2, -24], [1.5, 0.4, -20.5], pushK(f, 1299, 0.0018), { fov: 40, roll: -0.03 });
const S10b = (f: number) => dolly([4, 1.0, -23.5], [1.5, 0.5, -20.5], pushK(f, 1400, 0.0018), { fov: 37, roll: 0.04 });
const S11a = (f: number) => dolly([PARK[0] + 0.55, D0 + 1.5, PARK[2] - 8], [PARK[0] + 0.55, D0 + 1.75, PARK[2]], pushK(f, 1504, 0.001), { fov: 40 });
const S11b = (f: number) => dolly([PARK[0] - 1.6, D0 + 1.9, PARK[2] - 9.5], [PARK[0] + 0.4, D0 + 1.95, PARK[2]], pushK(f, 1600, 0.0015), { fov: 42 });
const S12a = (f: number) => dolly([18, D0 + 3, 14], [0, D0 + 1, 2], pushK(f, 1700, 0.002), { fov: 42 });
const S12b = (f: number) => dolly([14, D0 + 2.5, 10], [0, D0 + 1.2, 2], pushK(f, 1790, 0.002), { fov: 38, roll: 0.03 });
const S13a = (f: number) => dolly([TUNNEL[0] + 7, D0 + 1.6, TUNNEL[2] + 1], [TUNNEL[0] - 1, D0 + 0.9, TUNNEL[2]], pushK(f, 1894, 0.002), { fov: 40 });
const S13b = (f: number) => dolly([TUNNEL[0] + 3.5, D0 + 1.3, TUNNEL[2] + 0.3], [TUNNEL[0] - 1.5, D0 + 1.0, TUNNEL[2]], pushK(f, 1960, 0.002), { fov: 36 });
const S14a = (f: number) => dolly([2.5, D0 + 3.5, -20], [0, D0 + 1.5, 0], pushK(f, 2033, 0.0025), { fov: 40 });
const S14b = (f: number) => dolly([1.5, D0 + 3, -18], [0, D0 + 1.5, 2], pushK(f, 2080, 0.0015, 0.006, 32), { fov: 38 });
/** crane out: a curved path (quadratic Bezier over the near chain, 1.2 m above it) */
const CRANE: V3[] = [[0, 18, -16], [17, 15, -44], [0, 7, 2]];
const S14c = (f: number): Shot => {
  const a = S14b(2140), s = glide((f - 2140) / 93), r = 1 - s, [C, B, L] = CRANE;
  return {
    pos: [0, 1, 2].map((i) => r * r * a.pos[i] + 2 * s * r * C[i] + s * s * B[i]) as V3,
    look: [0, 1, 2].map((i) => a.look[i] + (L[i] - a.look[i]) * s) as V3, fov: (a.fov ?? 40) + (44 - (a.fov ?? 40)) * s, roll: 0,
  };
};

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }],
  2: [
    { f: 70, s: S2a },
    { f: 120, dur: 32, s: S2b },
  ],
  3: [
    { f: 185, s: S3a },
    { f: 240, dur: 18, s: S3b },
    { f: 290, dur: 18, s: S3c },
  ],
  4: [
    { f: 330, s: S4a },
    { f: 400, dur: 18, s: S4b },
  ],
  5: [
    { f: 490, s: S5a },
    { f: 560, cut: true, s: S5b },
    { f: 560, dur: 20, s: rolled(S5b, -0.035) },
  ],
  6: [
    { f: 640, s: S6a },
    { f: 710, dur: 18, s: S6b },
  ],
  7: [
    { f: 800, s: S7a },
    { f: 870, cut: true, s: S7b },
  ],
  8: [
    { f: 950, s: S8a },
    { f: 1030, dur: 29, s: S8b },
  ],
  9: [
    { f: 1130, s: S9a },
    { f: 1210, cut: true, s: S9b },
  ],
  10: [
    { f: 1299, s: S10a },
    { f: 1400, dur: 18, s: S10b },
  ],
  11: [
    { f: 1504, s: S11a },
    { f: 1600, dur: 28, s: S11b },
  ],
  12: [
    { f: 1700, s: S12a },
    { f: 1790, dur: 20, s: S12b },
  ],
  13: [
    { f: 1894, s: S13a },
    { f: 1960, dur: 24, s: S13b },
  ],
  14: [
    { f: 2033, s: S14a },
    { f: 2080, dur: 30, s: S14b },
    { f: 2140, cut: true, s: S14c },
  ],
};

// impact kicks: the image offset flips sign every frame, decays to 0 in 7 f; they start on the first frame at/after the event.
const KICKS: [number, number][] = [[SNAP, 1], [DROP1, 1.6]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
/** frame at which the current key's move has finished (for picking billboard views per key, not per frame) */
export const keyEnd = (id: number, f: number) => {
  let e = 0;
  for (const k of CAMS[id]) if (f >= k.f) e = k.f + (k.cut ? 0 : k.dur ?? 24);
  return Math.max(f, e);
};

// ---------------- lens: depth of field + foreground framing ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 0 }, // hook wide: establishing, sharp
  { f: 70, cInf: 12 }, // deck close: drivers sharp, town soft
  { f: 185, cInf: 0 }, // town aerial
  { f: 490, cInf: 0 }, // galloping side
  { f: 640, cInf: 12 }, // drivers MS
  { f: 800, cInf: 0 }, // snap wide
  { f: 950, cInf: 10 }, // twist close
  { f: 1130, cInf: 0 }, // fall aerial + water
  { f: 1299, cInf: 14, focus: () => [1.5, 0.5, -20.5] }, // Tubby in the water
  { f: 1504, cInf: 7 }, // swing: mild, focus = look
  { f: 1700, cInf: 0 }, // wind push
  { f: 1894, cInf: 10 }, // wind tunnel: model sharp
  { f: 2033, cInf: 0 }, // callback: sharp, crane out
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
export const focusAt = (id: number, f: number): V3 => {
  const d = dofAt(f);
  return d.focus ? d.focus(f) : camAt(id, f).look;
};

/** near framing objects: visible while a <= f < b */
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [
  { a: 1504, b: 1700, kit: "plant_bushDetailed", pos: [69.65, D0, -79.4], s: 1.2, yaw: 0.4 },
];

// ---------------- subtitles (white bold, black outline, yellow keyword) ----------------
// Frames computed from vo/timings.json (8 beats, 0.3 s gaps). hl = keyword highlighted yellow.
export type Sub = { a: number; b: number; text: string; hl: string };
export const SUBS: Sub[] = [
  { a: 0, b: 70, text: "Sebuah jembatan baja raksasa roboh.", hl: "roboh" },
  { a: 70, b: 166, text: "Bukan karena ditabrak, bukan karena gempa. Cuma karena angin.", hl: "angin" },
  { a: 185, b: 299, text: "Tahun 1940, di Washington, Amerika.", hl: "1940" },
  { a: 299, b: 382, text: "Jembatan Tacoma Narrows baru saja dibuka.", hl: "Tacoma" },
  { a: 382, b: 469, text: "Jembatan gantung terpanjang ketiga di dunia waktu itu.", hl: "terpanjang" },
  { a: 490, b: 564, text: "Dari hari pertama, jembatan ini sudah aneh.", hl: "aneh" },
  { a: 564, b: 780, text: "Angin pelan saja bikin jalannya bergelombang naik-turun, sampai para supir menjulukinya Galloping Gertie, si Gertie yang melompat-lompat.", hl: "Galloping" },
  { a: 800, b: 915, text: "Tanggal 7 November 1940, angin kencang 64 kilometer per jam menghantam jembatan.", hl: "64" },
  { a: 915, b: 1017, text: "Lantai bajanya mulai berputar, meliuk seperti pita.", hl: "pita" },
  { a: 1017, b: 1125, text: "Lalu...", hl: "Lalu" },
  { a: 1125, b: 1158, text: "patah.", hl: "patah" },
  { a: 1158, b: 1275, text: "Sepotong demi sepotong jatuh ke laut.", hl: "laut" },
  { a: 1299, b: 1370, text: "Untungnya, tidak ada orang yang meninggal.", hl: "Untungnya" },
  { a: 1370, b: 1484, text: "Sayangnya, seekor anjing bernama Tubby tidak sempat diselamatkan.", hl: "Tubby" },
  { a: 1504, b: 1548, text: "Penyebabnya resonansi.", hl: "resonansi" },
  { a: 1548, b: 1608, text: "Sama seperti anak di ayunan.", hl: "ayunan" },
  { a: 1608, b: 1719, text: "Kalau dorongannya pas dengan ritme ayunan, ayunannya makin tinggi.", hl: "makin tinggi" },
  { a: 1719, b: 1875, text: "Angin mendorong jembatan tepat di ritmenya, makin lama makin besar, sampai bajanya tidak kuat.", hl: "ritmenya" },
  { a: 1894, b: 2013, text: "Sejak itu, semua jembatan gantung di dunia wajib diuji di terowongan angin.", hl: "terowongan" },
  { a: 2033, b: 2066, text: "Dan Gertie?", hl: "Gertie" },
  { a: 2066, b: 2157, text: "Jembatan penggantinya masih berdiri sampai hari ini.", hl: "berdiri" },
  { a: 2157, b: 2240, text: "Dengan lantai yang berlubang, supaya angin bisa lewat.", hl: "berlubang" },
];
export const subAt = (f: number): Sub | null => SUBS.find((s) => f >= s.a && f < s.b) ?? null;
