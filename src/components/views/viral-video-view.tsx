'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AiButton } from '@/components/ai-button';
import { handleImageUpload as handleImageUploadUtil } from '@/lib/utils';
import { UploadCloud, Bot, Image as ImageIcon, Sparkles, Pencil, Palette as PaletteIcon, Youtube } from 'lucide-react';
import type { ThumbnailIdeas } from '@/types';
import { Input } from '../ui/input';

interface ViralVideoViewProps {
  onGenerate: (imageDataUri: string) => void;
  generatedIdeas: ThumbnailIdeas | null;
  loading: boolean;
  isLoggedIn: boolean;
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  onAnalyzeVideo: () => void;
  loadingYouTube: boolean;
}

export default function ViralVideoView({ 
    onGenerate, generatedIdeas, loading, isLoggedIn, 
    youtubeUrl, setYoutubeUrl, onAnalyzeVideo, loadingYouTube 
}: ViralVideoViewProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUploadUtil(e, ({ preview, base64 }) => {
      setImagePreview(preview);
      setImageDataUri(`data:${e.target.files?.[0].type};base64,${base64}`);
    });
  };

  const handleGenerateClick = () => {
    if (imageDataUri) {
      onGenerate(imageDataUri);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-headline text-2xl">
            <Youtube className="text-red-500" />
            Analisar Vídeo do YouTube
          </CardTitle>
          <CardDescription>
            Cole um URL de um vídeo do YouTube para a IA se inspirar no estilo e criar uma nova cena automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row">
              <Input 
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)} 
              />
              <AiButton
                  onClick={onAnalyzeVideo}
                  loading={loadingYouTube}
                  isLoggedIn={isLoggedIn}
                  disabled={!youtubeUrl.trim()}
                  className="bg-red-500 text-white hover:bg-red-600"
              >
                  {loadingYouTube ? 'Analisando...' : 'Analisar e Criar Cena'}
              </AiButton>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
              <ImageIcon className="text-primary" />
              Gerador de Thumbnail
            </CardTitle>
            <CardDescription>
              Anexe uma imagem e a IA irá sugerir elementos para criar uma thumbnail viral.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="thumbnail-upload">Carregar Imagem para Thumbnail</Label>
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 text-center">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Prévia da thumbnail" width={400} height={225} className="max-h-[225px] w-auto rounded-md object-contain" />
                ) : (
                  <div className="space-y-2 text-muted-foreground">
                    <UploadCloud className="mx-auto h-12 w-12" />
                    <p>Arraste e solte uma imagem ou clique para carregar</p>
                  </div>
                )}
                 <input id="thumbnail-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                 <Button asChild variant="outline" className="mt-4">
                    <Label htmlFor="thumbnail-upload" className="cursor-pointer gap-2">
                        <UploadCloud className="h-4 w-4" /> 
                        {imagePreview ? 'Trocar Imagem' : 'Escolher Imagem'}
                    </Label>
                </Button>
              </div>
            </div>
            <AiButton
              onClick={handleGenerateClick}
              loading={loading}
              isLoggedIn={isLoggedIn}
              disabled={!imagePreview}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Bot className="mr-2 h-5 w-5" />
              {loading ? 'A gerar ideias...' : 'Gerar Ideias para Thumbnail'}
            </AiButton>
          </CardContent>
        </Card>

        <Card className={generatedIdeas ? 'block' : 'hidden lg:block'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
              <Sparkles className="text-primary" />
              Ideias Geradas
            </CardTitle>
            <CardDescription>
              {generatedIdeas ? "Aqui estão as sugestões da IA para a sua thumbnail." : "As sugestões da IA aparecerão aqui após a geração."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedIdeas ? (
              <>
                <div className="space-y-1">
                  <h4 className="flex items-center gap-2 font-semibold"><Pencil className="h-4 w-4 text-muted-foreground" /> Título Sugerido</h4>
                  <p className="rounded-md border bg-secondary/30 p-3">{generatedIdeas.emoji} {generatedIdeas.title}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="flex items-center gap-2 font-semibold"><Pencil className="h-4 w-4 text-muted-foreground" /> Texto para a Thumbnail</h4>
                  <p className="rounded-md border bg-secondary/30 p-3">{generatedIdeas.overlayText}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="flex items-center gap-2 font-semibold"><PaletteIcon className="h-4 w-4 text-muted-foreground" /> Estilo Visual</h4>
                  <p className="rounded-md border bg-secondary/30 p-3">{generatedIdeas.styleDescription}</p>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center text-center text-muted-foreground">
                <p>Aguardando a geração de ideias...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
