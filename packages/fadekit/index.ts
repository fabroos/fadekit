// Runtime imports use proper export paths (works with package.json exports)
// @ts-expect-error - TypeScript can't resolve package.json exports, but runtime will work
const plugin = require('tailwindcss/plugin');

// Type imports from dist (TypeScript needs direct path for types)
import type { PluginAPI } from 'tailwindcss/dist/plugin.d.mts';

/**
 * How the fade progresses from the solid color (t = 0) to fully transparent (t = 1).
 * Opacity at `t` is `1 - easing(t)`, so names read like CSS transitions: `ease-out`
 * leaves the color quickly and settles gently into transparency.
 */
type Easing = (t: number) => number;

const EASINGS: Record<string, Easing> = { linear: t => t };

function addFamily(name: string, easeIn: Easing, easeOut: Easing, easeInOut: Easing) {
  EASINGS[`ease-in-${name}`] = easeIn;
  EASINGS[`ease-out-${name}`] = easeOut;
  EASINGS[`ease-in-out-${name}`] = easeInOut;
}

// Robert Penner's easing equations (https://easings.net)
for (const [name, k] of [
  ['quad', 2],
  ['cubic', 3],
  ['quart', 4],
  ['quint', 5],
] as const) {
  addFamily(
    name,
    t => t ** k,
    t => 1 - (1 - t) ** k,
    t => (t < 0.5 ? (2 * t) ** k / 2 : 1 - (2 - 2 * t) ** k / 2)
  );
}
addFamily(
  'sine',
  t => 1 - Math.cos((t * Math.PI) / 2),
  t => Math.sin((t * Math.PI) / 2),
  t => -(Math.cos(Math.PI * t) - 1) / 2
);
addFamily(
  'expo',
  t => 2 ** (10 * t - 10),
  t => 1 - 2 ** (-10 * t),
  t => (t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2)
);
addFamily(
  'circ',
  t => 1 - Math.sqrt(1 - t ** 2),
  t => Math.sqrt(1 - (t - 1) ** 2),
  t => (t < 0.5 ? (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2 : (Math.sqrt(1 - (2 - 2 * t) ** 2) + 1) / 2)
);
// Shorthands, like Tailwind's `ease-in` / `ease-out` / `ease-in-out`
EASINGS['ease-in'] = EASINGS['ease-in-cubic'];
EASINGS['ease-out'] = EASINGS['ease-out-cubic'];
EASINGS['ease-in-out'] = EASINGS['ease-in-out-cubic'];

const DEFAULT_EASING = 'ease-out-cubic';
const MIN_STEPS = 2;
const MAX_STEPS = 64;
/** Max opacity error between the real curve and its linear-gradient approximation (~1/255). */
const AUTO_STEPS_TOLERANCE = 0.004;
const AUTO_STEPS_MAX = 24;

/** `cubic-bezier(x1, y1, x2, y2)`, solved the same way browsers do for transitions. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number): Easing {
  const bezier = (a: number, b: number, s: number) =>
    3 * a * s * (1 - s) ** 2 + 3 * b * s ** 2 * (1 - s) + s ** 3;
  return t => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (bezier(x1, x2, mid) < t) lo = mid;
      else hi = mid;
    }
    return bezier(y1, y2, (lo + hi) / 2);
  };
}

// The "scrim" curve from Andreas Larsen's "Easing Linear Gradients" (CSS-Tricks), fitted to
// a cubic-bezier (max error 0.003): nearly linear at the solid end, a long soft tail.
EASINGS.scrim = cubicBezier(0.04, 0.04, 0.65, 1);

function parseEasing(value: string): Easing | null {
  const name = value.trim();
  if (EASINGS[name]) return EASINGS[name];
  const bezier = name.match(/^cubic-bezier\(([^)]*)\)$/);
  if (!bezier) return null;
  const args = bezier[1]
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);
  if (
    args.length !== 4 ||
    args.some(Number.isNaN) ||
    args[0] < 0 ||
    args[0] > 1 ||
    args[2] < 0 ||
    args[2] > 1
  ) {
    return null;
  }
  return cubicBezier(args[0], args[1], args[2], args[3]);
}

/**
 * Places `count` stops so they're denser where the opacity curve bends the most (stop density
 * ∝ √|f''|, the optimal spacing for piecewise-linear approximation). Returns positions in [0, 1].
 */
function placeStops(opacity: Easing, count: number): number[] {
  const samples = 1000;
  const h = 1 / samples;
  const density: number[] = [];
  for (let i = 0; i <= samples; i++) {
    const a = Math.max(0, i * h - h);
    const b = Math.min(1, i * h + h);
    const curvature =
      Math.abs(opacity(b) - 2 * opacity((a + b) / 2) + opacity(a)) / ((b - a) / 2) ** 2;
    density.push(curvature < 1e-6 ? 0 : Math.sqrt(curvature)); // ignore float noise on straight lines
  }
  // A uniform floor keeps flat stretches (and `linear`) from getting no stops at all.
  const floor = Math.max((0.15 * density.reduce((sum, d) => sum + d, 0)) / density.length, 1e-3);
  const cumulative = [0];
  for (let i = 1; i <= samples; i++) {
    cumulative.push(cumulative[i - 1] + (density[i] + density[i - 1]) / 2 + floor);
  }

  const positions = [0];
  let j = 0;
  for (let s = 1; s < count - 1; s++) {
    const target = (cumulative[samples] * s) / (count - 1);
    while (cumulative[j + 1] < target) j++;
    positions.push((j + (target - cumulative[j]) / (cumulative[j + 1] - cumulative[j])) * h);
  }
  positions.push(1);
  return positions;
}

function maxError(opacity: Easing, positions: number[]): number {
  let max = 0;
  let segment = 0;
  for (let i = 0; i <= 500; i++) {
    const t = i / 500;
    while (segment < positions.length - 2 && positions[segment + 1] < t) segment++;
    const [t0, t1] = [positions[segment], positions[segment + 1]];
    const linear = opacity(t0) + ((opacity(t1) - opacity(t0)) * (t - t0)) / (t1 - t0);
    max = Math.max(max, Math.abs(linear - opacity(t)));
  }
  return max;
}

const round = (n: number, digits: number) => Number(n.toFixed(digits));

// Relative color syntax keeps the color's own alpha (so `fade-from-black/50` works). Unlike
// color-mix(), Tailwind doesn't add an opaque @supports fallback for it.
function stopColor(opacity: number): string {
  const alpha = round(opacity, 3);
  if (alpha >= 1) return 'var(--fade-color)';
  if (alpha <= 0) return 'transparent';
  return `oklch(from var(--fade-color) l c h / calc(alpha * ${alpha}))`;
}

const stopsCache = new Map<string, string>();

/**
 * Gradient stops going from `--fade-color` (0%) to transparent (100%). Without `steps`, uses
 * the fewest stops that keep the gradient within AUTO_STEPS_TOLERANCE of the real curve.
 */
function generateStops(easingKey: string, easing: Easing, steps?: number): string {
  const cacheKey = `${easingKey}@${steps ?? 'auto'}`;
  const cached = stopsCache.get(cacheKey);
  if (cached) return cached;

  const opacity = (t: number) =>
    t <= 0 ? 1 : t >= 1 ? 0 : Math.min(1, Math.max(0, 1 - easing(t)));
  let positions: number[];
  if (steps) {
    positions = placeStops(opacity, steps);
  } else {
    let count = 3;
    positions = placeStops(opacity, count);
    while (count < AUTO_STEPS_MAX && maxError(opacity, positions) > AUTO_STEPS_TOLERANCE) {
      positions = placeStops(opacity, ++count);
    }
  }

  const stops = positions.map(t => `${stopColor(opacity(t))} ${round(t * 100, 1)}%`).join(', ');
  stopsCache.set(cacheKey, stops);
  return stops;
}

function flattenColors(colors: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(colors)) {
    const path = key === 'DEFAULT' ? prefix : prefix ? `${prefix}-${key}` : key;
    if (typeof value === 'string') result[path] = value;
    else if (value && typeof value === 'object') {
      Object.assign(result, flattenColors(value as Record<string, unknown>, path));
    }
  }
  return result;
}

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => String(from + i));

const pluginFunction = plugin(function ({
  addBase,
  addUtilities,
  matchUtilities,
  theme,
}: PluginAPI) {
  // `betterGradient` is the config key from before the rename to fadekit.
  const configuredSteps = (theme('fadekit.steps') ?? theme('betterGradient.steps')) as
    | number
    | undefined;
  const defaultStops = generateStops(DEFAULT_EASING, EASINGS[DEFAULT_EASING], configuredSteps);

  // Non-inheriting, so a nested element never picks up its parent's direction or curve.
  addBase({
    '@property --fade-angle': { syntax: '"<angle>"', inherits: 'false', 'initial-value': '0deg' },
    '@property --fade-stops': { syntax: '"*"', inherits: 'false' },
    '@property --fade-color': { syntax: '"*"', inherits: 'false' },
  });

  // Color, direction and curve live in separate custom properties, so utilities compose in any
  // order and work with variants (`md:fade-to-r`, `hover:fade-from-black/80`) without !important.
  const fadeImage = (reverse: boolean) => ({
    'background-image': `linear-gradient(${
      reverse ? 'calc(var(--fade-angle, 0deg) + 180deg)' : 'var(--fade-angle, 0deg)'
    }, var(--fade-stops, ${defaultStops}))`,
    'background-repeat': 'no-repeat',
  });

  addUtilities({
    '.fade': { '--fade-color': 'var(--color-background, white)', ...fadeImage(false) },
  });

  // Directions (match Tailwind's bg-linear-to-* pattern). `fade-{dir}` are legacy aliases.
  const directions: Record<string, string> = {
    t: '0deg',
    tr: '45deg',
    r: '90deg',
    br: '135deg',
    b: '180deg',
    bl: '225deg',
    l: '270deg',
    tl: '315deg',
  };
  const directionUtilities: Record<string, Record<string, string>> = {};
  for (const [dir, angle] of Object.entries(directions)) {
    directionUtilities[`.fade-to-${dir}`] = { '--fade-angle': angle };
    directionUtilities[`.fade-${dir}`] = { '--fade-angle': angle };
  }
  addUtilities(directionUtilities);

  // Any angle: fade-to-45, fade-to-[30deg]
  matchUtilities(
    { 'fade-to': (angle: string) => ({ '--fade-angle': angle }) },
    {
      type: 'angle',
      values: {
        __BARE_VALUE__: ({ value }: { value: string }) =>
          /^\d+$/.test(value) ? `${value}deg` : undefined,
      } as never,
    }
  );

  // Colors: palette, opacity modifier (fade-from-black/50), arbitrary (fade-from-[#123]) and
  // CSS variables (fade-from-(--brand)). `fade-to-*` is the same fade, flipped.
  const opacityModifiers = Object.fromEntries(
    Array.from({ length: 21 }, (_, i) => [String(i * 5), `${i * 5}%`])
  );
  // `any` lets untyped variables through (fade-from-(--brand)); angles belong to `fade-to-[…]` above.
  const isAngle = (value: string) => /^-?[\d.]+(deg|rad|grad|turn)$/.test(value);
  matchUtilities(
    {
      'fade-from': (color: string) =>
        isAngle(color) ? {} : { '--fade-color': color, ...fadeImage(false) },
      'fade-to': (color: string) =>
        isAngle(color) ? {} : { '--fade-color': color, ...fadeImage(true) },
    },
    {
      type: ['color', 'any'],
      values: flattenColors(theme('colors') as Record<string, unknown>),
      modifiers: opacityModifiers,
    }
  );

  // Curve and stop count:
  //   fade-ease-in-out          easing, automatic stop count
  //   fade-ease-in-out/12       easing with 12 stops
  //   fade-12                   default easing with 12 stops
  //   fade-[cubic-bezier(…)]    any cubic-bezier, also fade-ease-[cubic-bezier(…)]
  // Legacy: fade-{easing}-{steps}, fade-ease-{easing}, fade-ease-[easing]
  const SPEC_SEPARATOR = '@';
  const stepModifiers = Object.fromEntries(range(MIN_STEPS, 24).map(n => [n, n]));

  const parseSpec = (value: string, modifier: string | null) => {
    const [easingValue, legacySteps] = value.split(SPEC_SEPARATOR);
    const stepsValue = modifier ?? legacySteps;
    const steps = stepsValue ? Number(stepsValue) : undefined;
    if (
      steps !== undefined &&
      !(Number.isInteger(steps) && steps >= MIN_STEPS && steps <= MAX_STEPS)
    ) {
      return null;
    }
    if (/^\d+$/.test(easingValue)) {
      const onlySteps = Number(easingValue);
      if (steps !== undefined || onlySteps < MIN_STEPS || onlySteps > MAX_STEPS) return null;
      return { key: DEFAULT_EASING, easing: EASINGS[DEFAULT_EASING], steps: onlySteps };
    }
    const easing = parseEasing(easingValue);
    return easing ? { key: easingValue.replace(/\s+/g, ''), easing, steps } : null;
  };

  const curveUtility = (
    value: string,
    { modifier }: { modifier: string | null }
  ): Record<string, string> => {
    const spec = parseSpec(value, modifier);
    return spec ? { '--fade-stops': generateStops(spec.key, spec.easing, spec.steps) } : {};
  };

  const legacyCurve = (value: string) => {
    const combo = value.match(/^(.+)-(\d+)$/);
    if (combo && EASINGS[combo[1]]) return `${combo[1]}${SPEC_SEPARATOR}${combo[2]}`;
    const easeName = value.replace(/^ease-/, '');
    if (EASINGS[easeName]) return easeName;
    return undefined;
  };

  matchUtilities(
    { fade: curveUtility },
    {
      values: {
        ...Object.fromEntries(Object.keys(EASINGS).map(name => [name, name])),
        ...Object.fromEntries(range(MIN_STEPS, 24).map(n => [n, n])),
        __BARE_VALUE__: ({ value }: { value: string }) => legacyCurve(value),
      } as never,
      modifiers: stepModifiers,
    }
  );
  matchUtilities({ 'fade-ease': curveUtility }, { values: {}, modifiers: stepModifiers });
});

// Export for CommonJS - handle both Tailwind v3 (function) and v4 (object) formats
// Tailwind v3: plugin() returns a function directly, expects function in plugins array
// Tailwind v4: plugin() returns an object with { handler, config }, expects object in plugins array
// For maximum compatibility, if we get an object with handler, we extract the handler for v3 compatibility
// @ts-ignore - module.exports is available at runtime in CommonJS
if (typeof pluginFunction === 'function') {
  // Tailwind v3 format - export function directly
  // @ts-ignore
  module.exports = pluginFunction;
} else if (pluginFunction && typeof pluginFunction === 'object' && 'handler' in pluginFunction) {
  // Tailwind v4 format - plugin() returned an object
  // For v3 compatibility, extract the handler function
  // Tailwind v3 can accept the handler function directly
  // @ts-ignore
  module.exports =
    typeof pluginFunction.handler === 'function' ? pluginFunction.handler : pluginFunction;
} else {
  // Fallback - export whatever we got
  // @ts-ignore
  module.exports = pluginFunction;
}
