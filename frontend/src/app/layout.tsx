import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AegisMDT | Secure Multi-Agent Orchestration for Rare Oncology',
  description: 'Virtual medical board powered by AI agents for rare diseases.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background antialiased selection:bg-primary/30`}>
        <div className="relative flex min-h-screen flex-col">
          {/* Subtle background glow */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-teal-900/20 blur-[120px]"></div>
            <div className="absolute top-[60%] -right-[10%] h-[50%] w-[50%] rounded-full bg-blue-900/20 blur-[120px]"></div>
          </div>
          
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center px-8">
              <div className="mr-4 flex">
                <a className="mr-6 flex items-center space-x-2" href="/">
                  <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                    <span className="font-bold text-background text-xs">AE</span>
                  </div>
                  <span className="hidden font-bold sm:inline-block">AegisMDT</span>
                </a>
              </div>
              <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <nav className="flex items-center space-x-6 text-sm font-medium">
                  <a className="transition-colors hover:text-foreground/80 text-foreground" href="/">Dashboard</a>
                  <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/cases">Active Cases</a>
                  <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/settings">Settings</a>
                </nav>
              </div>
            </div>
          </header>
          
          <main className="flex-1 z-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
