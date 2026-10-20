import { compile, __unstable__loadDesignSystem } from 'tailwindcss';
import indexCss from 'tailwindcss-dir/index.css?raw';
import preflightCss from 'tailwindcss-dir/preflight.css?raw';
import themeCss from 'tailwindcss-dir/theme.css?raw';
import utilitiesCss from 'tailwindcss-dir/utilities.css?raw';

// Straight from source (not dist), so plugin edits hot-reload the playground.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fadekit = require('fadekit/index');

const STYLESHEETS: Record<string, string> = {
  tailwindcss: indexCss,
  'tailwindcss/index.css': indexCss,
  'tailwindcss/preflight': preflightCss,
  'tailwindcss/preflight.css': preflightCss,
  'tailwindcss/theme': themeCss,
  'tailwindcss/theme.css': themeCss,
  'tailwindcss/utilities': utilitiesCss,
  'tailwindcss/utilities.css': utilitiesCss,
};

const options = {
  base: '/',
  async loadStylesheet(id: string, base: string) {
    const content = STYLESHEETS[id];
    if (content === undefined) throw new Error(`Can't @import "${id}" in the playground`);
    return { path: id, base, content };
  },
  async loadModule(id: string, base: string) {
    if (id !== 'fadekit') {
      throw new Error(`Only @plugin "fadekit" is available, got "${id}"`);
    }
    return { path: id, base, module: fadekit };
  },
};

export type Compiler = Awaited<ReturnType<typeof compile>>;

export function createCompiler(css: string): Promise<Compiler> {
  return compile(css, options);
}

export async function getClassList(css: string): Promise<string[]> {
  const designSystem = await __unstable__loadDesignSystem(css, options);
  return designSystem.getClassList().map(([name]) => name);
}

/** Tailwind ignores anything that isn't a valid class, so every token is a candidate. */
export function extractCandidates(source: string): string[] {
  return Array.from(new Set(source.split(/[\s"'`<>{}]+/).filter(Boolean)));
}

/** Pulls the `@layer utilities { … }` block out of the compiled output. */
export function extractUtilities(css: string): string {
  const start = css.indexOf('@layer utilities {');
  if (start === -1) return '';
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return css.slice(start, i + 1);
  }
  return css.slice(start);
}
