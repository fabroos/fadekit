import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Import the plugin straight from its TypeScript source so edits to it hot-reload here.
  transpilePackages: ['fadekit'],
  webpack(config) {
    // `import css from 'tailwindcss-dir/index.css?raw'` → file contents as a string, fed to
    // Tailwind's in-browser compiler. The alias points at the package directory because
    // tailwindcss' `exports` field doesn't allow a `?raw` query.
    config.resolve.alias['tailwindcss-dir'] = path.dirname(
      require.resolve('tailwindcss/package.json')
    );
    // Goes first inside Next's `oneOf` so its global-CSS rules never see these imports.
    const rawRule = { resourceQuery: /raw/, type: 'asset/source' };
    const oneOf = config.module.rules.find(rule => rule && Array.isArray(rule.oneOf));
    if (oneOf) oneOf.oneOf.unshift(rawRule);
    else config.module.rules.unshift(rawRule);
    return config;
  },
};

export default nextConfig;
