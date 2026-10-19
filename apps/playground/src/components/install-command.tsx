'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Cluster } from '@/components/ui/cluster';
import { INSTALL } from '@/lib/site';
import { cn } from '@/lib/utils';

export function InstallCommand({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Cluster align="stretch" className={cn('font-mono text-sm', className)}>
      <code className="flex h-10 flex-1 items-center gap-3 px-4 whitespace-nowrap">
        <span className="text-muted-foreground select-none">$</span>
        {INSTALL}
      </code>
      <Button
        size="icon-lg"
        variant="accent"
        aria-label={copied ? 'Copied' : 'Copy install command'}
        onClick={async () => {
          await navigator.clipboard.writeText(INSTALL);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
    </Cluster>
  );
}
