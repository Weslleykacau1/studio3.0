
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AiButton } from '@/components/ai-button';
import { handleImageUpload as handleImageUploadUtil } from '@/lib/utils';
import { UploadCloud, Bot, Sparkles, Pencil, Youtube, Download, Video as VideoIcon, Copy, Wand, FileText, Combine, BookOpen, User, Film, Clock, Camera, AlertTriangle, MessageSquareQuote, RefreshCw, Search, ThumbsUp, ListOrdered, Zap } from 'lucide-react';
import type { Scene } from '@/types';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ContentDisplay } from '../content-display';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ViralToolsViewProps {
  isApiConfigured: boolean;
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  onAnalyzeVideo: () => void;
  loadingYouTube: boolean;
  onGenerateViralScript: (videoTitle: string, imageDataUri: string | null, duration: string, videoType: 'shorts' | 'watch', cta: string | undefined) => void;
  loadingViralScript: boolean;
  generatedViralScene: Scene | null;
  onLoadToCreator: (scene: Scene) => void;
  onTranscribeUploadedVideo: (videoDataUri: string) => void;
  loadingUploadedVideoTranscription: boolean;
  generatedUploadedVideoTranscription: string;
  onGenerateScriptFromTranscription: (imageDataUri?: string) => void;
  loadingScriptFromTranscription: boolean;
  onGenerateParaphrasedScriptFromTranscription: (imageDataUri?: string) => void;
  loadingParaphrasedScript: boolean;
  onClearTranscription: () => void;
}

export default function ViralToolsView({ 
    isApiConfigured, 
    youtubeUrl, setYoutubeUrl, onAnalyzeVideo, loadingYouTube,
    onGenerateViralScript, loadingViralScript,
    generatedViralScene,
    onLoadToCreator,
    onTranscribeUploadedVideo,
    loadingUploadedVideoTranscription,
    generatedUploadedVideoTranscription,
    onGenerateScriptFromTranscription,
    loadingScriptFromTranscription,
    onGenerateParaphrasedScriptFromTranscription,
    loadingParaphrasedScript,
    onClearTranscription,
}: ViralToolsViewProps) {
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [mainImageDataUri, setMainImageDataUri] = useState<string | null>(null);
  const [scriptTheme, setScriptTheme] = useState('');
  const [viralScriptDuration, setViralScriptDuration] = useState('8 seg');
  const [videoType, setVideoType] = useState<'shorts' | 'watch'>('shorts');
  const [copyViralScriptSuccess, setCopyViralScriptSuccess] = useState(false);
  const [copyUploadedVideoTranscriptionSuccess, setCopyUploadedVideoTranscriptionSuccess] = useState(false);
  const [uploadedVideoUri, setUploadedVideoUri] = useState<string | null>(null);
  const [transcriptionScenePhotoPreview, setTranscriptionScenePhotoPreview] = useState<string | null>(null);
  const [transcriptionScenePhotoDataUri, setTranscriptionScenePhotoDataUri] = useState<string | null>(null);
  
  // State for Viral Script CTA
  const [ctaOption, setCtaOption] = useState('Siga para mais!');
  const [customCta, setCustomCta] = useState('');

  const { toast } = useToast();

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value);
  };

  const handleConvertYoutubeUrl = () => {
    if (youtubeUrl.includes('/shorts/')) {
        setYoutubeUrl(youtubeUrl.replace('/shorts/', '/watch?v='));
    }
  };

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUploadUtil(e, ({ preview, base64, type }) => {
      setMainImagePreview(preview);
      setMainImageDataUri(`data:${type};base64,${base64}`);
    });
  };
  
  const handleTranscriptionScenePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUploadUtil(e, ({ preview, base64, type }) => {
      setTranscriptionScenePhotoPreview(preview);
      setTranscriptionScenePhotoDataUri(`data:${type};base64,${base64}`);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUploadUtil(e, ({ preview }) => {
      setUploadedVideoUri(preview);
      onClearTranscription();
      setTranscriptionScenePhotoPreview(null);
      setTranscriptionScenePhotoDataUri(null);
    });
  };

  const handleGenerateViralScriptClick = () => {
    if (scriptTheme) {
        const cta = ctaOption === 'personalizado' ? customCta : ctaOption;
        onGenerateViralScript(scriptTheme, mainImageDataUri, viralScriptDuration, videoType, cta);
    }
  };

  const handleTranscribeUploadedVideoClick = () => {
    if (uploadedVideoUri) {
      onTranscribeUploadedVideo(uploadedVideoUri);
    }
  };
  
  const handleCopyScript = (script: string | undefined, setSuccess: (val: boolean) => void) => {
    if (!script) return;

    let textToCopy = script;
    const codeBlockMatch = textToCopy.match(/^```(?:json|text|markdown)?\n([\s\S]*?)```$/);
    
    if (codeBlockMatch && codeBlockMatch[1]) {
        textToCopy = codeBlockMatch[1].trim();
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        setSuccess(true);
        toast({ variant: 'success', title: 'Roteiro copiado!' });
        setTimeout(() => setSuccess(false), 2000);
    }).catch(err => {
        console.error('Failed to copy script text: ', err);
        toast({ variant: 'destructive', title: 'Erro ao copiar' });
    });
  };

  const handleCopyUploadedVideoTranscription = () => {
    if (!generatedUploadedVideoTranscription) return;
    navigator.clipboard.writeText(generatedUploadedVideoTranscription).then(() => {
        setCopyUploadedVideoTranscriptionSuccess(true);
        toast({ variant: 'success', title: 'Transcrição copiada!' });
        setTimeout(() => setCopyUploadedVideoTranscriptionSuccess(false), 2000);
    }).catch(err => {
        console.error('Failed to copy transcription text: ', err);
        toast({ variant: 'destructive', title: 'Erro ao copiar' });
    });
  };

  const uploadButton = (id: string, text: string, disabledText: string, handler: (e: React.ChangeEvent<HTMLInputElement>) => void, fileType: 'image/*' | 'video/*') => {
      const buttonContent = (
          <Button asChild variant="outline" size="sm" className="mt-4" disabled={!isApiConfigured}>
              <Label htmlFor={id} className={`cursor-pointer gap-2 ${!isApiConfigured ? 'cursor-not-allowed' : ''}`}>
                  <UploadCloud className="h-4 w-4" /> 
                  {text}
              </Label>
          </Button>
      );
      return (
          <>
              <input id={id} type="file" className="hidden" accept={fileType} onChange={handler} disabled={!isApiConfigured} />
              {isApiConfigured ? (
                  buttonContent
              ) : (
                  <TooltipProvider>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <div className='w-full flex justify-center'>{buttonContent}</div>
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>{disabledText}</p>
                          </TooltipContent>
                      </Tooltip>
                  </TooltipProvider>
              )}
          </>
      )
  };


  return (
    <div className="space-y-8">
        <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                    <Zap />
                    Ferramentas de Vídeo Rápido e Viral
                </CardTitle>
                <CardDescription>
                    Um conjunto de ferramentas poderosas para acelerar a sua criação de conteúdo em vídeo.
                </CardDescription>
            </CardHeader>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-headline text-2xl">
            <Youtube />
            Utilitário de Vídeo do YouTube
          </CardTitle>
          <CardDescription>
            Cole um URL do YouTube para descarregar o vídeo e usá-lo na secção de transcrição abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
              <Label htmlFor="youtube-url">URL do YouTube</Label>
              <div className="flex gap-2">
                <Input
                  id="youtube-url"
                  value={youtubeUrl}
                  onChange={handleYoutubeUrlChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <Button variant="secondary" onClick={handleConvertYoutubeUrl} aria-label="Converter URL de Shorts">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
              <a href="https://savefrom.in.net/youtube-video-downloader" target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" /> Descarregar Vídeo
              </a>
            </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-headline text-2xl">
            <VideoIcon />
            Transcrever Vídeo Anexado
          </CardTitle>
          <CardDescription>
            Anexe um ficheiro de vídeo do seu computador para obter a transcrição em português com timestamps.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="video-upload-input" className="flex items-center gap-2 font-medium"><VideoIcon className="h-4 w-4"/> Anexar ficheiro de vídeo</Label>
                    <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 text-center">
                      {uploadedVideoUri ? (
                        <video src={uploadedVideoUri} controls className="max-h-[250px] w-auto rounded-md" />
                      ) : (
                        <div className="space-y-2 py-8 text-muted-foreground">
                          <VideoIcon className="mx-auto h-10 w-10" />
                          <p className="text-xs">Formatos suportados: MP4, MOV, WEBM, etc.</p>
                        </div>
                      )}
                      {uploadButton('video-upload-input', uploadedVideoUri ? 'Trocar' : 'Escolher Vídeo', 'Configure a sua chave API para carregar vídeos.', handleVideoUpload, 'video/*')}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="transcription-scene-photo-upload" className="flex items-center gap-2 font-medium"><ImageIcon className="h-4 w-4" /> Anexar imagem de cena (Opcional)</Label>
                    <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 text-center">
                      {transcriptionScenePhotoPreview ? (
                        <Image src={transcriptionScenePhotoPreview} alt="Prévia da cena" width={200} height={200} className="max-h-[250px] w-auto rounded-md object-contain" />
                      ) : (
                        <div className="space-y-2 py-8 text-muted-foreground">
                          <ImageIcon className="mx-auto h-10 w-10" />
                          <p className="text-xs">Isto irá definir o cenário visual do roteiro gerado.</p>
                        </div>
                      )}
                      {uploadButton('transcription-scene-photo-upload', transcriptionScenePhotoPreview ? 'Trocar' : 'Escolher Imagem', 'Configure a sua chave API para carregar imagens.', handleTranscriptionScenePhotoUpload, 'image/*')}
                    </div>
                </div>
            </div>
          <div className="mt-6 space-y-2">
            <AiButton
                onClick={handleTranscribeUploadedVideoClick}
                loading={loadingUploadedVideoTranscription}
                isApiConfigured={isApiConfigured}
                disabled={!uploadedVideoUri}
                variant="outline"
            >
                <FileText className="mr-2 h-4 w-4" />
                {loadingUploadedVideoTranscription ? 'A transcrever...' : 'Transcrever Vídeo Anexado'}
            </AiButton>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <AiButton
                    onClick={() => onGenerateScriptFromTranscription(transcriptionScenePhotoDataUri ?? undefined)}
                    loading={loadingScriptFromTranscription}
                    isApiConfigured={isApiConfigured}
                    disabled={!generatedUploadedVideoTranscription || loadingUploadedVideoTranscription}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    <Bot className="mr-2 h-4 w-4" />
                    {loadingScriptFromTranscription ? 'A gerar...' : 'Gerar Roteiro da Transcrição'}
                </AiButton>
                <AiButton
                    onClick={() => onGenerateParaphrasedScriptFromTranscription(transcriptionScenePhotoDataUri ?? undefined)}
                    loading={loadingParaphrasedScript}
                    isApiConfigured={isApiConfigured}
                    disabled={!generatedUploadedVideoTranscription || loadingUploadedVideoTranscription}
                    variant="secondary"
                >
                    <Bot className="mr-2 h-4 w-4" />
                    {loadingParaphrasedScript ? 'A reescrever...' : 'Gerar com Outras Palavras'}
                </AiButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {generatedUploadedVideoTranscription && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <FileText />
                    Transcrição do Vídeo Anexado
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ContentDisplay content={generatedUploadedVideoTranscription} />
                <Button
                    onClick={handleCopyUploadedVideoTranscription}
                    variant="outline"
                    className={cn(
                        'mt-4 transition-colors',
                        copyUploadedVideoTranscriptionSuccess && 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100'
                    )}
                >
                    <Copy className="mr-2 h-4 w-4" />
                    {copyUploadedVideoTranscriptionSuccess ? 'Copiado!' : 'Copiar Transcrição'}
                </Button>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
              <Pencil />
              Gerar Roteiro Viral
            </CardTitle>
            <CardDescription>
              Escreva um tema, escolha as opções e clique para criar um roteiro. A imagem de referência do Passo 1 é opcional para o roteiro. O resultado será guardado na sua galeria.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="main-image-upload-viral" className="flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Imagem de Inspiração (Opcional)</Label>
              <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 text-center">
                {mainImagePreview ? (
                  <Image src={mainImagePreview} alt="Prévia da imagem principal" width={200} height={200} className="max-h-[150px] w-auto rounded-md object-contain" />
                ) : (
                  <div className="space-y-2 py-8 text-muted-foreground">
                    <ImageIcon className="mx-auto h-10 w-10" />
                    <p className="text-xs">Carregue a imagem do personagem ou objeto principal</p>
                  </div>
                )}
                 {uploadButton('main-image-upload-viral', mainImagePreview ? 'Trocar' : 'Escolher', 'Configure a sua chave API para carregar imagens.', handleMainImageUpload, 'image/*')}
              </div>
            </div>

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
                            <SelectItem value="50 seg">50 seg</SelectItem>
                            <SelectItem value="60 seg">60 seg</SelectItem>
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
            <div className="space-y-2">
                <Label htmlFor="cta-option" className="flex items-center gap-2"><MessageSquareQuote className="h-4 w-4"/> Call to Action (CTA)</Label>
                <Select value={ctaOption} onValueChange={setCtaOption}>
                    <SelectTrigger id="cta-option">
                        <SelectValue placeholder="Selecione uma CTA" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Siga para mais!">Siga para mais!</SelectItem>
                        <SelectItem value="Comente a sua opinião!">Comente a sua opinião!</SelectItem>
                        <SelectItem value="Clique no link da bio!">Clique no link da bio!</SelectItem>
                        <SelectItem value="Partilhe com um amigo!">Partilhe com um amigo!</SelectItem>
                        <SelectItem value="Nenhum">Nenhum</SelectItem>
                        <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {ctaOption === 'personalizado' && (
                <div className="space-y-2">
                    <Label htmlFor="custom-cta">CTA Personalizada</Label>
                    <Input 
                        id="custom-cta"
                        value={customCta}
                        onChange={(e) => setCustomCta(e.target.value)}
                        placeholder="Digite a sua CTA aqui"
                    />
                </div>
            )}

            <AiButton
                onClick={handleGenerateViralScriptClick}
                loading={loadingViralScript}
                isApiConfigured={isApiConfigured}
                disabled={!scriptTheme.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
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

            {generatedViralScene && !loadingViralScript && (
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
                        <Button
                          onClick={() => handleCopyScript(generatedViralScene.markdownScript, setCopyViralScriptSuccess)}
                          variant="outline"
                          className={cn(
                            'transition-colors',
                            copyViralScriptSuccess && 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100'
                          )}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {copyViralScriptSuccess ? 'Copiado!' : 'Copiar Roteiro'}
                        </Button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
