import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Cluster, Filler } from '@/components/ui/cluster';
import { cn } from '@/lib/utils';

export type Stop = { position: number; alpha: number };

export type Curve = { classes: string; stops: Stop[] };

const STOP = /((?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^()]*\)|transparent)\s+(-?[\d.]+)%/g;

function alphaOf(color: string): number {
  if (color === 'transparent') return 0;
  const args = color.slice(color.indexOf('(') + 1, -1);
  if (args.includes('/')) {
    const alpha = args.split('/')[1].trim();
    return alpha.endsWith('%') ? parseFloat(alpha) / 100 : parseFloat(alpha);
  }
  const commaArgs = args.split(',');
  return commaArgs.length === 4 ? parseFloat(commaArgs[3]) : 1;
}

/** Opacity stops of the first gradient in a computed `background-image`. */
export function parseStops(backgroundImage: string): Stop[] {
  const gradient = backgroundImage.match(/linear-gradient\((.*)\)/)?.[1] ?? '';
  return Array.from(gradient.matchAll(STOP), m => ({
    position: Number(m[2]) / 100,
    alpha: alphaOf(m[1]),
  }));
}

export function CurvePlot({
  stops,
  width = 240,
  height = 120,
  className,
}: {
  stops: Stop[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const pad = 6;
  const x = (p: number) => pad + p * (width - 2 * pad);
  const y = (a: number) => pad + (1 - a) * (height - 2 * pad);
  const points = stops.map(s => `${x(s.position)},${y(s.alpha)}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('block w-full', className)}
      role="img"
      aria-label="Opacity along the gradient"
    >
      {[0, 0.25, 0.5, 0.75, 1].map(v => (
        <line
          key={v}
          x1={x(0)}
          x2={x(1)}
          y1={y(v)}
          y2={y(v)}
          stroke="var(--accent)"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <polyline
        points={points}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      {stops.map((s, i) => (
        <circle key={i} cx={x(s.position)} cy={y(s.alpha)} r={2.5} fill="var(--primary)" />
      ))}
    </svg>
  );
}

export function CurveInspector({ curve, onClose }: { curve: Curve | null; onClose: () => void }) {
  if (!curve) {
    return (
      <span className="pointer-events-none absolute right-2 bottom-2 bg-background/90 px-2.5 py-1.5 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
        Click a fade to plot its curve
      </span>
    );
  }

  return (
    <Cluster direction="col" align="stretch" className="absolute right-2 bottom-2 w-[280px]">
      <Cluster className="[--cluster-bg:var(--background)]">
        <span className="line-clamp-2 flex-1 self-stretch px-2.5 py-2 font-mono text-[11px] text-foreground">
          {curve.classes || '(no classes)'}
        </span>
        <Button size="icon-sm" variant="muted" aria-label="Close inspector" onClick={onClose}>
          <X />
        </Button>
      </Cluster>
      {curve.stops.length === 0 ? (
        <p className="bg-background p-2.5 font-mono text-[11px] text-muted-foreground">
          No linear-gradient on this element.
        </p>
      ) : (
        <>
          <div className="bg-background p-2">
            <CurvePlot stops={curve.stops} />
          </div>
          <Cluster className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase [--cluster-bg:var(--background)]">
            <span className="px-2.5 py-1.5">Opacity × position</span>
            <Filler className="self-stretch" />
            <span className="px-2.5 py-1.5">{curve.stops.length} stops</span>
          </Cluster>
        </>
      )}
    </Cluster>
  );
}
