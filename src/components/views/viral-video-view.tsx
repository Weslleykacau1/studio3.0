
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AiButton } from '@/components/ai-button';
import { handleImageUpload as handleImageUploadUtil } from '@/lib/utils';
import { UploadCloud, Bot, Image as ImageIcon, Sparkles, Pencil, Palette as PaletteIcon, Youtube, Download, Video, Copy, Wand } from 'lucide-react';
import type { ThumbnailIdeas, Scene } from '@/types';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ContentDisplay } from '../content-display';

interface ViralVideoViewProps {
  onGenerate: (referenceImageDataUri: string, videoTheme: string) => void;
  generatedIdeas: ThumbnailIdeas | null;
  loading: boolean;
  isApiConfigured: boolean;
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  youtubeAnalysisType: 'identical' | 'inspired';
  setYoutubeAnalysisType: (type: 'identical' | 'inspired') => void;
  onAnalyzeVideo: () => void;
  loadingYouTube: boolean;
  onGenerateViralScript: (videoTitle: string, imageDataUri: string | null, duration: string, videoType: 'shorts' | 'watch') => void;
  loadingViralScript: boolean;
  generatedViralScene: Scene | null;
  onLoadToCreator: (scene: Scene) => void;
  onGenerateVeoPromptForViral: (scene: Scene) => void;
  loadingVeoForViral: boolean;
  generatedVeoPromptForViral: string;
}

export default function ViralVideoView({ 
    onGenerate, generatedIdeas, loading, isApiConfigured, 
    youtubeUrl, setYoutubeUrl, youtubeAnalysisType, setYoutubeAnalysisType, onAnalyzeVideo, loadingYouTube,
    onGenerateViralScript, loadingViralScript,
    generatedViralScene,
    onLoadToCreator,
    onGenerateVeoPromptForViral,
    loadingVeoForViral,
    generatedVeoPromptForViral
}: ViralVideoViewProps) {
  const [influencerPhotoPreview, setInfluencerPhotoPreview] = useState<string | null>(null);
  const [influencerPhotoDataUri, setInfluencerPhotoDataUri] = useState<string | null>(null);
  const [videoTheme, setVideoTheme] = useState('');
  const [scriptTheme, setScriptTheme] = useState('');
  const [viralScriptDuration, setViralScriptDuration] = useState('8 seg');
  const [videoType, setVideoType] = useState<'shorts' | 'watch'>('shorts');
  const [copyVeoSuccess, setCopyVeoSuccess] = useState(false);
  const { toast } = useToast();

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
  
  const handleCopyVeo = () => {
    if (!generatedVeoPromptForViral) return;

    let textToCopy = generatedVeoPromptForViral;
    const codeBlockMatch = textToCopy.match(/^```(?:json|text|markdown)?\n([\s\S]*?)```$/);
    
    if (codeBlockMatch && codeBlockMatch[1]) {
        textToCopy = codeBlockMatch[1].trim();
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        setCopyVeoSuccess(true);
        toast({ title: 'Prompt Veo copiado!', className: 'bg-green-100' });
        setTimeout(() => setCopyVeoSuccess(false), 2000);
    }).catch(err => {
        console.error('Failed to copy Veo prompt: ', err);
        toast({ variant: 'destructive', title: 'Erro ao copiar' });
    });
  };

  const handleTransformUrl = () => {
    if (youtubeUrl.includes('/shorts/')) {
        const newUrl = youtubeUrl.replace('/shorts/', '/watch?v=');
        setYoutubeUrl(newUrl);
        toast({
            title: "Link transformado!",
            description: "O URL do Short foi convertido para o formato padrão.",
            className: "bg-green-100 text-green-800"
        });
    } else {
        toast({
            title: "Nenhuma transformação necessária",
            description: "O link já está no formato correto.",
        });
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
          <div className="space-y-4">
              <div>
                <div className="relative">
                  <Input 
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3"
                    onClick={handleTransformUrl}
                    aria-label="Transformar Link do Short"
                  >
                    <Wand className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Dica: se for um Short, clique no botão ✨ para converter o link automaticamente.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Análise</Label>
                <RadioGroup
                    value={youtubeAnalysisType}
                    onValueChange={(value) => setYoutubeAnalysisType(value as 'identical' | 'inspired')}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="identical" id="type-identical" />
                        <Label htmlFor="type-identical" className="font-normal">Vídeo com a mesma fala</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inspired" id="type-inspired" />
                        <Label htmlFor="type-inspired" className="font-normal">Roteiro Inspirado</Label>
                    </div>
                </RadioGroup>
              </div>

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
              Passo 1: Imagem de Referência
            </CardTitle>
            <CardDescription>
              Anexe uma imagem de referência e digite um tema para gerar ideias de thumbnail, ou apenas use a imagem como inspiração para o roteiro viral.
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
                    <p className="text-xs">Carregue uma imagem de referência (opcional para roteiro)</p>
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
                <Label htmlFor="video-theme" className="flex items-center gap-2"><Pencil className="h-4 w-4"/> Tema para Thumbnail</Label>
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
              Escreva um tema, escolha as opções e clique para criar um roteiro. A imagem de referência do Passo 1 é opcional para o roteiro. O resultado será guardado na sua galeria.
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

            <div className="!mt-6 rounded-lg border bg-blue-50 p-4 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
              <p className="font-bold">O que é a "Fórmula Mega Viral"?</p>
              <p className="mt-1">Ao gerar um roteiro de "Shorts", a IA é instruída a seguir uma estrutura com alto potencial de viralização, dividida nestas partes:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li><strong>Set up:</strong> Uma frase inicial que cria o contexto.</li>
                <li><strong>Hook:</strong> Uma ação inesperada que prende a atenção.</li>
                <li><strong>Escalation:</strong> O desenvolvimento da ação.</li>
                <li><strong>Climax/Punchline:</strong> O ponto alto ou a piada final.</li>
                <li><strong>CTA:</strong> Uma chamada para ação (ex: "Siga para mais!").</li>
              </ul>
            </div>

            {loadingViralScript && (
                <div className="space-y-4 pt-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-4/5" />
                </div>
            )}

            {(generatedViralScene || generatedVeoPromptForViral) && !loadingViralScript && generatedViralScene && (
                <div className="mt-4 space-y-4">
                    <Card className="bg-secondary/30">
                        <CardHeader>
                            <CardTitle className="text-lg">Roteiro Viral Gerado</CardTitle>
                        </CardHeader>
                        <CardContent>
                           {generatedViralScene.markdownScript && <ContentDisplay content={generatedViralScene.markdownScript} />}
                        </CardContent>
                    </Card>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={() => onLoadToCreator(generatedViralScene)}
                        >
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Carregar para o Criador
                        </Button>
                        <AiButton
                            onClick={() => onGenerateVeoPromptForViral(generatedViralScene)}
                            loading={loadingVeoForViral}
                            isApiConfigured={isApiConfigured}
                            variant="secondary"
                            className="border border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
                        >
                            <Video className="mr-2 h-4 w-4" />
                            {loadingVeoForViral ? 'A gerar...' : 'Gerar Prompt para Veo'}
                        </AiButton>
                    </div>

                    {generatedVeoPromptForViral && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline">
                              <Video />
                              Prompt Gerado para Veo
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ContentDisplay content={generatedVeoPromptForViral} />
                            <Button
                              onClick={handleCopyVeo}
                              variant="outline"
                              className={cn(
                                'mt-4 transition-colors',
                                copyVeoSuccess && 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100'
                              )}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              {copyVeoSuccess ? 'Copiado!' : 'Copiar Prompt Veo'}
                            </Button>
                          </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
