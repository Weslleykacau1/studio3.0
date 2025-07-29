
'use client';
import { Loader2 } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-20 w-20">
            <div className="absolute inset-0 animate-pulse rounded-2xl bg-primary/20 blur-xl"></div>
            <svg
                viewBox="0 0 52 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative h-full w-full"
            >
                <rect width="52" height="52" rx="14" fill="url(#logo-gradient-loader)" />
                <defs>
                <linearGradient
                    id="logo-gradient-loader"
                    x1="0"
                    y1="0"
                    x2="52"
                    y2="52"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#7C3AED" />
                    <stop offset="1" stopColor="#A259FF" />
                </linearGradient>
                </defs>
                <g fill="white">
                <path d="M26 13L29.29 22.71L39 26L29.29 29.29L26 39L22.71 29.29L13 26L22.71 22.71L26 13Z" />
                <path d="M37 15L38 17L40 18L38 19L37 21L36 19L34 18L36 17L37 15Z" />
                <path d="M15 31L16 33L18 34L16 35L15 37L14 35L12 34L14 33L15 31Z" />
                </g>
            </svg>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-lg">A carregar...</p>
        </div>
      </div>
    </div>
  );
}
