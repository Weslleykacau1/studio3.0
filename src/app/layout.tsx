
import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Scriptify Studio',
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
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 52 52' fill='none'><rect width='52' height='52' rx='14' fill='url(%23g)'/><defs><linearGradient id='g' x1='0' y1='0' x2='52' y2='52' gradientUnits='userSpaceOnUse'><stop stop-color='%237C3AED'/><stop offset='1' stop-color='%23A259FF'/></linearGradient></defs><g fill='white'><path d='M26 13L29.29 22.71L39 26L29.29 29.29L26 39L22.71 29.29L13 26L22.71 22.71L26 13Z'/><path d='M37 15L38 17L40 18L38 19L37 21L36 19L34 18L36 17L37 15Z'/><path d='M15 31L16 33L18 34L16 35L15 37L14 35L12 34L14 33L15 31Z'/></g></svg>" type="image/svg+xml" />
        <meta name="msapplication-TileColor" content="#7C3AED"/>
        <meta name="theme-color" content="#0D0B1A"/>
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
