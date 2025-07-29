'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AiButton } from '@/components/ai-button';
import { handleImageUpload as handleImageUploadUtil } from '@/lib/utils';
import { UploadCloud, Bot, Image as ImageIcon, Sparkles, Pencil, Palette as PaletteIcon, Youtube, Download, Video as VideoIcon, Copy, Wand, FileText, Combine, BookOpen, User, Film, Clock, Camera, AlertTriangle, MessageSquareQuote, RefreshCw, Search, ThumbsUp, ListOrdered, Zap } from 'lucide-react';
import type { ThumbnailIdeas, Scene, ThumbnailStyle, Influencer, LongScriptScene, WebDocScript, WebDocScene, ScenePrompts } from '@/types';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ContentDisplay } from '../content-display';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Textarea } from '../ui/textarea';

interface AdvancedToolsViewProps {
  isApiConfigured: boolean;
  influencers: Influencer[];
  scenes: Scene[];
  onGenerateLongScript: (videoTheme: string, duration: string, cameraAngle: string, influencerId?: string, sceneId?: string) => void;
  loadingLongScript: boolean;
  generatedLongScript: { scenes: LongScriptScene[], fullScriptTxt: string } | null;
  onGenerateWebDocScript: (theme: string, duration: string, topics?: string) => void;
  loadingWebDoc: boolean;
  generatedWebDocScript: WebDocScript | null;
  onExportWebDocScript: () => void;
  onGenerateWebDocSeo: () => void;
  loadingWebDocSeo: boolean;
  generatedWebDocSeo: string;
  pastedScript: string;
  setPastedText: (script: string) => void;
  onGeneratePromptsFromScript: () => void;
  loadingImagePrompts: boolean;
  generatedScenePrompts: ScenePrompts[] | null;
  onGenerateSeoFromScript: () => void;
  loadingSeoFromScript: boolean;
  generatedSeoFromScript: string;
  onGenerateThumbnailFromScript: () => void;
  loadingThumbnailFromScript: boolean;
  generatedThumbnailFromScript: ThumbnailIdeas | null;
  onExportPrompts: () => void;
  onGenerateThumbnailFromWebDoc: () => void;
  loadingThumbnailFromWebDoc: boolean;
  generatedThumbnailFromWebDoc: ThumbnailIdeas | null;
}

export default function AdvancedToolsView({ 
    isApiConfigured,
    influencers,
    scenes,
    onGenerateLongScript,
    loadingLongScript,
    generatedLongScript,
    onGenerateWebDocScript,
    loadingWebDoc,
    generatedWebDocScript,
    onExportWebDocScript,
    onGenerateWebDocSeo,
    loadingWebDocSeo,
    generatedWebDocSeo,
    pastedScript,
    setPastedText,
    onGeneratePromptsFromScript,
    loadingImagePrompts,
    generatedScenePrompts,
    onGenerateSeoFromScript,
    loadingSeoFromScript,
    generatedSeoFromScript,
    onGenerateThumbnailFromScript,
    loadingThumbnailFromScript,
    generatedThumbnailFromScript,
    onExportPrompts,
    onGenerateThumbnailFromWebDoc,
    loadingThumbnailFromWebDoc,
    generatedThumbnailFromWebDoc,
}: AdvancedToolsViewProps) {
  
  // State for Long Script Generator
  const [longScriptTheme, setLongScriptTheme] = useState('');
  const [longScriptDuration, setLongScriptDuration] = useState('5 minutes');
  const [longScriptCameraAngle, setLongScriptCameraAngle] = useState('Câmera Dinâmica (Criatividade da IA)');
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string | undefined>(undefined);
  const [selectedSceneId, setSelectedSceneId] = useState<string | undefined>(undefined);
  const [copiedScene, setCopiedScene] = useState<number | null>(null);

  // State for Web Doc Generator
  const [webDocTheme, setWebDocTheme] = useState('');
  const [webDocTopics, setWebDocTopics] = useState('');
  const [webDocDuration, setWebDocDuration] = useState('5 minutes');
  const [copiedWebDocScene, setCopiedWebDocScene] = useState<{ type: 'script' | 'image' | 'video', index: number } | null>(null);

  const [copySeoSuccess, setCopySeoSuccess] = useState(false);
  const [copiedImagePrompt, setCopiedImagePrompt] = useState<number | null>(null);
  const [copiedVideoPrompt, setCopiedVideoPrompt] = useState<number | null>(null);


  const { toast } = useToast();

  const handleDownloadImage = (dataUri: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateLongScriptClick = () => {
    if (longScriptTheme) {
      onGenerateLongScript(longScriptTheme, longScriptDuration, longScriptCameraAngle, selectedInfluencerId, selectedSceneId);
    }
  };

  const handleGenerateWebDocClick = () => {
    if (webDocTheme) {
      onGenerateWebDocScript(webDocTheme, webDocDuration, webDocTopics);
    }
  };
  
  const handleCopySingleScene = (content: string, index: number) => {
    navigator.clipboard.writeText(content).then(() => {
        setCopiedScene(index);
        toast({ variant: 'success', title: `Cena ${index + 1} copiada!` });
        setTimeout(() => setCopiedScene(null), 2000);
    }).catch(err => {
        console.error('Failed to copy scene text: ', err);
        toast({ variant: 'destructive', title: 'Erro ao copiar' });
    });
  };

  const handleCopyWebDocScenePart = (content: string, type: 'script' | 'image' | 'video', index: number) => {
    navigator.clipboard.writeText(content).then(() => {
        setCopiedWebDocScene({ type, index });
        const partName = type === 'script' ? 'Roteiro' : (type === 'image' ? 'Prompt de Imagem' : 'Prompt de Vídeo');
        toast({ variant: 'success', title: `${partName} da Cena ${index + 1} copiado!` });
        setTimeout(() => setCopiedWebDocScene(null), 2000);
    }).catch(err => {
        console.error('Failed to copy web doc scene text: ', err);
        toast({ variant: 'destructive', title: 'Erro ao copiar' });
    });
  };

  const handleCopyPrompt = (prompt: string, type: 'image' | 'video', index: number) => {
    navigator.clipboard.writeText(prompt).then(() => {
      const stateSetter = type === 'image' ? setCopiedImagePrompt : setCopiedVideoPrompt;
      const toastTitle = type === 'image' ? 'Prompt de Imagem copiado!' : 'Prompt de Vídeo copiado!';
      stateSetter(index);
      toast({ variant: 'success', title: toastTitle });
      setTimeout(() => stateSetter(null), 2000);
    }).catch(err => {
        console.error('Failed to copy prompt: ', err);
        toast({ variant: 'destructive', title: 'Erro ao copiar' });
    });
};

  const handleExportFullScript = () => {
    if (!generatedLongScript || !generatedLongScript.fullScriptTxt) return;
    const blob = new Blob([generatedLongScript.fullScriptTxt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'roteiro_completo.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ variant: 'success', title: 'Roteiro completo exportado como TXT!' });
  };


  const handleCopySeo = () => {
    if (!generatedWebDocSeo) return;
    navigator.clipboard.writeText(generatedWebDocSeo).then(() => {
        setCopySeoSuccess(true);
        toast({ variant: 'success', title: 'Conteúdo SEO copiado!' });
        setTimeout(() => setCopySeoSuccess(false), 2000);
    }).catch(err => {
        console.error('Failed to copy SEO text: ', err);
        toast({ variant: 'destructive', title: 'Erro ao copiar' });
    });
  };


  return (
    <div className="space-y-8">
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                Gerador de Roteiro de Vídeo Longo
              </CardTitle>
              <CardDescription>
                  Crie roteiros completos para vídeos mais longos. Opcionalmente, carregue um influenciador e um cenário para dar contexto à IA.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                      <Label htmlFor="long-script-influencer" className="flex items-center gap-2"><User />Carregar Personagem (Opcional)</Label>
                      <Select onValueChange={setSelectedInfluencerId} value={selectedInfluencerId}>
                          <SelectTrigger id="long-script-influencer"><SelectValue placeholder="Selecione um influenciador..." /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {influencers.map(inf => <SelectItem key={inf.id} value={inf.id!}>{inf.name}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="long-script-scene" className="flex items-center gap-2"><Film />Carregar Cenário (Opcional)</Label>
                      <Select onValueChange={setSelectedSceneId} value={selectedSceneId}>
                          <SelectTrigger id="long-script-scene"><SelectValue placeholder="Selecione um cenário..." /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {scenes.map(sc => <SelectItem key={sc.id} value={sc.id!}>{sc.title || "Cena sem título"}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="long-script-camera" className="flex items-center gap-2"><Camera />Ângulo da Câmera</Label>
                  <Select value={longScriptCameraAngle} onValueChange={setLongScriptCameraAngle}>
                      <SelectTrigger id="long-script-camera"><SelectValue placeholder="Selecione o ângulo da câmera" /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Câmera Dinâmica (Criatividade da IA)">Câmera Dinâmica (Criatividade da IA)</SelectItem>
                          <SelectItem value="Ponto de Vista (Influenciador)">Ponto de Vista (Influenciador)</SelectItem>
                          <SelectItem value="Vlog (Conversacional)">Vlog (Conversacional)</SelectItem>
                          <SelectItem value="Selfie (Plano próximo, filmado pelo próprio)">Selfie</SelectItem>
                          <SelectItem value="Médio (Da cintura para cima)">Médio</SelectItem>
                          <SelectItem value="Plano Geral (Corpo inteiro)">Plano Geral</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="long-script-theme" className="flex items-center gap-2"><Pencil />Tema do Roteiro</Label>
                  <Input 
                      id="long-script-theme"
                      value={longScriptTheme}
                      onChange={(e) => setLongScriptTheme(e.target.value)}
                      placeholder="Ex: A história da inteligência artificial, Um dia na vida de um programador..."
                  />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="long-script-duration" className="flex items-center gap-2"><Clock />Duração do Vídeo</Label>
                  <Select value={longScriptDuration} onValueChange={setLongScriptDuration}>
                      <SelectTrigger id="long-script-duration"><SelectValue placeholder="Selecione a duração" /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="5 minutes">5 minutos</SelectItem>
                          <SelectItem value="8 minutes">8 minutos</SelectItem>
                          <SelectItem value="10 minutes">10 minutos</SelectItem>
                          <SelectItem value="15 minutes">15 minutos</SelectItem>
                          <SelectItem value="20 minutes">20 minutos</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <AiButton
                  onClick={handleGenerateLongScriptClick}
                  loading={loadingLongScript}
                  isApiConfigured={isApiConfigured}
                  disabled={!longScriptTheme.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg transition-transform hover:scale-105"
              >
                  <Bot className="mr-2 h-5 w-5" />
                  Gerar Roteiro Longo
              </AiButton>
          </CardContent>
      </Card>

      {loadingLongScript && (
          <Card>
              <CardContent className="p-6">
                  <div className="space-y-4 pt-4">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-20 w-full" />
                  </div>
              </CardContent>
          </Card>
      )}

      {generatedLongScript && !loadingLongScript && (
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 font-headline">
                      <span>Roteiro Gerado</span>
                      <Button onClick={handleExportFullScript} variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" /> Exportar para TXT
                      </Button>
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  {generatedLongScript.scenes.map((scene, index) => (
                      <Card key={index} className="bg-secondary/30">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                              <CardTitle className="text-lg">Cena {index + 1}: {scene.title}</CardTitle>
                              <Button
                                  onClick={() => handleCopySingleScene(scene.content, index)}
                                  variant="ghost"
                                  size="icon"
                                  className={cn('transition-colors h-8 w-8', copiedScene === index && 'text-green-600 hover:text-green-700')}
                              >
                                  <Copy className="h-4 w-4" />
                              </Button>
                          </CardHeader>
                          <CardContent>
                              <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap">
                                  {scene.content}
                              </div>
                          </CardContent>
                      </Card>
                  ))}
              </CardContent>
          </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                <BookOpen />
                Gerador de Roteiro para Web Doc
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="default" className="border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <AlertTriangle className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-800 dark:text-blue-300">Como usar o Gerador de Roteiro para Web Doc</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-400">
              Esta ferramenta cria um roteiro completo para um documentário, cena por cena. Para cada cena, a IA gera a narração em português e um "prompt" de imagem em inglês. Use este prompt em geradores de imagem (como Midjourney ou DALL-E) para criar os visuais que acompanharão a narração, produzindo um storyboard completo.
            </AlertDescription>
          </Alert>
            <div className="space-y-2">
                <Label htmlFor="webdoc-theme" className="flex items-center gap-2"><Pencil />Tema do Documentário</Label>
                <Input 
                    id="webdoc-theme"
                    value={webDocTheme}
                    onChange={(e) => setWebDocTheme(e.target.value)}
                    placeholder="Ex: A ascensão dos impérios digitais, Os segredos do oceano profundo..."
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="webdoc-topics" className="flex items-center gap-2"><ListOrdered />Tópicos a Cobrir (Opcional)</Label>
                <Input 
                    id="webdoc-topics"
                    value={webDocTopics}
                    onChange={(e) => setWebDocTopics(e.target.value)}
                    placeholder="Ex: A origem da internet, As primeiras redes sociais, O futuro da conexão..."
                />
                <p className="text-xs text-muted-foreground">Separe os tópicos com vírgulas.</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="webdoc-duration" className="flex items-center gap-2"><Clock />Duração do Vídeo</Label>
                <Select value={webDocDuration} onValueChange={setWebDocDuration}>
                    <SelectTrigger id="webdoc-duration"><SelectValue placeholder="Selecione a duração" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5 minutes">5 minutos</SelectItem>
                        <SelectItem value="10 minutes">10 minutos</SelectItem>
                        <SelectItem value="15 minutes">15 minutos</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <AiButton
                onClick={handleGenerateWebDocClick}
                loading={loadingWebDoc}
                isApiConfigured={isApiConfigured}
                disabled={!webDocTheme.trim()}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-lg transition-transform hover:scale-105"
            >
                <Bot className="mr-2 h-5 w-5" />
                Gerar Roteiro de Web Doc
            </AiButton>
        </CardContent>
      </Card>
        
      {loadingWebDoc && (
          <Card>
              <CardContent className="p-6">
                  <div className="space-y-4 pt-4">
                      <Skeleton className="h-8 w-1/2" />
                      <div className="space-y-2 rounded-lg border p-4">
                          <Skeleton className="h-6 w-1/4" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2 rounded-lg border p-4">
                          <Skeleton className="h-6 w-1/4" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                      </div>
                  </div>
              </CardContent>
          </Card>
      )}

      {generatedWebDocScript && !loadingWebDoc && (
          <Card>
              <CardHeader>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="font-headline">
                            {generatedWebDocScript.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Roteiro e prompts de imagem gerados
                        </CardDescription>
                    </div>
                    <div className="flex w-full flex-shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
                        <AiButton onClick={onGenerateWebDocSeo} loading={loadingWebDocSeo} isApiConfigured={isApiConfigured} variant="secondary" size="sm">
                            <Bot className="mr-2 h-4 w-4" /> Gerar SEO
                        </AiButton>
                        <AiButton onClick={onGenerateThumbnailFromWebDoc} loading={loadingThumbnailFromWebDoc} isApiConfigured={isApiConfigured} variant="secondary" size="sm">
                            <ThumbsUp className="mr-2 h-4 w-4" /> Gerar Thumbnail
                        </AiButton>
                        <Button onClick={onExportWebDocScript} variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" /> Exportar para TXT
                        </Button>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                  {generatedWebDocScript.scenes.map((scene, index) => (
                      <Card key={index} className="overflow-hidden bg-secondary/30">
                          <CardHeader className="bg-muted/40 p-3">
                              <CardTitle className="text-base">Cena {scene.sceneNumber}</CardTitle>
                          </CardHeader>
                          <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2">
                            <div className="bg-background p-4">
                                <Label className="flex items-center gap-2 text-sm font-semibold">Roteiro (PT-BR)</Label>
                                <p className="mt-2 text-sm">{scene.sceneScript}</p>
                                <Button
                                    onClick={() => handleCopyWebDocScenePart(scene.sceneScript, 'script', index)}
                                    variant="ghost" size="sm" className="mt-2">
                                    <Copy className={cn('mr-2 h-3 w-3', copiedWebDocScene?.type === 'script' && copiedWebDocScene?.index === index && 'text-green-600')} />
                                    {copiedWebDocScene?.type === 'script' && copiedWebDocScene?.index === index ? 'Copiado!' : 'Copiar Roteiro'}
                                </Button>
                            </div>
                            <div className="flex flex-col gap-px bg-border">
                                <div className="bg-background p-4">
                                    <Label className="flex items-center gap-2 text-sm font-semibold"><ImageIcon className="h-4 w-4" />Prompt de Imagem (EN)</Label>
                                    <p className="mt-2 font-mono text-xs">{scene.imagePrompt}</p>
                                    <Button
                                        onClick={() => handleCopyWebDocScenePart(scene.imagePrompt, 'image', index)}
                                        variant="ghost" size="sm" className="mt-2">
                                        <Copy className={cn('mr-2 h-3 w-3', copiedWebDocScene?.type === 'image' && copiedWebDocScene?.index === index && 'text-green-600')} />
                                        {copiedWebDocScene?.type === 'image' && copiedWebDocScene?.index === index ? 'Copiado!' : 'Copiar'}
                                    </Button>
                                </div>
                                <div className="bg-background p-4">
                                    <Label className="flex items-center gap-2 text-sm font-semibold"><VideoIcon className="h-4 w-4" />Prompt de Vídeo (EN)</Label>
                                    <p className="mt-2 font-mono text-xs">{scene.videoPrompt}</p>
                                    <Button
                                        onClick={() => handleCopyWebDocScenePart(scene.videoPrompt, 'video', index)}
                                        variant="ghost" size="sm" className="mt-2">
                                        <Copy className={cn('mr-2 h-3 w-3', copiedWebDocScene?.type === 'video' && copiedWebDocScene?.index === index && 'text-green-600')} />
                                        {copiedWebDocScene?.type === 'video' && copiedWebDocScene?.index === index ? 'Copiado!' : 'Copiar'}
                                    </Button>
                                </div>
                            </div>
                          </div>
                      </Card>
                  ))}
              </CardContent>
          </Card>
      )}

      {loadingThumbnailFromWebDoc && (
          <Card>
              <CardHeader><CardTitle>A Gerar Ideias de Thumbnail para o Web Doc...</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Skeleton className="h-[150px] w-full" />
                    <Skeleton className="h-[150px] w-full" />
                </div>
              </CardContent>
          </Card>
      )}
      
      {generatedThumbnailFromWebDoc && !loadingThumbnailFromWebDoc && (
          <Card>
              <CardHeader><CardTitle>Ideias de Thumbnail Geradas para o Web Doc</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Image src={generatedThumbnailFromWebDoc.generatedImage1DataUri} alt="Thumbnail 1" width={400} height={225} className="w-full rounded-md border object-contain" />
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownloadImage(generatedThumbnailFromWebDoc.generatedImage1DataUri, 'thumbnail_webdoc_1.png')}>
                        <Download className="mr-2 h-4 w-4" /> Baixar Opção 1
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Image src={generatedThumbnailFromWebDoc.generatedImage2DataUri} alt="Thumbnail 2" width={400} height={225} className="w-full rounded-md border object-contain" />
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownloadImage(generatedThumbnailFromWebDoc.generatedImage2DataUri, 'thumbnail_webdoc_2.png')}>
                        <Download className="mr-2 h-4 w-4" /> Baixar Opção 2
                    </Button>
                  </div>
                </div>
                 <div className="space-y-1 pt-4">
                  <h4 className="flex items-center gap-2 font-semibold"><Pencil className="h-4 w-4 text-muted-foreground" /> Título Sugerido</h4>
                  <p className="rounded-md border bg-secondary/30 p-3">{generatedThumbnailFromWebDoc.emoji} {generatedThumbnailFromWebDoc.title}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="flex items-center gap-2 font-semibold"><PaletteIcon className="h-4 w-4 text-muted-foreground" /> Estilo Visual</h4>
                  <p className="rounded-md border bg-secondary/30 p-3">{generatedThumbnailFromWebDoc.styleDescription}</p>
                </div>
              </CardContent>
          </Card>
      )}
      
      {generatedWebDocSeo && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Bot />
                    SEO Gerado para Web Doc
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ContentDisplay content={generatedWebDocSeo} />
                <Button
                  onClick={handleCopySeo}
                  variant="outline"
                  className={cn(
                    'mt-4 transition-colors',
                    copySeoSuccess && 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100'
                  )}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copySeoSuccess ? 'Copiado!' : 'Copiar SEO'}
                </Button>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                <ImageIcon />
                Gerador de Prompts de Imagem e Vídeo a Partir de Roteiro
            </CardTitle>
            <CardDescription>
                Cole o seu roteiro para a IA criar os prompts de imagem e vídeo para cada cena.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="pasted-script" className="flex items-center gap-2">Cole o seu roteiro aqui (Seu roteiro completo que vamos gerar o prompt de todas as cenas)</Label>
                <Textarea
                    id="pasted-script"
                    value={pastedScript}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="CENA 1&#10;EXT. CASA ABANDONADA - DIA&#10;Um jovem aventureiro olha para a casa com uma mistura de medo e excitação.&#10;&#10;JOVEM&#10;(Para a câmara)&#10;Estão prontos para isto?..."
                    className="min-h-[150px] font-mono text-xs"
                />
            </div>
            <AiButton
                onClick={onGeneratePromptsFromScript}
                loading={loadingImagePrompts}
                isApiConfigured={isApiConfigured}
                disabled={!pastedScript.trim()}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg transition-transform hover:scale-105"
            >
                <Bot className="mr-2 h-5 w-5" />
                Gerar Prompts de Imagem e Vídeo
            </AiButton>
        </CardContent>
      </Card>

      {loadingImagePrompts && (
          <Card>
              <CardContent className="p-6">
                  <div className="space-y-4 pt-4">
                      <div className="space-y-2 rounded-lg border p-4">
                          <Skeleton className="h-6 w-1/4" />
                          <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                      </div>
                      <div className="space-y-2 rounded-lg border p-4">
                          <Skeleton className="h-6 w-1/4" />
                          <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                      </div>
                  </div>
              </CardContent>
          </Card>
      )}

      {generatedScenePrompts && !loadingImagePrompts && (
          <Card>
              <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="font-headline">
                      Prompts Gerados por Cena
                  </CardTitle>
                   <div className="flex gap-2">
                      <AiButton onClick={onGenerateSeoFromScript} loading={loadingSeoFromScript} isApiConfigured={isApiConfigured} variant="secondary" size="sm">
                          <Search className="mr-2 h-4 w-4" /> Gerar SEO
                      </AiButton>
                      <AiButton onClick={onGenerateThumbnailFromScript} loading={loadingThumbnailFromScript} isApiConfigured={isApiConfigured} variant="secondary" size="sm">
                          <ThumbsUp className="mr-2 h-4 w-4" /> Gerar Thumbnail
                      </AiButton>
                      <Button onClick={onExportPrompts} variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" /> Exportar
                      </Button>
                  </div>
              </CardHeader>
              <CardContent className="space-y-4">
                  {generatedScenePrompts.map((prompt, index) => (
                      <Card key={index} className="overflow-hidden bg-secondary/30">
                          <CardHeader className="bg-muted/40 p-3">
                              <CardTitle className="text-base">Cena {prompt.sceneNumber}</CardTitle>
                          </CardHeader>
                          <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2">
                               <div className="bg-background p-4">
                                  <Label className="flex items-center gap-2 text-sm font-semibold"><ImageIcon className="h-4 w-4" />Prompt de Imagem (EN)</Label>
                                  <p className="mt-2 font-mono text-xs">{prompt.imagePrompt}</p>
                                  <Button onClick={() => handleCopyPrompt(prompt.imagePrompt, 'image', index)} variant="ghost" size="sm" className="mt-2">
                                      <Copy className={cn('mr-2 h-3 w-3', copiedImagePrompt === index && 'text-green-600')} />
                                      {copiedImagePrompt === index ? 'Copiado!' : 'Copiar'}
                                  </Button>
                              </div>
                              <div className="bg-background p-4">
                                  <Label className="flex items-center gap-2 text-sm font-semibold"><VideoIcon className="h-4 w-4" />Prompt de Vídeo (EN)</Label>
                                  <p className="mt-2 font-mono text-xs">{prompt.videoPrompt}</p>
                                  <Button onClick={() => handleCopyPrompt(prompt.videoPrompt, 'video', index)} variant="ghost" size="sm" className="mt-2">
                                      <Copy className={cn('mr-2 h-3 w-3', copiedVideoPrompt === index && 'text-green-600')} />
                                      {copiedVideoPrompt === index ? 'Copiado!' : 'Copiar'}
                                  </Button>
                              </div>
                          </div>
                      </Card>
                  ))}
              </CardContent>
          </Card>
      )}
      
      {generatedSeoFromScript && (
          <Card>
              <CardHeader><CardTitle>SEO Gerado do Roteiro</CardTitle></CardHeader>
              <CardContent>
                  <ContentDisplay content={generatedSeoFromScript} />
              </CardContent>
          </Card>
      )}

      {loadingThumbnailFromScript && (
          <Card>
              <CardHeader><CardTitle>A Gerar Ideias de Thumbnail...</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Skeleton className="h-[150px] w-full" />
                    <Skeleton className="h-[150px] w-full" />
                </div>
              </CardContent>
          </Card>
      )}
      
      {generatedThumbnailFromScript && !loadingThumbnailFromScript && (
          <Card>
              <CardHeader><CardTitle>Ideias de Thumbnail Geradas do Roteiro</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Image src={generatedThumbnailFromScript.generatedImage1DataUri} alt="Thumbnail 1" width={400} height={225} className="w-full rounded-md border object-contain" />
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownloadImage(generatedThumbnailFromScript.generatedImage1DataUri, 'thumbnail_1.png')}>
                        <Download className="mr-2 h-4 w-4" /> Baixar Opção 1
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Image src={generatedThumbnailFromScript.generatedImage2DataUri} alt="Thumbnail 2" width={400} height={225} className="w-full rounded-md border object-contain" />
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownloadImage(generatedThumbnailFromScript.generatedImage2DataUri, 'thumbnail_2.png')}>
                        <Download className="mr-2 h-4 w-4" /> Baixar Opção 2
                    </Button>
                  </div>
                </div>
                 <div className="space-y-1 pt-4">
                  <h4 className="flex items-center gap-2 font-semibold"><Pencil className="h-4 w-4 text-muted-foreground" /> Título Sugerido</h4>
                  <p className="rounded-md border bg-secondary/30 p-3">{generatedThumbnailFromScript.emoji} {generatedThumbnailFromScript.title}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="flex items-center gap-2 font-semibold"><PaletteIcon className="h-4 w-4 text-muted-foreground" /> Estilo Visual</h4>
                  <p className="rounded-md border bg-secondary/30 p-3">{generatedThumbnailFromScript.styleDescription}</p>
                </div>
              </CardContent>
          </Card>
      )}
    </div>
  );
}
