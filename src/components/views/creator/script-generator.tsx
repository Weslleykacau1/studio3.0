'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { AiButton } from '@/components/ai-button';
import { ContentDisplay } from '@/components/content-display';
import { Bot, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ScriptGeneratorProps {
  outputFormat: string;
  setOutputFormat: (format: string) => void;
  generatedContent: string;
  setGeneratedContent: (content: string) => void;
  loading: boolean;
  isLoggedIn: boolean;
  isGenerationDisabled: boolean;
  onGenerate: () => void;
}

export default function ScriptGenerator({
  outputFormat, setOutputFormat, generatedContent, setGeneratedContent, loading, isLoggedIn, isGenerationDisabled, onGenerate
}: ScriptGeneratorProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (!generatedContent) return;
    let textToCopy = generatedContent;
    if (outputFormat === 'json') {
      const match = generatedContent.match(/```json\n([\s\S]*?)```/);
      textToCopy = match ? match[1] : generatedContent;
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-headline text-2xl">
            <Bot className="text-primary" />
            3. Gere o Roteiro
          </CardTitle>
          <CardDescription>Use o influenciador e a cena definidos acima para gerar um roteiro de vídeo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Label className="font-medium">Formato de Saída:</Label>
            <RadioGroup value={outputFormat} onValueChange={setOutputFormat} className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="markdown" id="markdown" />
                <Label htmlFor="markdown">Markdown</Label>
              </div>
            </RadioGroup>
          </div>
          <AiButton onClick={onGenerate} loading={loading} isLoggedIn={isLoggedIn} disabled={isGenerationDisabled} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Gerar Roteiro da Cena Ativa
          </AiButton>
          {isGenerationDisabled && !isLoggedIn && <p className="text-sm text-muted-foreground">Carregue um influenciador e insira uma chave API para gerar um roteiro.</p>}
          {isGenerationDisabled && isLoggedIn && <p className="text-sm text-muted-foreground">Carregue ou guarde um influenciador para ativar a geração.</p>}
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Roteiro Gerado</CardTitle>
          </CardHeader>
          <CardContent>
            <ContentDisplay content={generatedContent} />
            <Button onClick={handleCopy} variant="outline" className="mt-4">
              <Copy className="mr-2 h-4 w-4" />
              {copySuccess ? 'Copiado!' : 'Copiar Roteiro'}
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
