# fadekit

Smooth, eased fades for Tailwind CSS. A plain `bg-linear-to-t from-black` changes opacity at a constant rate and leaves a hard line where it ends; fadekit builds the gradient from an easing curve, so overlays melt into whatever is behind them.

```bash
npm i fadekit
```

```css
@import 'tailwindcss';
@plugin "fadekit";
```

```html
<div class="fade-from-black fade-to-t fade-scrim"></div>
```

See the [package README](packages/fadekit/README.md) for the full API, or run the playground locally with `pnpm dev`.

> Formerly published as `tailwindcss-better-gradient`.

## Repository

- `packages/fadekit` — the plugin
- `apps/playground` — landing page and live playground (Tailwind compiles in the browser)

Inspired by [Smooth Gradient Overlays](https://smooth-overlays.vercel.app/) by Shu Ding and [Easing Linear Gradients](https://css-tricks.com/easing-linear-gradients/) by Andreas Larsen. MIT.
