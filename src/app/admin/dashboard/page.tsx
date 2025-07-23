
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Users } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface User {
  id: string;
  email: string | undefined;
  created_at: string;
  // This is the hardcoded admin user that cannot be deleted
  is_admin?: boolean;
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao carregar utilizadores.');
      }
      const data = await response.json();
      
      // Add a flag for the admin user to prevent deletion in the UI
      const processedUsers = data.map((user: User) => ({
        ...user,
        is_admin: user.email === 'weslley.kacau@gmail.com',
      }));

      setUsers(processedUsers);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = () => {
    // Since we are not using Supabase auth for the admin panel, just redirect
    router.push('/admin/login');
  };

  const handleDeleteUser = async (userId: string) => {
    try {
        const response = await fetch('/api/admin/users', {
            method: 'DELETE',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: userId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha ao apagar utilizador.');
        }

        toast({
            variant: 'success',
            title: 'Sucesso',
            description: 'Utilizador apagado com sucesso.',
        });
        fetchUsers(); // Recarrega a lista de utilizadores
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Erro',
            description: error.message,
        });
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="flex items-center justify-between border-b bg-background p-4">
        <h1 className="text-xl font-bold font-headline">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Users />
                Gestão de Utilizadores
            </CardTitle>
            <CardDescription>
                Visualize e gira os utilizadores registados na plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                           {user.is_admin ? (
                                <span className="text-xs text-muted-foreground italic">Não pode ser apagado</span>
                           ) : (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isto irá apagar permanentemente o utilizador e todos os seus dados associados.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                        Apagar
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                           )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
