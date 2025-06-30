'use client';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CheckCircle, KeyRound, Plus, Sparkles, Loader2, XCircle } from 'lucide-react';
import type { ApiKeyStatus } from '@/types';

interface AppHeaderProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onRemoveApiKey: () => void;
  apiKeyStatus: ApiKeyStatus;
}

export function AppHeader({ isLoggedIn, onLoginClick, onRemoveApiKey, apiKeyStatus }: AppHeaderProps) {
  const getStatusButton = () => {
    switch (apiKeyStatus) {
      case 'testing':
        return (
          <Button variant="outline" disabled className="w-[160px]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...
          </Button>
        );
      case 'valid':
        return (
          <Button variant="outline" className="w-[160px] border-green-600 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800">
            <CheckCircle className="mr-2 h-4 w-4" /> API Ativa
          </Button>
        );
      case 'invalid':
        return (
          <Button variant="destructive" onClick={onLoginClick} className="w-[160px]">
            <XCircle className="mr-2 h-4 w-4" /> Chave Inválida
          </Button>
        );
      default: // idle
        return (
          <Button variant="outline" className="w-[160px]" disabled>
            <KeyRound className="mr-2 h-4 w-4" /> API Configurada
          </Button>
        );
    }
  };

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
              {getStatusButton()}
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-4 p-2">
                <div>
                  <h4 className="font-medium leading-none">Status da Chave API</h4>
                  {apiKeyStatus === 'valid' && <p className="mt-1 text-sm text-muted-foreground">A sua chave API está configurada e a funcionar corretamente.</p>}
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
        ) : (
          <Button onClick={onLoginClick} className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md transition-transform hover:scale-105">
            <Plus className="mr-2 h-5 w-5" /> Inserir Chave API
          </Button>
        )}
      </div>
    </header>
  );
}
