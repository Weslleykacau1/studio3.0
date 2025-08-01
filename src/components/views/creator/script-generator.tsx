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
      toast({ variant: 'success', title: 'Roteiro copiado para a área de transferência!' });
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
      toast({ variant: 'success', title: 'Conteúdo SEO copiado!' });
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
      toast({ variant: 'success', title: 'Prompt Veo copiado!' });
      setTimeout(() => setCopyVeoSuccess(false), 2000);
    }).catch(err => {
      console.error('Failed to copy Veo prompt: ', err);
      toast({ variant: 'destructive', title: 'Erro ao copiar' });
    });
  };

  return null;
}
