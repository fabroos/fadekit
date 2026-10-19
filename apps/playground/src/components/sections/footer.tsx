import { Cluster, Filler } from '@/components/ui/cluster';
import { GITHUB_URL, NPM_URL } from '@/lib/site';

const KUDOS = [
  {
    label: 'Inspired by Smooth Gradient Overlays',
    by: 'Shu Ding',
    href: 'https://smooth-overlays.vercel.app/',
  },
  {
    label: 'Scrim curve from Easing Linear Gradients',
    by: 'Andreas Larsen',
    href: 'https://css-tricks.com/easing-linear-gradients/',
  },
  {
    label: 'Photo',
    by: 'Samuel Ferrara',
    href: 'https://unsplash.com/@samferrara?utm_source=unsplash&utm_medium=referral',
  },
];

const link = 'flex items-center gap-1 px-4 py-3 hocus:bg-accent';

export function Footer() {
  return (
    <footer className="wrapper pb-6">
      <Cluster wrap align="stretch" className="font-mono text-xs">
        <span className="flex items-center px-4 py-3">
          <span>
            MIT · Made by{' '}
            <a href="https://github.com/fabroos" className="underline-offset-4 hocus:underline">
              fabroos
            </a>
          </span>
        </span>
        {KUDOS.map(kudo => (
          <a
            key={kudo.href}
            href={kudo.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${link} text-muted-foreground hocus:text-foreground`}
          >
            {kudo.label} <span className="text-foreground">— {kudo.by}</span>
          </a>
        ))}
        <Filler />
        <a href={NPM_URL} target="_blank" rel="noopener noreferrer" className={`${link} uppercase`}>
          npm
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${link} bg-primary text-primary-foreground uppercase hocus:bg-primary/90`}
        >
          GitHub
        </a>
      </Cluster>
    </footer>
  );
}
