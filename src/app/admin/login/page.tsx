
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield } from 'lucide-react';

const ADMIN_EMAIL = 'weslley.kacau';
const ADMIN_PASSWORD = 'Extra1382@';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        toast({
            variant: 'success',
            title: 'Login bem-sucedido!',
            description: 'A redirecionar para a dashboard...',
        });
        // We can use sessionStorage to create a very simple "is logged in" flag
        // for this browser session. This is not secure for production apps
        // but fits the request to avoid database authentication for the panel.
        sessionStorage.setItem('admin_logged_in', 'true');
        router.push('/admin/dashboard');
    } else {
         toast({
            variant: 'destructive',
            title: 'Acesso Negado',
            description: 'As credenciais estão incorretas.',
        });
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
              <Label htmlFor="email">Utilizador</Label>
              <Input
                id="email"
                type="text"
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
