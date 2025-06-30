'use client';
import type { Scene } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, Bot, Trash2, LayoutGrid } from 'lucide-react';
import { AiButton } from '../ai-button';

interface SceneGalleryViewProps {
  scenes: Scene[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onGenerateScript: (scene: Scene) => void;
  isGenerationDisabled: boolean;
}

export default function SceneGalleryView({ scenes, onLoad, onDelete, onGenerateScript, isGenerationDisabled }: SceneGalleryViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl">
            <LayoutGrid className="text-primary"/>
            Galeria de Cenas
        </CardTitle>
        <CardDescription>
            Nenhuma cena na galeria. Guarde uma cena no separador "Criador".
        </CardDescription>
      </CardHeader>
      <CardContent>
        {scenes.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground italic">A sua galeria está vazia.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {scenes.map((scene) => (
              <Card key={scene.id} className="flex flex-col justify-between transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="truncate">{scene.title || 'Cena Sem Título'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 h-[60px] text-sm text-muted-foreground">{scene.setting}</p>
                   <Badge variant="secondary" className="mt-2">{scene.duration}</Badge>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button onClick={() => onLoad(scene.id!)} className="w-full">
                        <UploadCloud className="mr-2 h-4 w-4" /> Carregar
                    </Button>
                    <div className="flex w-full gap-2">
                        <AiButton onClick={() => onGenerateScript(scene)} isLoggedIn={!isGenerationDisabled} className="w-full bg-accent text-accent-foreground hover:bg-accent/80">
                            <Bot className="mr-2 h-4 w-4" />Roteiro
                        </AiButton>
                        <Button onClick={() => onDelete(scene.id!)} variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
