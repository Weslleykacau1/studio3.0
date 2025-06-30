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
              <rect width="52" height="52" rx="14" fill="url(#logo-gradient)" />
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
                <filter id="shape-shadow" x="-5" y="-5" width="62" height="62" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feOffset dy="1"/>
                    <feGaussianBlur stdDeviation="1"/>
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_innerShadow"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_innerShadow" result="shape"/>
                </filter>
              </defs>
              <g filter="url(#shape-shadow)" fill="#FFFFFF">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M22.5 16.2C19.3 11.1 23 8.2 28.7 9.2C34.4 10.2 36.8 15.7 34.1 19C31.4 22.3 26.9 23.6 23.9 23.3C21.7 23.09 19.96 23.66 18.5 25.5C16.8 27.6 17.5 31.6 20.3 34.1C23.1 36.6 27.8 37.1 31.3 35.6C34.8 34.1 37.5 31.5 37.8 28.1C37.89 27.1 39.39 27.8 39.5 28.6C40.2 31.8 38.1 35.8 34.6 37.7C29.6 40.4 22.9 39.8 18.8 35.7C14.7 31.6 14.1 24.9 18 21.3C20.3 19.1 22.59 19.04 24.5 19.3C27.5 19.7 30.6 18.5 32.5 16.3C34.4 14.1 33.7 11.2 30.8 10.3C27.9 9.4 24.6 11.4 22.5 16.2ZM32 40L42 35L32 30V40Z" />
                  <path d="M19.5 10C20.0523 10 20.5 10.4477 20.5 11C20.5 11.5523 20.0523 12 19.5 12C18.9477 12 18.5 11.5523 18.5 11C18.5 10.4477 18.9477 10 19.5 10Z" />
                  <path d="M15.0607 13.9393L13 16L15.0607 18.0607L17.1213 20.1213L17.8284 19.4142L15.7678 17.3536L19.4142 17.8284L20.1213 17.1213L18.0607 15.0607L16 13L13.9393 15.0607L13.2322 15.7678L15.7678 13.2322L13.2322 15.7678L15.0607 13.9393Z" transform="translate(-2 -2) scale(1.2)"/>
              </g>
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
