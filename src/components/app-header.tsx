'use client';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CheckCircle, KeyRound, Plus, Loader2, XCircle, Settings } from 'lucide-react';
import type { ApiKeyStatus } from '@/types';
import { Badge } from './ui/badge';
import { formatTimeAgo } from '@/lib/utils';

interface AppHeaderProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onRemoveApiKey: () => void;
  apiKeyStatus: ApiKeyStatus;
  lastApiKeyCheck: string | null;
}

export function AppHeader({ isLoggedIn, onLoginClick, onRemoveApiKey, apiKeyStatus, lastApiKeyCheck }: AppHeaderProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (lastApiKeyCheck) {
      setTimeAgo(formatTimeAgo(lastApiKeyCheck));
      const intervalId = setInterval(() => {
        setTimeAgo(formatTimeAgo(lastApiKeyCheck));
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [lastApiKeyCheck]);
  
  return (
    <header className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12">
            <svg
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full"
            >
              <defs>
                <linearGradient
                  id="logo-gradient"
                  x1="0"
                  y1="0"
                  x2="52"
                  y2="52"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#A855F7" />
                  <stop offset="1" stopColor="#E934C3" />
                </linearGradient>
              </defs>
              <rect width="52" height="52" rx="14" fill="url(#logo-gradient)" />
              <g filter="url(#filter0_d_90_165)">
                <path
                  d="M32.8681 12.3553C33.6214 11.2335 35.1226 11.1966 35.9221 12.2857L37.1555 13.9871C37.955 15.0762 37.5501 16.595 36.4952 17.2003L23.4939 25.7533C22.4389 26.3586 21.2008 25.7677 20.9381 24.5828L19.4627 17.932C19.2001 16.7471 20.0886 15.548 21.285 15.405L32.8681 12.3553Z"
                  fill="white"
                />
                <path
                  d="M19.1222 39.5298C18.3689 40.6516 16.8677 40.6885 16.0682 39.5994L14.8348 37.9092C14.0353 36.8201 14.4402 35.2901 15.4951 34.6848L28.4964 26.1318C29.5514 25.5265 30.7895 26.1174 31.0522 27.3023L32.5276 33.9531C32.7902 35.138 31.9017 36.3371 30.7053 36.4801L19.1222 39.5298Z"
                  fill="white"
                />
              </g>
              <path
                d="M32 30L32 40L42 35L32 30Z"
                fill="white"
                fillOpacity="0.9"
              />
              <path
                d="M40.2322 10L41.6464 11.4142L40.2322 12.8284L38.818 11.4142L40.2322 10Z"
                fill="white"
              />
              <path
                d="M12.2322 8L13.6464 9.41421L12.2322 10.8284L10.818 9.41421L12.2322 8Z"
                fill="white"
                fillOpacity="0.7"
              />
              <defs>
                <filter
                  id="filter0_d_90_165"
                  x="10.834"
                  y="10.8315"
                  width="30.3223"
                  height="32.8535"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dy="2" />
                  <feGaussianBlur stdDeviation="1" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_90_165"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_90_165"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>
        </div>
        <div>
          <h1 className="font-headline text-2xl font-bold text-primary sm:text-3xl">
            Scriptify Studio 2.0
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Crie influenciadores e gere roteiros para vídeo.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <>
            {apiKeyStatus === 'testing' ? (
              <Badge variant="outline" className="text-muted-foreground py-1.5 px-3">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...
              </Badge>
            ) : apiKeyStatus === 'invalid' ? (
              <Button variant="destructive" onClick={onLoginClick}>
                <XCircle className="mr-2 h-4 w-4" /> Chave Inválida
              </Button>
            ) : (
              <>
                {apiKeyStatus === 'valid' && timeAgo && (
                  <Badge variant="outline" className="border-green-600 bg-green-50 text-green-700 py-1.5 px-3">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span>A funcionar ({timeAgo})</span>
                  </Badge>
                )}
                <Badge variant="outline" className="border-green-600 bg-green-50 text-green-700 py-1.5 px-3">
                  <KeyRound className="mr-2 h-4 w-4" />
                  API Configurada
                </Badge>
              </>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 bg-gray-100 dark:bg-gray-800">
                    <Settings className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-4 p-2">
                  <div>
                    <h4 className="font-medium leading-none">Status da Chave API</h4>
                    {apiKeyStatus === 'valid' && <p className="mt-1 text-sm text-muted-foreground">A sua chave API está a funcionar corretamente.</p>}
                    {apiKeyStatus === 'invalid' && <p className="mt-1 text-sm text-destructive">A sua chave API é inválida ou expirou. Por favor, insira uma nova.</p>}
                    {apiKeyStatus === 'testing' && <p className="mt-1 text-sm text-muted-foreground">A verificar a sua chave API...</p>}
                    {apiKeyStatus === 'idle' && <p className="mt-1 text-sm text-muted-foreground">A sua chave API está configurada.</p>}
                  </div>
                  <Button variant="destructive" size="sm" className="w-full" onClick={onRemoveApiKey}>
                    Remover Chave
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </>
        ) : (
          <Button onClick={onLoginClick} className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md transition-transform hover:scale-105">
            <Plus className="mr-2 h-5 w-5" /> Inserir Chave API
          </Button>
        )}
      </div>
    </header>
  );
}
