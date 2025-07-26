
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AiButton } from '@/components/ai-button';
import { handleImageUpload as handleImageUploadUtil } from '@/lib/utils';
import { UploadCloud, Bot, Image as ImageIcon, Sparkles, Pencil, Palette as PaletteIcon, Youtube, Download, Video as VideoIcon, Copy, Wand, FileText, Combine, Moon, User, Film, Clock, Camera } from 'lucide-react';
import type { ThumbnailIdeas, Scene, ThumbnailStyle, Influencer, LongScriptScene } from '@/types';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ContentDisplay } from '../content-display';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ViralVideoViewProps {
  onGenerate: (mainImageDataUri: string, backgroundImageDataUri: string | undefined, videoTheme: string, thumbnailStyle: ThumbnailStyle) => void;
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
  onLoadToCreator: (scene: Scene) => void;
  onGenerateDarkYoutubeScript: (videoTheme: string, imageDataUri?: string) => void;
  loadingDarkYoutubeScript: boolean;
  generatedDarkYoutubeScene: Scene | null;
  onTranscribeUploadedVideo: (videoDataUri: string) => void;
  loadingUploadedVideoTranscription: boolean;
  generatedUploadedVideoTranscription: string;
  onGenerateScriptFromTranscription: (imageDataUri?: string) => void;
  loadingScriptFromTranscription: boolean;
  onGenerateParaphrasedScriptFromTranscription: (imageDataUri?: string) => void;
  loadingParaphrasedScript: boolean;
  onClearTranscription: () => void;
  
  // Props for Long Script Generator
  influencers: Influencer[];
  scenes: Scene[];
  onGenerateLongScript: (videoTheme: string, duration: string, cameraAngle: string, influencerId?: string, sceneId?: string) => void;
  loadingLongScript: boolean;
  generatedLongScript: { scenes: LongScriptScene[], fullScriptTxt: string } | null;
}

const thumbnailStyleOptions: { value: ThumbnailStyle; label: string; description: string }[] = [
    { value: 'default', label: 'Estilo Padrão da IA', description: 'Deixe a IA decidir o melhor estilo com base no conteúdo.' },
    { value: 'shocked-expression', label: 'Expressão Chocada + Fundo Caótico', description: 'Uma expressão facial de surpresa ou choque em primeiro plano, com um fundo visualmente desordenado ou em movimento para criar urgência.' },
    { value: 'half-human-half-ai', label: 'Metade Humano / Metade IA ou Vilão', description: 'Um rosto dividido ao meio, mostrando um lado humano normal e o outro com características de IA (circuitos, olhos brilhantes) ou de um antagonista.' },
    { value: 'three-emotions', label: 'Três Emoções do Mesmo Rosto', description: 'Uma montagem do mesmo rosto mostrando três emoções distintas (ex: alegria, raiva, tristeza), sugerindo uma montanha-russa emocional.' },
    { value: 'floating-character', label: 'Personagem Flutuando ou Fora da Realidade', description: 'Cria uma imagem surreal e onírica que desafia a lógica para gerar curiosidade.' },
    { value: 'dramatic-close-up', label: 'Close no Rosto com Detalhe Dramático', description: 'Foco extremo numa emoção, destacando um detalhe como uma lágrima, reflexo nos olhos ou uma gota de suor.' },
    { value: 'mysterious-object', label: 'Segurando um Objeto Misterioso ou Dossiê', description: 'O personagem segura um objeto brilhante, uma caixa fechada ou um ficheiro com a palavra "SECRETO", gerando curiosidade sobre o seu conteúdo.' },
    { value: 'versus-screen', label: 'Versus (Agente vs Inimigo / Empresa / Objeto)', description: 'Dois personagens ou elementos em oposição, separados por um "VS" estilizado, como num ecrã de seleção de videojogo.' },
    { value: 'mr-beast', label: 'Fundo Pop Colorido + Texto Impactante', description: 'Estilo MrBeast: Cores vibrantes, texto grande e chamativo, expressões exageradas.' },
    { value: 'detective-noir', label: 'Detetive no Escuro com Lupa / Pistas', description: 'Ambiente escuro (noir), onde um personagem usa uma lupa para examinar uma pista num quadro de investigação com fotos e fios.' },
    { value: 'hacker-style', label: 'Estilo Hacker (Capuz + Código Refletido nos Óculos)', description: 'Personagem encapuzado, com código de programação verde ou binário a refletir nos óculos escuros.' },
    { value: 'extreme-zoom', label: 'Zoom Extremo nos Olhos / Expressão Facial', description: 'Um close-up extremo nos olhos do personagem, mostrando um reflexo ou uma emoção intensa.' },
    { value: 'clickbait', label: 'Setas Vermelhas + Círculo de Destaque', description: 'Clássico Clickbait: Elementos gráficos como setas e círculos para chamar a atenção para um ponto específico da imagem.' },
    { value: 'before-after', label: 'Antes e Depois (divisão de tela com contraste)', description: 'Ecrã dividido mostrando uma transformação dramática, com um lado "antes" e um lado "depois" em forte contraste.' },
    { value: 'action-freeze-frame', label: 'Mini Cena de Ação Congelada (tipo filme)', description: 'Uma imagem que parece uma cena de ação de um filme congelada no tempo, com movimento implícito (ex: saltos, objetos a voar).' },
    { value: 'cyberpunk', label: 'Iluminação Neon (Cyberpunk / Tech Vibe)', description: 'Cyberpunk / Tech Vibe: Tons escuros com luzes de néon brilhantes (rosa, azul, roxo) e um ambiente futurista.' },
    { value: 'silhouette', label: 'Silhueta Misteriosa com “Quem é?”', description: 'Cria suspense com uma silhueta contra uma fonte de luz (ex: uma porta aberta, um pôr-do-sol) e um texto interrogativo.' },
    { value: 'censored-text', label: 'Texto Gigante Coberto por Emojis / Censurado', description: 'Uma frase de isco em texto grande, onde uma palavra-chave é coberta por emojis ou uma tarja preta de censura.' },
    { value: 'explosion-background', label: 'Explosão no Fundo com Personagem Central Calmo', description: 'Uma grande explosão ou caos a acontecer no fundo, enquanto o personagem no centro da imagem permanece calmo e indiferente.' },
    { value: 'elemental-face', label: 'Rosto em Chamas / Gelo (efeitos extremos)', description: 'O rosto do personagem é coberto por efeitos elementares como fogo, gelo, eletricidade ou a desintegrar-se, criando um visual impactante.' },
    { value: 'poster', label: 'Thumbnail Estilo Cartaz de Filme / Série', description: 'Composição cinematográfica, com tipografia de póster e um visual dramático, como um cartaz de cinema.' },
];

export default function ViralVideoView({ 
    onGenerate, generatedIdeas, loading, isApiConfigured, 
    youtubeUrl, setYoutubeUrl, onAnalyzeVideo, loadingYouTube,
    onGenerateViralScript, loadingViralScript,
    generatedViralScene,
    onLoadToCreator,
    onGenerateDarkYoutubeScript,
    loadingDarkYoutubeScript,
    generatedDarkYoutubeScene,
    onTranscribeUploadedVideo,
    loadingUploadedVideoTranscription,
    generatedUploadedVideoTranscription,
    onGenerateScriptFromTranscription,
    loadingScriptFromTranscription,
    onGenerateParaphrasedScriptFromTranscription,
    loadingParaphrasedScript,
    onClearTranscription,
    influencers,
    scenes,
    onGenerateLongScript,
    loadingLongScript,
    generatedLongScript,
}: ViralVideoViewProps) {
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [mainImageDataUri, setMainImageDataUri] = useState<string | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [backgroundImageDataUri, setBackgroundImageDataUri] = useState<string | null>(null);
  const [videoTheme, setVideoTheme] = useState('');
  const [scriptTheme, setScriptTheme] = useState('');
  const [darkTheme, setDarkTheme] = useState('');
  const [darkThemeImagePreview, setDarkThemeImagePreview] = useState<string | null>(null);
  const [darkThemeImageDataUri, setDarkThemeImageDataUri] = useState<string | null>(null);
  const [viralScriptDuration, setViralScriptDuration] = useState('8 seg');
  const [videoType, setVideoType] = useState<'shorts' | 'watch'>('shorts');
  const [thumbnailStyle, setThumbnailStyle] = useState<ThumbnailStyle>('default');
  const [copyViralScriptSuccess, setCopyViralScriptSuccess] = useState(false);
  const [copyDarkYoutubeScriptSuccess, setCopyDarkYoutubeScriptSuccess] = useState(false);
  const [copyUploadedVideoTranscriptionSuccess, setCopyUploadedVideoTranscriptionSuccess] = useState(false);
  const [uploadedVideoUri, setUploadedVideoUri] = useState<string | null>(null);
  const [transcriptionScenePhotoPreview, setTranscriptionScenePhotoPreview] = useState<string | null>(null);
  const [transcriptionScenePhotoDataUri, setTranscriptionScenePhotoDataUri] = useState<string | null>(null);
  
  // State for Long Script Generator
  const [longScriptTheme, setLongScriptTheme] = useState('');
  const [longScriptDuration, setLongScriptDuration] = useState('10 minutes');
  const [longScriptCameraAngle, setLongScriptCameraAngle] = useState('Câmera Dinâmica (Criatividade da IA)');
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string | undefined>(undefined);
  const [selectedSceneId, setSelectedSceneId] = useState<string | undefined>(undefined);
  const [copiedScene, setCopiedScene] = useState<number | null>(null);

  const { toast } = useToast();

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUploadUtil(e, ({ preview, base64, type }) => {
      setMainImagePreview(preview);
      setMainImageDataUri(`data:${type};base64,${base64}`);
    });
  };
  
  const handleDarkThemeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUploadUtil(e, ({ preview, base64, type }) => {
      setDarkThemeImagePreview(preview);
      setDarkThemeImageDataUri(`data:${type};base64,${base64}`);
    });
  };

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUploadUtil(e, ({ preview, base64, type }) => {
      setBackgroundImagePreview(preview);
      setBackgroundImageDataUri(`data:${type};base64,${base64}`);
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

  const handleGenerateClick = () => {
    if (mainImageDataUri && videoTheme) {
      const selectedStyleDescription = thumbnailStyleOptions.find(opt => opt.value === thumbnailStyle)?.description || '';
      onGenerate(mainImageDataUri, backgroundImageDataUri ?? undefined, videoTheme, selectedStyleDescription as ThumbnailStyle);
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
        onGenerateViralScript(scriptTheme, mainImageDataUri, viralScriptDuration, videoType);
    }
  };

  const handleGenerateDarkYoutubeScriptClick = () => {
    if (darkTheme) {
        onGenerateDarkYoutubeScript(darkTheme, darkThemeImageDataUri ?? undefined);
    }
  };

  const handleTranscribeUploadedVideoClick = () => {
    if (uploadedVideoUri) {
      onTranscribeUploadedVideo(uploadedVideoUri);
    }
  };

  const handleGenerateLongScriptClick = () => {
    if (longScriptTheme) {
      onGenerateLongScript(longScriptTheme, longScriptDuration, longScriptCameraAngle, selectedInfluencerId, selectedSceneId);
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

  const handleTransformUrl = () => {
    if (youtubeUrl.includes('/shorts/')) {
        const newUrl = youtubeUrl.replace('/shorts/', '/watch?v=');
        setYoutubeUrl(newUrl);
        toast({
            variant: 'success',
            title: "Link transformado!",
            description: "O URL do Short foi convertido para o formato padrão.",
        });
    } else {
        toast({
            title: "Nenhuma transformação necessária",
            description: "O link já está no formato correto.",
        });
    }
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
                  <Pencil />
                  Gerador de Roteiro Longo (10-20 min)
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
            <Youtube />
            Analisar Vídeo do YouTube
          </CardTitle>
           <CardDescription>
            Cole um URL do YouTube, use o conversor de link (se for um Short) e descarregue o vídeo para o usar na secção de transcrição abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Input 
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="flex-grow"
                  />
                  <Button
                    type="button"
                    onClick={handleTransformUrl}
                    aria-label="Converter link Short para Watch"
                  >
                   Converter Link
                  </Button>
                  <Button asChild variant="secondary">
                    <a href="https://savefrom.in.net/youtube-video-downloader" target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4"/> Descarregar Vídeo
                    </a>
                  </Button>
                </div>
                 <p className="mt-2 text-xs text-muted-foreground">
                  Dica: se for um Short, clique no botão para converter o link automaticamente antes de descarregar.
                </p>
              </div>
          </div>
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
            <Moon />
            Gerar Roteiro de Vídeo Dark para YouTube
          </CardTitle>
          <CardDescription>
            Crie roteiros com temas de mistério, suspense, ou terror. Forneça um tema e, opcionalmente, uma imagem de inspiração.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="dark-theme" className="flex items-center gap-2"><Pencil className="h-4 w-4"/> temas variados</Label>
                <Input 
                    id="dark-theme"
                    value={darkTheme}
                    onChange={(e) => setDarkTheme(e.target.value)}
                    placeholder="Ex: O mistério do farol abandonado, A lenda urbana que se tornou real..."
                />
            </div>
             <div className="space-y-2">
              <Label htmlFor="dark-theme-image-upload" className="flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Imagem de Inspiração (Opcional)</Label>
              <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 text-center">
                {darkThemeImagePreview ? (
                  <Image src={darkThemeImagePreview} alt="Prévia da imagem para tema dark" width={200} height={200} className="max-h-[150px] w-auto rounded-md object-contain" />
                ) : (
                  <div className="space-y-2 py-8 text-muted-foreground">
                    <ImageIcon className="mx-auto h-10 w-10" />
                    <p className="text-xs">Carregue uma imagem para inspirar o cenário e a atmosfera.</p>
                  </div>
                )}
                 {uploadButton('dark-theme-image-upload', darkThemeImagePreview ? 'Trocar' : 'Escolher Imagem', 'Configure a sua chave API para carregar imagens.', handleDarkThemeImageUpload, 'image/*')}
              </div>
            </div>
            <AiButton
                onClick={handleGenerateDarkYoutubeScriptClick}
                loading={loadingDarkYoutubeScript}
                isApiConfigured={isApiConfigured}
                disabled={!darkTheme.trim()}
                className="w-full bg-slate-800 text-white shadow-lg transition-transform hover:scale-105 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
                <Bot className="mr-2 h-5 w-5" />
                Gerar Roteiro Dark
            </AiButton>

            {loadingDarkYoutubeScript && (
                 <div className="space-y-4 pt-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-4/5" />
                </div>
            )}

            {generatedDarkYoutubeScene && !loadingDarkYoutubeScript && (
                <div className="mt-4 space-y-4">
                    <Card className="bg-secondary/30">
                        <CardHeader><CardTitle className="text-lg">Roteiro Dark Gerado</CardTitle></CardHeader>
                        <CardContent>
                           {generatedDarkYoutubeScene.markdownScript && <ContentDisplay content={generatedDarkYoutubeScene.markdownScript} />}
                        </CardContent>
                    </Card>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => onLoadToCreator(generatedDarkYoutubeScene)}>
                            <UploadCloud className="mr-2 h-4 w-4" /> Carregar para o Criador
                        </Button>
                        <Button
                          onClick={() => handleCopyScript(generatedDarkYoutubeScene.markdownScript, setCopyDarkYoutubeScriptSuccess)}
                          variant="outline"
                          className={cn('transition-colors', copyDarkYoutubeScriptSuccess && 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100')}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {copyDarkYoutubeScriptSuccess ? 'Copiado!' : 'Copiar Roteiro'}
                        </Button>
                    </div>
                </div>
            )}
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
              Anexe imagens de referência e digite um tema para gerar ideias de thumbnail, ou apenas use a imagem como inspiração para o roteiro viral.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
              <Label htmlFor="main-image-upload" className="flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Imagem Principal</Label>
              <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 text-center">
                {mainImagePreview ? (
                  <Image src={mainImagePreview} alt="Prévia da imagem principal" width={200} height={200} className="max-h-[150px] w-auto rounded-md object-contain" />
                ) : (
                  <div className="space-y-2 py-8 text-muted-foreground">
                    <ImageIcon className="mx-auto h-10 w-10" />
                    <p className="text-xs">Carregue a imagem do personagem ou objeto principal</p>
                  </div>
                )}
                 {uploadButton('main-image-upload', mainImagePreview ? 'Trocar' : 'Escolher', 'Configure a sua chave API para carregar imagens.', handleMainImageUpload, 'image/*')}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="background-image-upload" className="flex items-center gap-2"><Combine className="h-4 w-4"/> Imagem de Fundo (Opcional)</Label>
              <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 text-center">
                {backgroundImagePreview ? (
                  <Image src={backgroundImagePreview} alt="Prévia da imagem de fundo" width={200} height={200} className="max-h-[150px] w-auto rounded-md object-contain" />
                ) : (
                  <div className="space-y-2 py-8 text-muted-foreground">
                    <Combine className="mx-auto h-10 w-10" />
                    <p className="text-xs">Carregue uma imagem para o cenário de fundo</p>
                  </div>
                )}
                 {uploadButton('background-image-upload', backgroundImagePreview ? 'Trocar' : 'Escolher', 'Configure a sua chave API para carregar imagens.', handleBackgroundImageUpload, 'image/*')}
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
            
            <div className="space-y-2">
                <Label htmlFor="thumbnail-style" className="flex items-center gap-2"><PaletteIcon className="h-4 w-4"/> Estilo da Thumbnail</Label>
                 <Select value={thumbnailStyle} onValueChange={(v) => setThumbnailStyle(v as ThumbnailStyle)}>
                    <SelectTrigger id="thumbnail-style">
                        <SelectValue placeholder="Selecione um estilo..." />
                    </SelectTrigger>
                    <SelectContent>
                        {thumbnailStyleOptions.map(option => (
                             <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <p className="mt-1 text-xs text-muted-foreground">
                    {thumbnailStyleOptions.find(opt => opt.value === thumbnailStyle)?.description}
                </p>
            </div>

            <AiButton
              onClick={handleGenerateClick}
              loading={loading}
              isApiConfigured={isApiConfigured}
              disabled={!mainImagePreview || !videoTheme.trim()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Bot className="mr-2 h-5 w-5" />
              {loading ? 'A gerar ideias...' : (backgroundImagePreview ? 'Combinar Imagens e Gerar' : 'Gerar Ideias para Thumbnail')}
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
