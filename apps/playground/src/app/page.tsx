import { Playground } from '@/components/playground';
import { Edge } from '@/components/sections/edge';
import { Footer } from '@/components/sections/footer';
import { Hero } from '@/components/sections/hero';

export default function Home() {
  return (
    <>
      <main className="wrapper flex flex-col gap-24 pb-24">
        <div>
          <Hero />
          <Edge />
        </div>
        <Playground />
      </main>
      <Footer />
    </>
  );
}
