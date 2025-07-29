
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AiButton } from '@/components/ai-button';
import { handleImageUpload as handleImageUploadUtil } from '@/lib/utils';
import { UploadCloud, Bot, Youtube, Download, Video as VideoIcon, Copy, FileText, RefreshCw, Image as ImageIcon } from 'lucide-react';
import type { Scene } from '@/types';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ContentDisplay } from '../content-display';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TranscribeVideoViewProps {
  isApiConfigured: boolean;
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  loadingYouTube: boolean;
  onTranscribeUploadedVideo: (videoDataUri: string) => void;
  loadingUploadedVideoTranscription: boolean;
  generatedUploadedVideoTranscription: string;
  onGenerateScriptFromTranscription: (imageDataUri?: string) => void;
  loadingScriptFromTranscription: boolean;
  onGenerateParaphrasedScriptFromTranscription: (imageDataUri?: string) => void;
  loadingParaphrasedScript: boolean;
  onClearTranscription: () => void;
  generatedViralScene: Scene | null;
  onLoadToCreator: (scene: Scene) => void;
}

export default function TranscribeVideoView({ 
    isApiConfigured, 
    youtubeUrl, setYoutubeUrl, loadingYouTube,
    onTranscribeUploadedVideo,
    loadingUploadedVideoTranscription,
    generatedUploadedVideoTranscription,
    onGenerateScriptFromTranscription,
    loadingScriptFromTranscription,
    onGenerateParaphrasedScriptFromTranscription,
    loadingParaphrasedScript,
    onClearTranscription,
    generatedViralScene,
    onLoadToCreator,
}: TranscribeVideoViewProps) {
  const [copyUploadedVideoTranscriptionSuccess, setCopyUploadedVideoTranscriptionSuccess] = useState(false);
  const [copyViralScriptSuccess, setCopyViralScriptSuccess] = useState(false);
  const [uploadedVideoUri, setUploadedVideoUri] = useState<string | null>(null);
  const [transcriptionScenePhotoPreview, setTranscriptionScenePhotoPreview] = useState<string | null>(null);
  const [transcriptionScenePhotoDataUri, setTranscriptionScenePhotoDataUri] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value);
  };

  const handleConvertYoutubeUrl = () => {
    if (youtubeUrl.includes('/shorts/')) {
        setYoutubeUrl(youtubeUrl.replace('/shorts/', '/watch?v='));
    }
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

      {generatedViralScene && !loadingScriptFromTranscription && !loadingParaphrasedScript && (
          <Card className="mt-8">
              <CardHeader>
                  <CardTitle className="text-lg">Roteiro Gerado</CardTitle>
              </CardHeader>
              <CardContent>
                  {generatedViralScene.markdownScript && <ContentDisplay content={generatedViralScene.markdownScript} />}
                   <div className="flex flex-wrap gap-2 mt-4">
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
              </CardContent>
          </Card>
      )}
    </div>
  );
}
