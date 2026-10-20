import { Cluster, Filler } from '@/components/ui/cluster';
import { COMPARE_IMAGE } from '@/lib/site';
import { cn } from '@/lib/utils';

// Full class names so Tailwind picks them up from source.
const GROUPS = [
  {
    label: 'Light',
    panels: [
      { label: 'Better', className: 'fade-from-white fade-to-b' },
      { label: 'Linear', className: 'bg-linear-to-b from-white' },
    ],
  },
  {
    label: 'Dark',
    panels: [
      { label: 'Better', className: 'fade-from-black fade-to-b' },
      { label: 'Linear', className: 'bg-linear-to-b from-black' },
    ],
  },
];

export function Edge() {
  return (
    <section className="grid gap-gap md:grid-cols-2">
      {GROUPS.map(group => (
        <Cluster key={group.label} direction="col" align="stretch">
          <Cluster className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            <span className="px-4 py-3 text-foreground">{group.label}</span>
            <Filler className="self-stretch" />
          </Cluster>
          <div className="grid grid-cols-2 gap-gap bg-transparent">
            {group.panels.map(panel => (
              <Cluster key={panel.label} direction="col" align="stretch">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={COMPARE_IMAGE} alt="" className="size-full object-cover" />
                  <div className={cn('absolute inset-x-0 top-0 h-1/2', panel.className)} />
                </div>
                <Cluster className="font-mono text-xs">
                  <span className="px-3 py-2.5 tracking-wide uppercase">{panel.label}</span>
                  <Filler className="self-stretch" />
                  <code className="hidden px-3 py-2.5 text-muted-foreground lg:block">
                    {panel.className}
                  </code>
                </Cluster>
              </Cluster>
            ))}
          </div>
        </Cluster>
      ))}
    </section>
  );
}
