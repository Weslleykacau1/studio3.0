
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AiButton } from '@/components/ai-button';
import { handleImageUpload as handleImageUploadUtil } from '@/lib/utils';
import { UploadCloud, Bot, Sparkles, Pencil, Youtube, Download, Video as VideoIcon, Copy, Wand, FileText, Combine, BookOpen, User, Film, Clock, Camera, AlertTriangle, MessageSquareQuote, RefreshCw, Search, ThumbsUp, ListOrdered, Zap, Image as ImageIcon } from 'lucide-react';
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
  onGenerateViralScript: (videoTitle: string, imageDataUri: string | null, duration: string, videoType: 'shorts' | 'watch', cta: string | undefined) => void;
  loadingViralScript: boolean;
  generatedViralScene: Scene | null;
  onLoadToCreator: (scene: Scene) => void;
}

export default function ViralToolsView({ 
    isApiConfigured, 
    onGenerateViralScript, loadingViralScript,
    generatedViralScene,
    onLoadToCreator,
}: ViralToolsViewProps) {
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [mainImageDataUri, setMainImageDataUri] = useState<string | null>(null);
  const [scriptTheme, setScriptTheme] = useState('');
  const [viralScriptDuration, setViralScriptDuration] = useState('8 seg');
  const [videoType, setVideoType] = useState<'shorts' | 'watch'>('shorts');
  const [copyViralScriptSuccess, setCopyViralScriptSuccess] = useState(false);
  
  // State for Viral Script CTA
  const [ctaOption, setCtaOption] = useState('Siga para mais!');
  const [customCta, setCustomCta] = useState('');

  const { toast } = useToast();

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUploadUtil(e, ({ preview, base64, type }) => {
      setMainImagePreview(preview);
      setMainImageDataUri(`data:${type};base64,${base64}`);
    });
  };

  const handleGenerateViralScriptClick = () => {
    if (scriptTheme) {
        const cta = ctaOption === 'personalizado' ? customCta : ctaOption;
        onGenerateViralScript(scriptTheme, mainImageDataUri, viralScriptDuration, videoType, cta);
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
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
              <Pencil />
              Gerador de Roteiro Viral
            </CardTitle>
            <CardDescription>
              Escreva um tema, escolha as opções e clique para criar um roteiro. A imagem de referência é opcional. O resultado será guardado na sua galeria.
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
                 {uploadButton('main-image-upload-viral', mainImagePreview ? 'Trocar' : 'Escolher', 'Configure a sua chave API para carregar imagens.', handleMainImageUpload)}
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
