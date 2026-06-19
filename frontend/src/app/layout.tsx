import type { Metadata } from 'next';
import { Inter, EB_Garamond, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const serif = EB_Garamond({ subsets: ['latin'], variable: '--font-serif' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

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
    <html lang="en">
      <body className={`${inter.variable} ${serif.variable} ${mono.variable} font-sans min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white`}>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            
            <Navbar />
            
            <main className="flex-1 z-10">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
