import type { ReactNode } from "react";
import { C, f1, rng } from "./art";
import { jointProps, type Rig } from "./rig";

// The three women of the harvest, drawn in code as a storybook illustration (soft profiles, cotton sarees with
// woven borders, glass bangles, flowers in the hair), each in her own small SVG placed in scene coordinates.
//   W1 reaches up to a branch, picks, and drops the cherries into the basket she holds at her waist.
//   W2 picks at waist height and drops them into a cane tub on her hip.
//   W3 kneels with a tub on her lap and moves handfuls into the big bamboo basket on the ground.
// Arms are joint chains (shoulder → elbow → hand) the rig turns; POSES are the angles used by HarvestHero.

export const POSES = {
  w1: { reach: { up: 150, fore: 15, hand: -8, head: 14 }, drop: { up: 12, fore: 47, hand: 12, head: -6 } },
  w2: { reach: { up: 45, fore: 50, hand: -14, head: -6 }, drop: { up: 15, fore: 39, hand: 16, head: -16 } },
  w3: { scoop: { up: -35, fore: 92, hand: -18, head: -24 }, drop: { up: 45, fore: 27, hand: 14, head: -12 } },
};

export const PLACE = {
  w1: { x: 1150, y: 905, s: 1 },
  w2: { x: 1365, y: 905, s: 0.95 },
  w3: { x: 1610, y: 918, s: 1.02 },
};

type Look = {
  skin: string;
  skinLine: string;
  saree: string;
  sareeShade: string;
  border: string;
  blouse: string;
  flower: string;
  pattern: "hv-check" | "hv-buti";
};

export const LOOKS: Record<"w1" | "w2" | "w3", Look> = {
  w1: { skin: "#8a5a3c", skinLine: "#5e3a25", saree: "#c99a2e", sareeShade: "#a37a1f", border: "#9b3a2c", blouse: "#a8492c", flower: "#e2873a", pattern: "hv-check" },
  w2: { skin: "#9a6744", skinLine: "#68412a", saree: "#3f4f7e", sareeShade: "#2d3a60", border: "#b0552e", blouse: "#c99a2e", flower: "#f3ead6", pattern: "hv-buti" },
  w3: { skin: "#7a4c33", skinLine: "#4f2f1f", saree: "#9b3a2c", sareeShade: "#7a2c22", border: "#c99a2e", blouse: "#3f4f7e", flower: "#e2873a", pattern: "hv-check" },
};

// ---------- small parts ----------

function Limb({ len, w, color, line }: { len: number; w: number; color: string; line: string }) {
  return (
    <>
      <path d={`M0 0L0 ${len}`} stroke={line} strokeWidth={w + 2.4} strokeLinecap="round" />
      <path d={`M0 0L0 ${len}`} stroke={color} strokeWidth={w} strokeLinecap="round" />
    </>
  );
}

function Bangles({ y }: { y: number }) {
  return (
    <g fill="none" strokeWidth="1.6" strokeLinecap="round">
      <path d={`M-5.6 ${y}Q0 ${y + 2.4} 5.6 ${y}`} stroke="#b8302c" />
      <path d={`M-5.4 ${y + 2.6}Q0 ${y + 5} 5.4 ${y + 2.6}`} stroke="#2f7a4a" />
      <path d={`M-5.2 ${y + 5.2}Q0 ${y + 7.6} 5.2 ${y + 5.2}`} stroke={C.gold} />
    </g>
  );
}

/** A hand at the wrist, pointing down (+y), thumb towards the front (left). `children`: what it holds. */
function Hand({ skin, line, children }: { skin: string; line: string; children?: ReactNode }) {
  return (
    <g>
      <path d="M-5.5 -1C-6.8 5-6.6 11-4.6 15.5C-2.6 18.8 2.8 18.8 4.8 15.4C6.6 11 6.6 5 5.5 -1Z" fill={skin} stroke={line} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M-5 3.5C-9.6 5.4-10.6 9.6-8 12C-6.2 11.2-5 9.2-4.2 7.2Z" fill={skin} stroke={line} strokeWidth="1" strokeLinejoin="round" />
      <path d="M-2 14.5L-1.6 17.5M1.4 14.8L1.8 17.6" stroke={line} strokeWidth="0.8" strokeLinecap="round" />
      {children}
    </g>
  );
}

/** Ripe cherries held in a hand (hidden until a pick; the rig/timeline shows them). */
function Handful({ cls }: { cls: string }) {
  return (
    <g className={cls} opacity="0">
      {[
        [-2.5, 15, C.red],
        [2.6, 16.5, C.burgundy],
        [0, 19.5, C.ripe],
      ].map(([x, y, c], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4.2" fill={c as string} stroke={C.cherryLine} strokeWidth="0.7" />
          <circle cx={(x as number) - 1.4} cy={(y as number) - 1.5} r="1.2" fill="#fff2df" opacity="0.55" />
        </g>
      ))}
    </g>
  );
}

/** Head in profile facing left, origin at the top of the neck. */
function Head({ look, children }: { look: Look; children?: ReactNode }) {
  return (
    <g>
      <path d="M-8 8L-9 -6L5 -6L6 9Z" fill={look.skin} stroke={look.skinLine} strokeWidth="1" />
      {/* bun with a string of flowers */}
      <circle cx="21" cy="-31" r="10.5" fill={C.hair} />
      {[...Array(7)].map((_, i) => {
        const a = (-40 + i * 26) * (Math.PI / 180);
        return <circle key={i} cx={f1(21 + Math.cos(a) * 11.5)} cy={f1(-31 + Math.sin(a) * 11.5)} r="2.4" fill={look.flower} stroke="#8a5a2a" strokeWidth="0.5" />;
      })}
      <path
        d="M4 -2C14 -8 22 -24 18 -38C14 -50 -2 -56 -14 -50C-22 -46 -24 -38 -24 -33C-25 -29 -28 -26 -31 -21C-29 -19.5 -27 -19.5 -26.5 -18.5C-27.5 -16.5 -26.5 -15 -25.5 -14.5C-27 -13 -26.5 -10 -24 -8C-21 -3 -12 -1 -4 -3Z"
        fill={look.skin}
        stroke={look.skinLine}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <ellipse cx="-17" cy="-19.5" rx="4.2" ry="2.6" fill="#c2664c" opacity="0.28" />
      <path d="M-24 -38C-22 -50 -6 -58 8 -54C22 -50 26 -34 20 -18C17 -10 12 -6 6 -5C9 -16 6 -26 0 -30C-6 -34 -14 -37 -24 -38Z" fill={C.hair} />
      <path d="M-6 -50C2 -53 12 -50 17 -42" fill="none" stroke="#4a3328" strokeWidth="1" opacity="0.7" />
      <path d="M1 -26C-2 -26 -3 -21 -1 -19" fill="none" stroke={look.skinLine} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="-0.6" cy="-15.5" r="1.7" fill={C.gold} />
      <path d="M-20.5 -31Q-17.5 -32.8 -14.2 -31.2" fill="none" stroke="#24150f" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M-21.5 -36.4Q-17.5 -38.8 -13.4 -37" fill="none" stroke="#24150f" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
      <path d="M-25.4 -15.3Q-23.4 -13.6 -21 -14.6" fill="none" stroke="#5a2a20" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="-22.4" cy="-41.6" r="1.4" fill="#a3262a" />
      <circle cx="-29.6" cy="-22.6" r="0.9" fill={C.gold} />
      {children}
    </g>
  );
}

// ---------- baskets ----------

function heap(seed: number, w: number, n: number, rimY: number, r: number) {
  const g = rng(seed);
  const tones = [C.red, C.burgundy, C.ripe, C.red, C.turning];
  return Array.from({ length: n }, (_, i) => {
    const a = g() * Math.PI * 2;
    const d = Math.sqrt(g());
    return { x: Math.cos(a) * d * w * 0.38, y: rimY - 2 + Math.sin(a) * d * w * 0.07 - (1 - d) * r * 1.2, r: r * (0.88 + g() * 0.24), c: tones[i % tones.length] };
  }).sort((p, q) => p.y - q.y);
}

/** Woven bamboo basket / cane tub, origin at the bottom centre. `children` drawn between heap and front body
 *  (falling cherries). `extra` = cherries that appear as it fills (className hv-fill-<id>). */
export function Basket({ w, h, id, seed, cr = 4.6, children }: { w: number; h: number; id: string; seed: number; cr?: number; children?: ReactNode }) {
  const ry = w * 0.12;
  const base = heap(seed, w, Math.round(w / 3.2), -h, cr);
  const extra = heap(seed + 7, w * 0.8, 8, -h - cr * 0.8, cr);
  const body = `M${-w / 2} ${-h}C${-w / 2} ${-h * 0.5} ${-w * 0.45} ${-h * 0.14} ${-w * 0.37} 0Q0 ${w * 0.05} ${w * 0.37} 0C${w * 0.45} ${-h * 0.14} ${w / 2} ${-h * 0.5} ${w / 2} ${-h}Z`;
  return (
    <g>
      <ellipse cx="0" cy={-h} rx={w / 2} ry={ry} fill="#5d4126" stroke={C.weaveLine} strokeWidth="1.2" />
      <ellipse cx="0" cy={-h + 1} rx={w * 0.44} ry={ry * 0.8} fill="#6e1c22" />
      {base.map((c, i) => (
        <circle key={i} cx={f1(c.x)} cy={f1(c.y)} r={f1(c.r)} fill={c.c} stroke={C.cherryLine} strokeWidth="0.6" />
      ))}
      <g className={`hv-fill-${id}`}>
        {extra.map((c, i) => (
          <g key={i} opacity="0" className="hv-fill-dot">
            <circle cx={f1(c.x)} cy={f1(c.y)} r={f1(c.r)} fill={c.c} stroke={C.cherryLine} strokeWidth="0.6" />
            <circle cx={f1(c.x - c.r * 0.35)} cy={f1(c.y - c.r * 0.4)} r={f1(c.r * 0.3)} fill="#fff2df" opacity="0.5" />
          </g>
        ))}
      </g>
      {children}
      <path d={body} fill="url(#hv-weave)" stroke={C.weaveLine} strokeWidth="1.4" strokeLinejoin="round" />
      <path d={body} fill="url(#hv-basket-shade)" />
      <path d={`M${-w / 2} ${-h}A${w / 2} ${ry} 0 0 0 ${w / 2} ${-h}`} fill="none" stroke={C.bambooDark} strokeWidth="4.5" />
      <path d={`M${-w / 2} ${-h}A${w / 2} ${ry} 0 0 0 ${w / 2} ${-h}`} fill="none" stroke={C.bamboo} strokeWidth="1.6" strokeDasharray="5 3" />
    </g>
  );
}

// ---------- standing woman (W1, W2) ----------

function StandingBody({ look, rig, id, far, held, near }: { look: Look; rig: Rig; id: string; far: ReactNode; held: ReactNode; near: ReactNode }) {
  const skirt = "M-30 -215C-36 -190 -42 -150 -44 -110C-46 -70 -50 -30 -52 -4C-30 2 20 2 50 -4C44 -40 40 -90 36 -140C34 -170 32 -195 28 -218Z";
  const hem = "M-52 -4C-30 2 20 2 50 -4L48.5 -20C20 -15 -30 -15 -50.5 -19Z";
  return (
    <g>
      {/* the loose end of the saree (pallu) hanging down her back, moving in the breeze */}
      <g {...jointProps(rig, `${id}-pallu`, 20, -302, 0)}>
        <path d="M-6 -2C10 2 18 22 20 52C22 82 24 112 26 134L2 138C2 112 0 72 -2 40Z" fill={look.saree} stroke={look.sareeShade} strokeWidth="1.2" />
        <path d="M-6 -2C10 2 18 22 20 52C22 82 24 112 26 134L2 138C2 112 0 72 -2 40Z" fill={`url(#${look.pattern})`} opacity="0.5" />
        <path d="M2 122L26 118L26 134L2 138Z" fill={look.border} />
        <path d="M3 138L3 144M8 137.5L8 143.5M13 137L13 143M18 136.5L18 142.5M23 136L23 142" stroke={look.border} strokeWidth="1.2" strokeLinecap="round" />
      </g>
      {far}
      {/* bare feet under the hem */}
      <path d="M-44 -6C-50 -6 -58 -3 -60 0.5L-37 1.5C-37 -2 -40 -5 -44 -6Z" fill={look.skin} stroke={look.skinLine} strokeWidth="1" />
      <path d="M-8 -4C-14 -4 -22 -1 -24 2L-1 2.5C-1 -0.5 -4 -3.5 -8 -4Z" fill={look.skin} stroke={look.skinLine} strokeWidth="1" />
      {/* skirt with front pleats and a woven border */}
      <path d={skirt} fill={look.saree} stroke={look.sareeShade} strokeWidth="1.4" strokeLinejoin="round" />
      <path d={skirt} fill={`url(#${look.pattern})`} opacity="0.5" />
      <path d="M8 -212C14 -150 20 -80 26 -6" fill="none" stroke={look.sareeShade} strokeWidth="9" opacity="0.35" strokeLinecap="round" />
      <path d="M-20 -205C-26 -140 -34 -60 -40 -6M-12 -205C-15 -140 -20 -60 -24 -4M-4 -206C-5 -140 -6 -60 -7 -3" fill="none" stroke={look.sareeShade} strokeWidth="1.4" strokeLinecap="round" />
      <path d={hem} fill={look.border} />
      <path d={hem} fill="url(#hv-motif)" />
      {/* waist, blouse and the pallu across the chest */}
      <path d="M-30 -215C-33 -235 -34 -250 -33 -262L24 -262C25 -248 26 -232 28 -218Z" fill={look.skin} stroke={look.skinLine} strokeWidth="1" />
      <path d="M-33 -256C-38 -272 -38 -290 -26 -302C-16 -309 6 -310 18 -303C26 -295 26 -275 25 -256Z" fill={look.blouse} stroke="#3a2418" strokeWidth="1" strokeOpacity="0.5" />
      <path d="M-32 -214C-36 -240 -30 -262 -16 -280C-4 -294 8 -304 18 -306L26 -296C18 -288 6 -276 -2 -262C-12 -246 -16 -230 -12 -212Z" fill={look.saree} stroke={look.sareeShade} strokeWidth="1.2" />
      <path d="M-32 -214C-36 -240 -30 -262 -16 -280C-4 -294 8 -304 18 -306L26 -296C18 -288 6 -276 -2 -262C-12 -246 -16 -230 -12 -212Z" fill={`url(#${look.pattern})`} opacity="0.5" />
      <path d="M-32 -214C-36 -240 -30 -262 -16 -280C-4 -294 8 -304 18 -306" fill="none" stroke={look.border} strokeWidth="5" strokeLinecap="round" />
      <g {...jointProps(rig, `${id}-head`, -4, -314, POSE_REST[id].head)}>
        <Head look={look} />
      </g>
      {held}
      {near}
    </g>
  );
}

const POSE_REST: Record<string, { up: number; fore: number; hand: number; head: number }> = {
  w1: POSES.w1.reach,
  w2: POSES.w2.reach,
  w3: POSES.w3.scoop,
};

function NearArm({ rig, id, look, x, y }: { rig: Rig; id: string; look: Look; x: number; y: number }) {
  const p = POSE_REST[id];
  return (
    <g {...jointProps(rig, `${id}-up`, x, y, p.up)}>
      <Limb len={62} w={13.5} color={look.skin} line={look.skinLine} />
      <path d="M0 0L0 18" stroke={look.blouse} strokeWidth="17" strokeLinecap="round" />
      <g {...jointProps(rig, `${id}-fore`, 0, 62, p.fore)}>
        <Limb len={58} w={11} color={look.skin} line={look.skinLine} />
        <Bangles y={44} />
        <g {...jointProps(rig, `${id}-hand`, 0, 58, p.hand)}>
          <Hand skin={look.skin} line={look.skinLine}>
            <Handful cls={`hv-hand-${id}`} />
          </Hand>
        </g>
      </g>
    </g>
  );
}

function FarArm({ look, d, hand, handAngle }: { look: Look; d: string; hand: [number, number]; handAngle: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke={look.skinLine} strokeWidth="13.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={look.skin} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d.split("L")[0] + "L" + d.split("L")[1]} fill="none" stroke={look.blouse} strokeWidth="16" strokeLinecap="round" strokeDasharray="17 400" />
      <g transform={`translate(${hand[0]} ${hand[1]}) rotate(${handAngle})`}>
        <Hand skin={look.skin} line={look.skinLine} />
      </g>
    </g>
  );
}

// ---------- the three women ----------

function Placed({ id, box, children }: { id: "w1" | "w2" | "w3"; box: [number, number, number, number]; children: ReactNode }) {
  const p = PLACE[id];
  const [x, y, w, h] = box;
  return (
    <svg className="hv-layer hv-woman" style={{ left: x, top: y, width: w, height: h }} viewBox={`${x} ${y} ${w} ${h}`} aria-hidden>
      <g transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>{children}</g>
    </svg>
  );
}

/** W1: reaching up into the branch; a small basket held at her waist. */
export function WomanReaching({ rig }: { rig: Rig }) {
  const look = LOOKS.w1;
  return (
    <Placed id="w1" box={[1030, 450, 190, 465]}>
      <StandingBody
        look={look}
        rig={rig}
        id="w1"
        far={<FarArm look={look} d="M10 -298L16 -238L-38 -198" hand={[-40, -197]} handAngle={60} />}
        held={
          <g transform="translate(-70 -164)">
            <Basket w={52} h={32} id="w1" seed={21} cr={4} />
          </g>
        }
        near={<NearArm rig={rig} id="w1" look={look} x={-6} y={-298} />}
      />
    </Placed>
  );
}

/** W2: picking at waist height into a cane tub on her hip. */
export function WomanPicking({ rig }: { rig: Rig }) {
  const look = LOOKS.w2;
  return (
    <Placed id="w2" box={[1225, 535, 210, 380]}>
      <StandingBody
        look={look}
        rig={rig}
        id="w2"
        far={<FarArm look={look} d="M10 -298L16 -240L-34 -194" hand={[-36, -193]} handAngle={62} />}
        held={
          <g transform="translate(-74 -170)">
            <Basket w={70} h={22} id="w2" seed={33} cr={4} />
          </g>
        }
        near={<NearArm rig={rig} id="w2" look={look} x={-6} y={-298} />}
      />
    </Placed>
  );
}

/** W3: kneeling, a tub on her lap, moving handfuls into the big bamboo basket. */
export function WomanKneeling({ rig }: { rig: Rig }) {
  const look = LOOKS.w3;
  const drape = "M-74 -2C-80 -14 -78 -34 -64 -48C-46 -58 -20 -60 -4 -64C0 -78 0 -92 -6 -100L30 -106C44 -88 58 -60 56 -30C56 -14 50 -4 46 0Z";
  return (
    <Placed id="w3" box={[1385, 650, 290, 280]}>
      {/* the big basket on the ground, in front of her knees */}
      <g transform="translate(-150 0)">
        <Basket w={112} h={88} id="w3" seed={45} cr={4.6}>
          <g className="hv-fall-w3" opacity="0">
            <circle cx="-4" cy="-112" r="4.2" fill={C.red} stroke={C.cherryLine} strokeWidth="0.7" />
            <circle cx="3" cy="-118" r="4" fill={C.burgundy} stroke={C.cherryLine} strokeWidth="0.7" />
            <circle cx="-1" cy="-124" r="4.2" fill={C.ripe} stroke={C.cherryLine} strokeWidth="0.7" />
          </g>
        </Basket>
      </g>
      {/* saree end down her back */}
      <g {...jointProps(rig, "w3-pallu", -18, -186, 0)}>
        <path d="M-6 -2C12 4 30 28 44 60C52 80 58 100 62 114L40 120C34 100 24 76 12 54Z" fill={look.saree} stroke={look.sareeShade} strokeWidth="1.2" />
        <path d="M-6 -2C12 4 30 28 44 60C52 80 58 100 62 114L40 120C34 100 24 76 12 54Z" fill={`url(#${look.pattern})`} opacity="0.5" />
        <path d="M38 106L60 100L62 114L40 120Z" fill={look.border} />
      </g>
      <FarArm look={look} d="M-28 -178L-6 -124L-30 -76" hand={[-31, -75]} handAngle={30} />
      {/* heels showing behind */}
      <path d="M28 -2C34 -12 48 -14 58 -8C60 -4 58 0 54 0Z" fill={look.skin} stroke={look.skinLine} strokeWidth="1" />
      <path d={drape} fill={look.saree} stroke={look.sareeShade} strokeWidth="1.4" strokeLinejoin="round" />
      <path d={drape} fill={`url(#${look.pattern})`} opacity="0.5" />
      <path d="M-60 -46C-40 -40 -10 -36 20 -50M-66 -30C-40 -24 -6 -22 30 -36M10 -96C20 -70 30 -40 34 -6" fill="none" stroke={look.sareeShade} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M-74 -2C-50 2 10 2 46 0L46 -14C10 -12 -50 -12 -77 -15Z" fill={look.border} />
      <path d="M-74 -2C-50 2 10 2 46 0L46 -14C10 -12 -50 -12 -77 -15Z" fill="url(#hv-motif)" />
      {/* torso leaning forward */}
      <path d="M30 -104C26 -128 18 -150 10 -164L-50 -160C-56 -140 -44 -118 -6 -98Z" fill={look.skin} stroke={look.skinLine} strokeWidth="1" />
      <path d="M12 -160C4 -176 -8 -188 -22 -190C-36 -192 -54 -186 -62 -172C-64 -162 -60 -150 -54 -144L10 -150Z" fill={look.blouse} stroke="#1e2440" strokeWidth="1" strokeOpacity="0.5" />
      <path d="M-6 -98C-30 -110 -50 -128 -50 -150C-48 -166 -38 -180 -24 -188L-14 -180C-26 -170 -32 -150 -26 -134C-20 -120 -4 -108 10 -102Z" fill={look.saree} stroke={look.sareeShade} strokeWidth="1.2" />
      <path d="M-6 -98C-30 -110 -50 -128 -50 -150C-48 -166 -38 -180 -24 -188" fill="none" stroke={look.border} strokeWidth="5" strokeLinecap="round" />
      <g {...jointProps(rig, "w3-head", -44, -190, POSES.w3.scoop.head)}>
        <Head look={look} />
      </g>
      {/* the tub on her lap */}
      <g transform="translate(-62 -56)">
        <Basket w={64} h={22} id="w3tub" seed={57} cr={3.8} />
      </g>
      <NearArm rig={rig} id="w3" look={look} x={-44} y={-170} />
    </Placed>
  );
}
