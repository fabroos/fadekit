import { IMAGE } from '@/lib/site';

export const DEFAULT_CSS = `@import "tailwindcss";
@plugin "fadekit";
`;

const imageCard = (fade: string, label = fade) => `  <figure class="flex flex-col gap-1.5">
    <div class="relative h-56 overflow-hidden rounded-xl">
      <img src="${IMAGE}" class="h-full w-full object-cover" />
      <div class="absolute inset-0 ${fade}"></div>
    </div>
    <figcaption>${label}</figcaption>
  </figure>`;

export const EXAMPLES: { name: string; html: string }[] = [
  {
    name: 'Overlay',
    html: `<div class="grid min-h-screen place-items-center bg-zinc-100 p-8">
  <div class="relative w-full max-w-md overflow-hidden rounded-2xl shadow-xl">
    <img src="${IMAGE}" class="aspect-[4/5] w-full object-cover" />
    <div class="absolute inset-x-0 bottom-0 h-2/3 fade-from-black fade-to-t"></div>
    <div class="absolute inset-x-0 bottom-0 p-6 text-white">
      <h2 class="text-2xl font-semibold">Smooth overlays</h2>
      <p class="text-white/70">No visible banding at the edge.</p>
    </div>
  </div>
</div>`,
  },
  {
    name: 'vs bg-linear',
    html: `<div class="grid min-h-screen grid-cols-2 gap-6 bg-zinc-100 p-8 font-mono text-xs">
${imageCard('bg-linear-to-t from-black')}
${imageCard('fade-from-black fade-to-t')}
</div>`,
  },
  {
    name: 'Easing',
    html: `<!-- Click any card to plot its opacity curve -->
<div class="grid grid-cols-4 gap-4 p-6 font-mono text-xs">
${[
  'fade-linear',
  'fade-scrim',
  'fade-ease-out-quad',
  'fade-ease-out',
  'fade-ease-out-quart',
  'fade-ease-out-expo',
  'fade-ease-in-out',
  'fade-ease-in',
]
  .map(easing => imageCard(`fade-from-black fade-to-t ${easing}`, easing))
  .join('\n')}
</div>`,
  },
  {
    name: 'Directions',
    html: `<div class="grid auto-rows-[12rem] grid-cols-4 gap-4 p-8 font-mono text-xs">
${['t', 'b', 'l', 'r', 'tl', 'tr', 'bl', 'br', '45', '[200deg]']
  .map(
    dir =>
      `  <div class="rounded-xl border p-3 fade-from-violet-500 fade-to-${dir}">fade-to-${dir}</div>`
  )
  .join('\n')}
</div>`,
  },
  {
    name: 'Steps',
    html: `<!-- Without /N the plugin picks the fewest stops that stay smooth -->
<div class="grid auto-rows-[16rem] grid-cols-5 gap-4 p-8 font-mono text-xs">
${['/3', '/4', '/6', '/12', '']
  .map(
    steps =>
      `  <div class="rounded-xl border p-3 fade-from-blue-600 fade-to-b fade-ease-out${steps}">fade-ease-out${steps}</div>`
  )
  .join('\n')}
</div>`,
  },
  {
    name: 'Composable',
    html: `<div class="grid auto-rows-[10rem] grid-cols-3 gap-4 p-8 font-mono text-xs" style="--brand: #f97316">
  <div class="rounded-xl border p-3 fade-from-black/40 fade-to-b">fade-from-black/40</div>
  <div class="rounded-xl border p-3 fade-from-[#0ea5e9] fade-to-r">fade-from-[#0ea5e9]</div>
  <div class="rounded-xl border p-3 fade-from-(--brand) fade-to-b">fade-from-(--brand)</div>
  <div class="rounded-xl border p-3 fade-to-emerald-500 fade-to-b">fade-to-emerald-500</div>
  <div class="rounded-xl border p-3 fade-from-rose-500 fade-to-b hover:fade-from-indigo-500 hover:fade-ease-in-out">hover me</div>
  <div class="rounded-xl border p-3 fade-from-amber-500 fade-to-b md:fade-to-r">md:fade-to-r</div>
</div>`,
  },
  {
    name: 'Scroll fade',
    html: `<div class="grid min-h-screen place-items-center bg-white p-8">
  <div class="relative w-72 rounded-xl border">
    <ul class="h-72 divide-y overflow-y-auto">
      <li class="p-3">Item 1</li><li class="p-3">Item 2</li><li class="p-3">Item 3</li>
      <li class="p-3">Item 4</li><li class="p-3">Item 5</li><li class="p-3">Item 6</li>
      <li class="p-3">Item 7</li><li class="p-3">Item 8</li><li class="p-3">Item 9</li>
    </ul>
    <!-- .fade uses --color-background (falls back to white) -->
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-20 rounded-b-xl fade fade-to-t"></div>
  </div>
</div>`,
  },
];
