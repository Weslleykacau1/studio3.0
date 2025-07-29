
import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Scriptify Studio 2.1',
  description: 'Crie influenciadores e gere roteiros para vídeo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='a' x1='0' y1='0' x2='100' y2='100' gradientUnits='userSpaceOnUse'><stop offset='0' stop-color='%23FF4C00'/><stop offset='1' stop-color='%23D97700'/></linearGradient></defs><rect width='100' height='100' rx='24' fill='url(%23a)'/><g fill='white'><path d='M69,25c-8,0-15,4-17,11l-14,7c-1-3-4-5-8-5c-5,0-9,4-9,9s4,9,9,9c4,0,7-2,8-5l14,7c2,7,8,12,17,12c9,0,17-8,17-17V42C86,33,78,25,69,25z M26,55c-2,0-4-2-4-4s2-4,4-4s4,2,4,4S28,55,26,55z M69,71c-5,0-9-4-9-9s4-9,9-9s9,4,9,9S74,71,69,71z'/><polygon points='66,41 66,51 74,46'/></g></svg>" type="image/svg+xml" />
        <meta name="msapplication-TileColor" content="#FF4C00"/>
        <meta name="theme-color" content="#121212"/>
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
