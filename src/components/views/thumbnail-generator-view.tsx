
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AiButton } from '@/components/ai-button';
import { handleImageUpload as handleImageUploadUtil } from '@/lib/utils';
import { UploadCloud, Bot, Image as ImageIcon, Pencil, Palette as PaletteIcon, Download, Combine, AspectRatio } from 'lucide-react';
import type { ThumbnailIdeas, ThumbnailStyle } from '@/types';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ThumbnailGeneratorViewProps {
  onGenerateThumbnail: (mainImageDataUri: string, backgroundImageDataUri: string | undefined, videoTheme: string, thumbnailStyle: ThumbnailStyle) => void;
  generatedThumbnailIdeas: ThumbnailIdeas | null;
  loadingThumbnail: boolean;
  isApiConfigured: boolean;
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

export default function ThumbnailGeneratorView({ 
    onGenerateThumbnail, generatedThumbnailIdeas, loadingThumbnail, isApiConfigured 
}: ThumbnailGeneratorViewProps) {
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [mainImageDataUri, setMainImageDataUri] = useState<string | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [backgroundImageDataUri, setBackgroundImageDataUri] = useState<string | null>(null);
  const [videoTheme, setVideoTheme] = useState('');
  const [thumbnailStyle, setThumbnailStyle] = useState<ThumbnailStyle>('default');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUploadUtil(e, ({ preview, base64, type }) => {
      setMainImagePreview(preview);
      setMainImageDataUri(`data:${type};base64,${base64}`);
    });
  };
  
  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUploadUtil(e, ({ preview, base64, type }) => {
      setBackgroundImagePreview(preview);
      setBackgroundImageDataUri(`data:${type};base64,${base64}`);
    });
  };

  const handleGenerateClick = () => {
    if (mainImageDataUri && videoTheme) {
      const selectedStyleDescription = thumbnailStyleOptions.find(opt => opt.value === thumbnailStyle)?.description || '';
      onGenerateThumbnail(mainImageDataUri, backgroundImageDataUri ?? undefined, videoTheme, selectedStyleDescription as ThumbnailStyle);
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

  const uploadButton = (id: string, text: string, disabledText: string, handler: (e: React.ChangeEvent<HTMLInputElement>) => void) => {
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
              <input id={id} type="file" className="hidden" accept="image/*" onChange={handler} disabled={!isApiConfigured} />
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
              <ImageIcon />
              Passo 1: Imagem de Referência
            </CardTitle>
            <CardDescription>
              Anexe imagens de referência e digite um tema para gerar ideias de thumbnail.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
              <Label htmlFor="main-image-upload-thumb" className="flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Imagem Principal</Label>
              <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 text-center">
                {mainImagePreview ? (
                  <Image src={mainImagePreview} alt="Prévia da imagem principal" width={200} height={200} className="max-h-[150px] w-auto rounded-md object-contain" />
                ) : (
                  <div className="space-y-2 py-8 text-muted-foreground">
                    <ImageIcon className="mx-auto h-10 w-10" />
                    <p className="text-xs">Carregue a imagem do personagem ou objeto principal</p>
                  </div>
                )}
                 {uploadButton('main-image-upload-thumb', mainImagePreview ? 'Trocar' : 'Escolher', 'Configure a sua chave API para carregar imagens.', handleMainImageUpload)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="background-image-upload-thumb" className="flex items-center gap-2"><Combine className="h-4 w-4"/> Imagem de Fundo (Opcional)</Label>
              <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 text-center">
                {backgroundImagePreview ? (
                  <Image src={backgroundImagePreview} alt="Prévia da imagem de fundo" width={200} height={200} className="max-h-[150px] w-auto rounded-md object-contain" />
                ) : (
                  <div className="space-y-2 py-8 text-muted-foreground">
                    <Combine className="mx-auto h-10 w-10" />
                    <p className="text-xs">Carregue uma imagem para o cenário de fundo</p>
                  </div>
                )}
                 {uploadButton('background-image-upload-thumb', backgroundImagePreview ? 'Trocar' : 'Escolher', 'Configure a sua chave API para carregar imagens.', handleBackgroundImageUpload)}
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
                <Label className="flex items-center gap-2"><AspectRatio className="h-4 w-4"/> Proporção</Label>
                <RadioGroup value={aspectRatio} onValueChange={(v) => setAspectRatio(v as '16:9' | '9:16')} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="16:9" id="ratio-16-9" />
                    <Label htmlFor="ratio-16-9" className="font-normal">16:9 (Horizontal)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="9:16" id="ratio-9-16" />
                    <Label htmlFor="ratio-9-16" className="font-normal">9:16 (Vertical)</Label>
                  </div>
                </RadioGroup>
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
              loading={loadingThumbnail}
              isApiConfigured={isApiConfigured}
              disabled={!mainImagePreview || !videoTheme.trim()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Bot className="mr-2 h-5 w-5" />
              {loadingThumbnail ? 'A gerar ideias...' : (backgroundImagePreview ? 'Combinar Imagens e Gerar' : 'Gerar Ideias para Thumbnail')}
            </AiButton>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
              Passo 2: Resultado da Thumbnail
            </CardTitle>
            <CardDescription>
              Aqui estão as sugestões da IA.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingThumbnail ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Skeleton className="h-[150px] w-full" />
                        <Skeleton className="h-[150px] w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : generatedThumbnailIdeas ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {generatedThumbnailIdeas.generatedImage1DataUri && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Opção 1</h4>
                      <Image src={generatedThumbnailIdeas.generatedImage1DataUri} alt="Thumbnail gerada 1" width={400} height={225} className="w-full rounded-md border object-contain" />
                       <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDownloadImage(generatedThumbnailIdeas.generatedImage1DataUri, 'thumbnail_opcao_1.png')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Opção 1
                      </Button>
                    </div>
                  )}
                  {generatedThumbnailIdeas.generatedImage2DataUri && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Opção 2</h4>
                      <Image src={generatedThumbnailIdeas.generatedImage2DataUri} alt="Thumbnail gerada 2" width={400} height={225} className="w-full rounded-md border object-contain" />
                       <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDownloadImage(generatedThumbnailIdeas.generatedImage2DataUri, 'thumbnail_opcao_2.png')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Opção 2
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-1 pt-4">
                  <h4 className="flex items-center gap-2 font-semibold"><Pencil className="h-4 w-4 text-muted-foreground" /> Título Sugerido</h4>
                  <p className="rounded-md border bg-secondary/30 p-3">{generatedThumbnailIdeas.emoji} {generatedThumbnailIdeas.title}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="flex items-center gap-2 font-semibold"><PaletteIcon className="h-4 w-4 text-muted-foreground" /> Estilo Visual</h4>
                  <p className="rounded-md border bg-secondary/30 p-3">{generatedThumbnailIdeas.styleDescription}</p>
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
    </div>
  );
}
