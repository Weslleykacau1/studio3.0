
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
       <div className="container mx-auto flex-grow p-4 sm:p-6 lg:p-8" suppressHydrationWarning>
        <ScriptifyStudio />
      </div>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        By Weslley Athila
      </footer>
    </main>
  );
}
