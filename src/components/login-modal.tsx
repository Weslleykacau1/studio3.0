'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { KeyRound, CheckCircle, AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const ApiKeySchema = z.object({
  apiKey: z.string().min(1, { message: 'Por favor, insira uma chave API.' }),
});

export function LoginModal({ isOpen, onClose, onSave }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const form = useForm<z.infer<typeof ApiKeySchema>>({
    resolver: zodResolver(ApiKeySchema),
    defaultValues: { apiKey: '' },
  });

  const handleTestAndSave = async (values: z.infer<typeof ApiKeySchema>) => {
    setTestStatus('testing');
    setTestMessage('');

    try {
      const payload = { contents: [{ role: 'user', parts: [{ text: 'hello' }] }] };
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${values.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();

      if (response.ok && result.candidates) {
        setTestStatus('success');
        setTestMessage('Chave API válida e a funcionar!');
        setTimeout(() => {
          onSave(values.apiKey);
          form.reset();
          setTestStatus('idle');
        }, 1500);
      } else {
        throw new Error(result?.error?.message || 'Chave API inválida ou erro de rede.');
      }
    } catch (error) {
      console.error('Erro no teste da API:', error);
      setTestStatus('error');
      setTestMessage('A chave API não está a funcionar corretamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <KeyRound className="h-6 w-6 text-primary" /> Configurar Chave API
          </DialogTitle>
          <DialogDescription>
            Para usar os recursos de IA, você precisa de uma chave de API do Google AI Studio.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleTestAndSave)} className="space-y-6">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="api-key-input">Chave API do Google Gemini</Label>
                  <div className="relative">
                    <FormControl>
                      <Input
                        id="api-key-input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Cole a sua chave API aqui"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 h-full px-3"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {testMessage && (
              <Alert variant={testStatus === 'success' ? 'default' : 'destructive'} className={testStatus === 'success' ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-900/40' : ''}>
                {testStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{testStatus === 'success' ? 'Sucesso!' : 'Erro no Teste'}</AlertTitle>
                <AlertDescription>{testMessage}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-r-lg border-l-4 border-blue-400 bg-blue-50 p-4 dark:bg-blue-900/20">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300">Como obter a sua chave API:</h3>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-blue-700 dark:text-blue-400">
                <li>
                  Aceda ao{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline hover:text-blue-600 dark:hover:text-blue-300"
                  >
                    Google AI Studio
                  </a>
                  .
                </li>
                <li>Inicie sessão com a sua conta Google.</li>
                <li>Clique em "Create API Key".</li>
                <li>Copie a chave gerada e cole-a aqui.</li>
              </ol>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={testStatus === 'testing' || testStatus === 'success'}>
                {testStatus === 'testing' ? 'A testar...' : 'Guardar e Testar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
