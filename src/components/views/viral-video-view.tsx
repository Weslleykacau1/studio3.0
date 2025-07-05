
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AiButton } from '@/components/ai-button';
import { handleImageUpload as handleImageUploadUtil } from '@/lib/utils';
import { UploadCloud, Bot, Image as ImageIcon, Sparkles, Pencil, Palette as PaletteIcon, Youtube, Download } from 'lucide-react';
import type { ThumbnailIdeas, Scene } from '@/types';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface ViralVideoViewProps {
  onGenerate: (referenceImageDataUri: string, videoTheme: string) => void;
  generatedIdeas: ThumbnailIdeas | null;
  loading: boolean;
  isApiConfigured: boolean;
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  onAnalyzeVideo: () => void;
  loadingYouTube: boolean;
  onGenerateViralScript: (videoTitle: string, imageDataUri: string | null, duration: string, videoType: 'shorts' | 'watch') => void;
  loadingViralScript: boolean;
  generatedViralScene: Scene | null;
}

export default function ViralVideoView({ 
    onGenerate, generatedIdeas, loading, isApiConfigured, 
    youtubeUrl, setYoutubeUrl, onAnalyzeVideo, loadingYouTube,
    onGenerateViralScript, loadingViralScript,
    generatedViralScene
}: ViralVideoViewProps) {
  const [influencerPhotoPreview, setInfluencerPhotoPreview] = useState<string | null>(null);
  const [influencerPhotoDataUri, setInfluencerPhotoDataUri] = useState<string | null>(null);
  const [videoTheme, setVideoTheme] = useState('');
  const [scriptTheme, setScriptTheme] = useState('');
  const [viralScriptDuration, setViralScriptDuration] = useState('8 seg');
  const [videoType, setVideoType] = useState<'shorts' | 'watch'>('shorts');

  const handleInfluencerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUploadUtil(e, ({ preview, base64, type }) => {
      setInfluencerPhotoPreview(preview);
      setInfluencerPhotoDataUri(`data:${type};base64,${base64}`);
    });
  };

  const handleGenerateClick = () => {
    if (influencerPhotoDataUri && videoTheme) {
      onGenerate(influencerPhotoDataUri, videoTheme);
    }
  };

  const handleDownloadImage = (dataUri: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateViralScriptClick = () => {
    if (scriptTheme) {
        onGenerateViralScript(scriptTheme, influencerPhotoDataUri, viralScriptDuration, videoType);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-headline text-2xl">
            <Youtube />
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
                  isApiConfigured={isApiConfigured}
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
              <ImageIcon />
              Passo 1: Gerar Ideias para Thumbnail
            </CardTitle>
            <CardDescription>
              Anexe uma imagem de referência e digite o tema para a IA gerar duas opções de thumbnail com alto potencial de clique.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
              <Label htmlFor="reference-image-upload" className="flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Imagem de Referência</Label>
              <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 text-center">
                {influencerPhotoPreview ? (
                  <Image src={influencerPhotoPreview} alt="Prévia da referência" width={200} height={200} className="max-h-[150px] w-auto rounded-md object-contain" />
                ) : (
                  <div className="space-y-2 py-8 text-muted-foreground">
                    <ImageIcon className="mx-auto h-10 w-10" />
                    <p className="text-xs">Carregue uma imagem de referência</p>
                  </div>
                )}
                 <input id="reference-image-upload" type="file" className="hidden" accept="image/*" onChange={handleInfluencerPhotoUpload} />
                 <Button asChild variant="outline" size="sm" className="mt-4">
                    <Label htmlFor="reference-image-upload" className="cursor-pointer gap-2">
                        <UploadCloud className="h-4 w-4" /> 
                        {influencerPhotoPreview ? 'Trocar' : 'Escolher'}
                    </Label>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="video-theme" className="flex items-center gap-2"><Pencil className="h-4 w-4"/> Tema do Vídeo</Label>
                <Input 
                    id="video-theme"
                    value={videoTheme}
                    onChange={(e) => setVideoTheme(e.target.value)}
                    placeholder="Ex: Minha rotina de skincare, Review do novo jogo, etc."
                />
            </div>
            
            <AiButton
              onClick={handleGenerateClick}
              loading={loading}
              isApiConfigured={isApiConfigured}
              disabled={!influencerPhotoPreview || !videoTheme.trim()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Bot className="mr-2 h-5 w-5" />
              {loading ? 'A gerar ideias...' : 'Gerar Ideias para Thumbnail'}
            </AiButton>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
              <Sparkles />
              Passo 2: Resultado da Thumbnail
            </CardTitle>
            <CardDescription>
              Aqui estão as sugestões da IA. Use o botão no passo 3 para gerar um roteiro viral.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Skeleton className="h-[150px] w-full" />
                        <Skeleton className="h-[150px] w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : generatedIdeas ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {generatedIdeas.generatedImage1DataUri && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Opção 1</h4>
                      <Image src={generatedIdeas.generatedImage1DataUri} alt="Thumbnail gerada 1" width={400} height={225} className="w-full rounded-md border object-contain" />
                       <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDownloadImage(generatedIdeas.generatedImage1DataUri, 'thumbnail_opcao_1.png')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Opção 1
                      </Button>
                    </div>
                  )}
                  {generatedIdeas.generatedImage2DataUri && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Opção 2</h4>
                      <Image src={generatedIdeas.generatedImage2DataUri} alt="Thumbnail gerada 2" width={400} height={225} className="w-full rounded-md border object-contain" />
                       <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDownloadImage(generatedIdeas.generatedImage2DataUri, 'thumbnail_opcao_2.png')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Opção 2
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-1 pt-4">
                  <h4 className="flex items-center gap-2 font-semibold"><Pencil className="h-4 w-4 text-muted-foreground" /> Título Sugerido</h4>
                  <p className="rounded-md border bg-secondary/30 p-3">{generatedIdeas.emoji} {generatedIdeas.title}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="flex items-center gap-2 font-semibold"><PaletteIcon className="h-4 w-4 text-muted-foreground" /> Estilo Visual</h4>
                  <p className="rounded-md border bg-secondary/30 p-3">{generatedIdeas.styleDescription}</p>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center text-center text-muted-foreground">
                <p>Aguardando a geração de ideias...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
              <Pencil />
              Passo 3: Gerar Roteiro Viral
            </CardTitle>
            <CardDescription>
              Escreva um tema, opcionalmente use a imagem de referência acima, e clique no botão para criar um roteiro curto e viral. O resultado será guardado na sua galeria.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="script-theme" className="flex items-center gap-2"><Pencil className="h-4 w-4"/> Tema do Roteiro Viral</Label>
                <Input 
                    id="script-theme"
                    value={scriptTheme}
                    onChange={(e) => setScriptTheme(e.target.value)}
                    placeholder="Ex: Situação inesperada cozinhando"
                />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="script-duration">Duração</Label>
                    <Select value={viralScriptDuration} onValueChange={setViralScriptDuration}>
                        <SelectTrigger id="script-duration">
                            <SelectValue placeholder="Selecione a duração" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="8 seg">8 seg</SelectItem>
                            <SelectItem value="10 seg">10 seg</SelectItem>
                            <SelectItem value="20 seg">20 seg</SelectItem>
                            <SelectItem value="30 seg">30 seg</SelectItem>
                            <SelectItem value="40 seg">40 seg</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Tipo de Vídeo</Label>
                    <RadioGroup
                        value={videoType}
                        onValueChange={(value) => setVideoType(value as 'shorts' | 'watch')}
                        className="flex h-10 items-center gap-4"
                    >
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="shorts" id="type-shorts" />
                        <Label htmlFor="type-shorts" className="font-normal">Shorts</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="watch" id="type-watch" />
                        <Label htmlFor="type-watch" className="font-normal">Watch</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
            <AiButton
                onClick={handleGenerateViralScriptClick}
                loading={loadingViralScript}
                isApiConfigured={isApiConfigured}
                disabled={!scriptTheme.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition-transform hover:scale-105"
            >
                <Bot className="mr-2 h-5 w-5" />
                Gerar Roteiro Mega Viral
            </AiButton>
            <p className="text-center text-xs text-muted-foreground">
                Basta um tema para gerar. Uma imagem de referência no Passo 1 é opcional.
            </p>

            {loadingViralScript && (
                <div className="space-y-4 pt-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-4/5" />
                </div>
            )}

            {generatedViralScene && !loadingViralScript && (
                <Card className="mt-4 bg-secondary/30">
                    <CardHeader>
                        <CardTitle className="text-lg">{generatedViralScene.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Cenário:</strong> {generatedViralScene.setting}</p>
                        <p><strong>Ação:</strong> {generatedViralScene.action}</p>
                        <p><strong>Diálogo:</strong> {generatedViralScene.dialogue}</p>
                    </CardContent>
                </Card>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
