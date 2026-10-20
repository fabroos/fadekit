import { InstallCommand } from '@/components/install-command';

export function Hero() {
  return (
    <section className="flex flex-col gap-8 pt-32 pb-16 md:pt-44">
      <span className="flex items-center gap-2 font-mono text-sm">
        <span aria-hidden className="size-3 fade-from-primary fade-to-r" />
        fadekit
      </span>
      <h1 className="max-w-4xl text-6xl leading-[0.95] font-semibold text-balance md:text-8xl">
        Gradients that actually fade.
      </h1>
      <InstallCommand className="max-w-md" />
    </section>
  );
}
