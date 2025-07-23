
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, UserPlus, LogIn } from 'lucide-react';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Este componente não é mais necessário pois a autenticação foi removida.
// Poderíamos apagar o ficheiro, mas vamos mantê-lo vazio para o caso de ser reintroduzido no futuro.
export function UserLoginModal({ isOpen, onClose }: UserLoginModalProps) {
    const { toast } = useToast();

    if (isOpen) {
        toast({
            variant: "destructive",
            title: "Funcionalidade Indisponível",
            description: "O login de utilizador foi removido para simplificar a aplicação."
        });
        onClose();
    }
  
    return null;
}
