'use client';
import { useState } from 'react';
import type { Influencer, Scene } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AiButton } from './ai-button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Bot, Save, Sparkles } from 'lucide-react';

interface QuickSceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencer: Influencer | null;
  onGenerate: (jokeTheme: string) => Promise<void>;
  onSave: () => Promise<void>;
  generatedScene: Scene | null;
  loading: boolean;
  isLoggedIn: boolean;
}

export function QuickSceneModal({
  isOpen, onClose, influencer, onGenerate, onSave, generatedScene, loading, isLoggedIn
}: QuickSceneModalProps) {
  const [jokeTheme, setJokeTheme] = useState('');

  if (!influencer) return null;

  const handleGenerateClick = () => {
    if (jokeTheme.trim()) {
      onGenerate(jokeTheme);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <Sparkles className="h-6 w-6 text-primary" /> Gerador de Cena Rápida
          </DialogTitle>
          <DialogDescription>
            Crie uma cena cômica para <strong>{influencer.name}</strong> com base em um tema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="joke-theme">Tema da Piada ou Situação</Label>
            <Input 
              id="joke-theme" 
              placeholder="Ex: tecnologia, animais, comida" 
              value={jokeTheme}
              onChange={(e) => setJokeTheme(e.target.value)}
            />
          </div>
          <AiButton
            onClick={handleGenerateClick}
            loading={loading}
            isLoggedIn={isLoggedIn}
            disabled={!jokeTheme.trim()}
          >
            <Bot className="mr-2 h-5 w-5" />
            {loading ? 'A gerar...' : 'Gerar Cena com IA'}
          </AiButton>
        </div>

        {generatedScene && (
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle className="text-lg">{generatedScene.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Cenário:</strong> {generatedScene.setting}</p>
              <p><strong>Ação:</strong> {generatedScene.action}</p>
              <p><strong>Diálogo:</strong> {generatedScene.dialogue}</p>
            </CardContent>
          </Card>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          <Button type="button" onClick={onSave} disabled={!generatedScene}>
            <Save className="mr-2 h-4 w-4" /> Salvar e Carregar Cena
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
