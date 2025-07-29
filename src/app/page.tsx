
'use client'
import ScriptifyStudio from "@/components/scriptify-studio";
import { Inter, Space_Grotesk } from 'next/font/google';

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
      <div 
        className="fixed inset-0 -z-10 h-full w-full bg-black bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"
        aria-hidden="true"
      />
       <div className="container mx-auto flex-grow p-4 sm:p-6 lg:p-8" suppressHydrationWarning>
        <ScriptifyStudio />
      </div>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        By Weslley Athila
      </footer>
    </main>
  );
}
