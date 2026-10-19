import type { Metadata } from 'next';
import { publicSans, robotoMono } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'fadekit — gradients that actually fade',
  description:
    'A Tailwind CSS plugin for eased, banding-free fades. Composable utilities, any color, any curve.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${publicSans.variable} ${robotoMono.variable}`}>
      <body className="bg-background text-foreground font-sans antialiased">{children}</body>
    </html>
  );
}
