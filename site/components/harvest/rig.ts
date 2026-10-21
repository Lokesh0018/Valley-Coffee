// The harvest rig: one place that writes every moving part's transform each frame.
// - sway: tree branches in their own GPU layers, turned with a CSS rotation (a continuous breeze, seamless).
// - joints: the women's shoulders, elbows, hands, heads and saree ends (SVG transforms inside each woman's small
//   SVG), plus the two picked branches (CSS, they dip when a cherry is pulled). GSAP tweens the angles in `pose`.
// Everything renders with its rest pose already in the markup, so ?static=1 / reduced motion need no JS.

type Sway = { el: HTMLElement; amp: number; period: number; phase: number };
type Joint = { el: SVGGElement; x: number; y: number };

export class Rig {
  sways = new Map<string, Sway>();
  joints = new Map<string, Joint>();
  cssJoints = new Map<string, HTMLElement>();
  pose: Record<string, number> = {};

  sway(key: string, el: HTMLElement | null, amp: number, period: number, phase: number) {
    if (!el) this.sways.delete(key);
    else this.sways.set(key, { el, amp, period, phase });
  }

  joint(key: string, el: SVGGElement | null, x: number, y: number, a: number) {
    if (!el) {
      this.joints.delete(key);
      return;
    }
    this.joints.set(key, { el, x, y });
    if (!(key in this.pose)) this.pose[key] = a;
  }

  cssJoint(key: string, el: HTMLElement | null) {
    if (!el) {
      this.cssJoints.delete(key);
      return;
    }
    this.cssJoints.set(key, el);
    if (!(key in this.pose)) this.pose[key] = 0;
  }

  // what was last written per element, so an unchanged value costs no DOM write (and no style recalc)
  private last = new Map<object, string>();
  private lastT = -1;

  write(t: number) {
    // the breeze and the women move slowly: 30 writes a second look the same as 60 and cost half
    if (t - this.lastT < 1 / 31) return;
    this.lastT = t;
    const put = (el: HTMLElement | SVGGElement, v: string, attr: boolean) => {
      if (this.last.get(el) === v) return;
      this.last.set(el, v);
      if (attr) el.setAttribute("transform", v);
      else (el as HTMLElement).style.transform = v;
    };
    for (const s of this.sways.values()) {
      const a = s.amp * (Math.sin((t * Math.PI * 2) / s.period + s.phase) * 0.8 + Math.sin((t * Math.PI * 2) / (s.period * 2.7) + s.phase * 1.7) * 0.2);
      put(s.el, `rotate(${a.toFixed(2)}deg)`, false);
    }
    for (const [key, el] of this.cssJoints) put(el, `rotate(${this.pose[key].toFixed(2)}deg)`, false);
    for (const [key, j] of this.joints) put(j.el, `translate(${j.x} ${j.y}) rotate(${this.pose[key].toFixed(2)})`, true);
  }
}

/** Props for a joint <g>: its rest transform + a ref that registers it with the rig. */
export function jointProps(rig: Rig, key: string, x: number, y: number, a: number) {
  return {
    transform: `translate(${x} ${y}) rotate(${a})`,
    ref: (el: SVGGElement | null) => rig.joint(key, el, x, y, a),
  };
}
