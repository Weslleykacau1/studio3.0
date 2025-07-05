'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AiButton } from '@/components/ai-button';
import { ContentDisplay } from '@/components/content-display';
import { Bot, Copy, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ScriptGeneratorProps {
  generatedContent: string;
  setGeneratedContent: (content: string) => void;
  generatedSeoContent: string;
  generatedVeoPrompt: string;
  loading: boolean;
  loadingVeo: boolean;
  isApiConfigured: boolean;
  isGenerationDisabled: boolean;
  influencerId: string | null;
  sceneSetting: string;
  onGenerate: () => void;
  onGenerateVeoPrompt: () => void;
}

export default function ScriptGenerator({
  generatedContent, setGeneratedContent, generatedSeoContent, generatedVeoPrompt, loading, loadingVeo, isApiConfigured, isGenerationDisabled, influencerId, sceneSetting, onGenerate, onGenerateVeoPrompt
}: ScriptGeneratorProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [copySeoSuccess, setCopySeoSuccess] = useState(false);
  const [copyVeoSuccess, setCopyVeoSuccess] = useState(false);
  const { toast } = useToast();

  const getDisabledMessage = () => {
    if (isGenerationDisabled && isApiConfigured) {
        const reasons = [];
        if (!influencerId) {
            reasons.push("carregar ou guardar um influenciador");
        }
        if (!sceneSetting) {
            reasons.push("preencher o campo 'Cenário' na cena");
        }
        if (reasons.length > 0) {
            return `Para gerar, é preciso ${reasons.join(' e ')}.`;
        }
    }
    return '';
  };

  const handleCopy = () => {
    if (!generatedContent) return;

    let textToCopy = generatedContent;
    const codeBlockMatch = generatedContent.match(/^```(?:json|text|markdown)?\n([\s\S]*?)```$/);
    
    if (codeBlockMatch && codeBlockMatch[1]) {
      textToCopy = codeBlockMatch[1].trim();
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccess(true);
      toast({ title: 'Roteiro copiado para a área de transferência!', className: 'bg-green-100' });
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({ variant: 'destructive', title: 'Erro ao copiar' });
    });
  };

  const handleCopySeo = () => {
    if (!generatedSeoContent) return;
    navigator.clipboard.writeText(generatedSeoContent).then(() => {
      setCopySeoSuccess(true);
      toast({ title: 'Conteúdo SEO copiado!', className: 'bg-green-100' });
      setTimeout(() => setCopySeoSuccess(false), 2000);
    }).catch(err => {
      console.error('Failed to copy SEO text: ', err);
      toast({ variant: 'destructive', title: 'Erro ao copiar' });
    });
  };

  const handleCopyVeo = () => {
    if (!generatedVeoPrompt) return;
    
    let textToCopy = generatedVeoPrompt;
    const codeBlockMatch = generatedVeoPrompt.match(/^```(?:json|text|markdown)?\n([\s\S]*?)```$/);
    
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-headline text-2xl">
            <Bot />
            3. Gere o Roteiro Detalhado
          </CardTitle>
          <CardDescription>Use o influenciador e a cena definidos para gerar um roteiro detalhado para um vídeo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-start gap-2">
            <AiButton onClick={onGenerate} loading={loading} isApiConfigured={isApiConfigured} disabled={isGenerationDisabled} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? 'A gerar...' : 'Gerar Roteiro'}
            </AiButton>
            <AiButton 
              onClick={onGenerateVeoPrompt} 
              loading={loadingVeo} 
              isApiConfigured={isApiConfigured} 
              disabled={isGenerationDisabled}
              variant="secondary"
              className="border border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
            >
              <Video className="mr-2 h-4 w-4" />
              {loadingVeo ? 'A gerar para Veo...' : 'Gerar Prompt para Veo'}
            </AiButton>
          </div>
          {getDisabledMessage() && <p className="text-sm text-muted-foreground mt-2">{getDisabledMessage()}</p>}
        </CardContent>
      </Card>

      {generatedContent && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-headline">Roteiro Detalhado Gerado</CardTitle>
          </CardHeader>
          <CardContent>
            <ContentDisplay content={generatedContent} />
            <Button
              onClick={handleCopy}
              variant="outline"
              className={cn(
                'mt-4 transition-colors',
                copySuccess && 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100'
              )}
            >
              <Copy className="mr-2 h-4 w-4" />
              {copySuccess ? 'Copiado!' : 'Copiar Roteiro'}
            </Button>
          </CardContent>
        </Card>
      )}

      {generatedVeoPrompt && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Video />
              Prompt Gerado para Veo
            </CardTitle>
            <CardDescription>Este prompt conciso pode ser usado em plataformas de vídeo generativo como o Veo.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContentDisplay content={generatedVeoPrompt} />
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

      {generatedSeoContent && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
              <Bot />
              SEO Gerado para Diálogo
            </CardTitle>
            <CardDescription>
              Sugestões de títulos, descrições e hashtags para impulsionar seu vídeo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContentDisplay content={generatedSeoContent} />
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
    </>
  );
}
