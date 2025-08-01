
'use client';
import type { Influencer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Trash2, Palette, Plus, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { convertJsonToCsv } from '@/lib/utils';
import Image from 'next/image';

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
        toast({ variant: 'success', title: `'${fileName}' exportado!` });
    };

    const exportAllAsCsv = () => {
        if (influencers.length === 0) {
            toast({ variant: 'destructive', title: 'Nada para exportar', description: 'A galeria de influenciadores está vazia.' });
            return;
        }

        const csvContent = convertJsonToCsv(influencers);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'influenciadores.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ variant: 'success', title: 'Exportação Concluída', description: 'O ficheiro influenciadores.csv foi descarregado.' });
    };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
                <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                    <Palette />
                    Galeria de Personagens
                </CardTitle>
                <CardDescription className="mt-1">
                    Personagens que você criou. Carregue um para editar ou gerar roteiros.
                </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button onClick={onAddNew}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Personagem
                </Button>
                <Button onClick={exportAllAsCsv} variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Exportar para CSV
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {influencers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-12 text-center">
            <Palette className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">A sua galeria está vazia.</p>
            <p className="text-sm text-muted-foreground/80">Crie um novo personagem para começar.</p>
            <Button onClick={onAddNew} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Criar Personagem
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {influencers.map((gal) => (
              <Card key={gal.id} className="group relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                 {gal.imagePreview && (
                    <div className="absolute inset-0 z-0">
                        <Image src={gal.imagePreview} alt={gal.name} layout="fill" className="object-cover opacity-10 transition-opacity group-hover:opacity-20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card to-transparent" />
                    </div>
                 )}
                <div className="relative z-10 flex flex-grow flex-col">
                    <CardHeader>
                        <CardTitle className="truncate">{gal.name || 'Personagem Sem Nome'}</CardTitle>
                        <CardDescription>{gal.niche}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="line-clamp-3 h-[60px] text-sm text-muted-foreground">{gal.bio}</p>
                    </CardContent>
                </div>
                <CardFooter className="relative z-10 flex flex-col gap-2 border-t pt-4">
                    <div className="flex w-full gap-2">
                        <Button onClick={() => onLoad(gal.id!)} className="w-full">
                            <UploadCloud className="mr-2 h-4 w-4" /> Carregar
                        </Button>
                        <Button onClick={() => onQuickScene(gal.id!)} variant="outline" className="w-full">
                            Cena Rápida
                        </Button>
                    </div>
                    <div className="flex w-full items-center justify-between">
                        <Button onClick={() => exportInfluencerAsTxt(gal)} variant="ghost" className="text-muted-foreground">
                          <FileText className="mr-2 h-4 w-4" /> Exportar
                        </Button>
                        <Button onClick={() => onDelete(gal.id!)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
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

    