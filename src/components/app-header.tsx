'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CheckCircle, KeyRound, Plus, Settings, Sparkles } from 'lucide-react';

interface AppHeaderProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onRemoveApiKey: () => void;
}

export function AppHeader({ isLoggedIn, onLoginClick, onRemoveApiKey }: AppHeaderProps) {
  return (
    <header className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-2 text-primary-foreground">
          <Sparkles className="h-8 w-8" />
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-green-600 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800">
                <KeyRound className="mr-2 h-4 w-4" /> API Configurada
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2 p-2">
                <h4 className="font-medium leading-none">API Key</h4>
                <p className="text-sm text-muted-foreground">Sua chave API do Google Gemini está configurada.</p>
                <Button variant="destructive" size="sm" className="w-full" onClick={onRemoveApiKey}>
                  Remover Chave
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Button onClick={onLoginClick} className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md transition-transform hover:scale-105">
            <Plus className="mr-2 h-5 w-5" /> Inserir Chave API
          </Button>
        )}
      </div>
    </header>
  );
}
