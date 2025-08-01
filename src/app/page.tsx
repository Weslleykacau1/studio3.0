
'use client'
import ScriptifyStudio from "@/components/scriptify-studio";
import { Inter, Space_Grotesk } from 'next/font/google';
import { Instagram } from 'lucide-react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export default function Home() {

  return (
    <main
      className={`${inter.variable} ${spaceGrotesk.variable} flex min-h-screen flex-col bg-background font-body text-foreground`}
      suppressHydrationWarning
    >
       <div className="container mx-auto flex-grow p-4 sm:p-6" suppressHydrationWarning>
        <ScriptifyStudio />
      </div>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <a 
          href="https://www.instagram.com/weslleyathila.dev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 transition-colors hover:text-primary"
        >
          <Instagram className="h-4 w-4" />
          By Weslley Athila
        </a>
      </footer>
    </main>
  );
}
