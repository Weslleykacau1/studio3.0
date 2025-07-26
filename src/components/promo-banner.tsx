
'use client';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative mb-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4 shadow-md dark:border-yellow-800 dark:bg-yellow-900/30">
        <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 rounded-full p-1 text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-800/50"
            aria-label="Fechar banner"
        >
            <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="flex-grow">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-200">
                Acesso gratuito por 2 dias!
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Atualize agora para acesso ilimitado a todas as funcionalidades.
            </p>
            </div>
            <Button asChild className="w-full bg-green-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-green-700 sm:w-auto">
            <a href="https://pay.cakto.com.br/6uv8krj_496356" target="_blank" rel="noopener noreferrer">
                <Sparkles className="mr-2 h-4 w-4" />
                Comprar Agora
            </a>
            </Button>
      </div>
    </div>
  );
}
