'use client';
import type { Influencer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Trash2, Palette, Plus, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InfluencerGalleryViewProps {
  influencers: Influencer[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onQuickScene: (id: string) => void;
}

export default function InfluencerGalleryView({ influencers, onLoad, onDelete, onAddNew, onQuickScene }: InfluencerGalleryViewProps) {
    const { toast } = useToast();

    const exportInfluencerAsTxt = (influencerToExport: Influencer) => {
        const { id, imagePreview, ...data } = influencerToExport;
        const content = Object.entries(data)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `${data.name.replace(/ /g, '_')}_caracteristicas.txt`;
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
                    <Palette />
                    Galeria de Influenciadores
                </CardTitle>
                <CardDescription className="mt-1">
                    Influenciadores que você criou. Carregue um para editar ou gerar roteiros.
                </CardDescription>
            </div>
            <Button onClick={onAddNew}>
                <Plus className="mr-2 h-4 w-4" /> Novo Influenciador
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {influencers.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground italic">A sua galeria está vazia. Crie um novo influenciador para começar.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {influencers.map((gal) => (
              <Card key={gal.id} className="flex flex-col justify-between transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="truncate">{gal.name || 'Influenciador Sem Nome'}</CardTitle>
                  <CardDescription>{gal.niche}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 h-[60px] text-sm text-muted-foreground">{gal.bio}</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <div className="grid w-full grid-cols-2 gap-2">
                        <Button onClick={() => onLoad(gal.id!)} className="w-full">
                            <UploadCloud className="mr-2 h-4 w-4" /> Carregar
                        </Button>
                        <Button onClick={() => onQuickScene(gal.id!)} variant="outline" className="w-full">
                            <Sparkles className="mr-2 h-4 w-4" /> Cena Rápida
                        </Button>
                    </div>
                    <div className="grid w-full grid-cols-[1fr_auto] gap-2">
                        <Button onClick={() => exportInfluencerAsTxt(gal)} variant="secondary" className="w-full">
                          <FileText className="mr-2 h-4 w-4" /> Exportar
                        </Button>
                        <Button onClick={() => onDelete(gal.id!)} variant="ghost" size="icon">
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
