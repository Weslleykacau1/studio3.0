'use client';
import type { Scene } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, FileText, Trash2, LayoutGrid, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SceneGalleryViewProps {
  scenes: Scene[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export default function SceneGalleryView({ scenes, onLoad, onDelete, onAddNew }: SceneGalleryViewProps) {
  const { toast } = useToast();

  const exportSceneAsTxt = (sceneToExport: Scene) => {
    // We don't want to export image previews or other non-text data
    const { id, productImagePreview, productImageType, scenarioImagePreview, scenarioImageType, ...data } = sceneToExport;
    const content = Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${(data.title || 'cena_sem_titulo').replace(/ /g, '_')}_detalhes.txt`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: `'${fileName}' exportado!`, className: 'bg-green-100 text-green-800' });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
                <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                    <LayoutGrid />
                    Galeria de Cenas
                </CardTitle>
                <CardDescription className="mt-1">
                    Cenas que você salvou. Carregue uma para editar ou use-a com um influenciador para gerar um roteiro.
                </CardDescription>
            </div>
            <Button onClick={onAddNew}>
                <Plus className="mr-2 h-4 w-4" /> Nova Cena
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {scenes.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground italic">A sua galeria está vazia. Crie uma nova cena para começar.</p>
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
                        <Button onClick={() => exportSceneAsTxt(scene)} variant="secondary" className="w-full">
                            <FileText className="mr-2 h-4 w-4" />Exportar
                        </Button>
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
