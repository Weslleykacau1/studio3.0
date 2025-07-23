
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro de Login',
        description: error.message,
      });
    } else {
        const { data: { user } } = await supabase.auth.getUser();
        // Verificação extra para garantir que apenas o admin entra
        if (user && user.email === 'weslley.kacau') {
            toast({
                variant: 'success',
                title: 'Login bem-sucedido!',
                description: 'A redirecionar para a dashboard...',
            });
            router.push('/admin/dashboard');
        } else {
            // Se outro utilizador tentar fazer login, desloga-o e mostra um erro
            await supabase.auth.signOut();
             toast({
                variant: 'destructive',
                title: 'Acesso Negado',
                description: 'Esta área é apenas para administradores.',
            });
        }
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-headline">
            <Shield className="h-6 w-6 text-primary" />
            Login de Administrador
          </CardTitle>
          <CardDescription>
            Acesso restrito à área de administração do Scriptify Studio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="weslley.kacau"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
