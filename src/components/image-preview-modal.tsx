// src/components/image-preview-modal.tsx
'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Download, Image as ImageIcon } from 'lucide-react';
import NextImage from 'next/image';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUri: string | null;
  loading: boolean;
  prompt: string;
}

export function ImagePreviewModal({ isOpen, onClose, imageDataUri, loading, prompt }: ImagePreviewModalProps) {

  const handleDownload = () => {
    if (!imageDataUri) return;
    const link = document.createElement('a');
    link.href = imageDataUri;
    // Create a filename from the prompt
    const filename = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <ImageIcon className="h-6 w-6 text-primary" /> Imagem Gerada
          </DialogTitle>
        </DialogHeader>
        <div className="my-4 flex min-h-[400px] items-center justify-center rounded-lg border bg-secondary/30 p-4">
          {loading && <Skeleton className="h-full w-full min-h-[400px]" />}
          {!loading && imageDataUri && (
             <NextImage src={imageDataUri} alt="Imagem gerada a partir do prompt" width={800} height={450} className="rounded-md object-contain" />
          )}
        </div>
        <DialogFooter className="sm:justify-end">
           <Button type="button" variant="ghost" onClick={onClose}>
                Fechar
            </Button>
          <Button type="button" onClick={handleDownload} disabled={!imageDataUri || loading}>
            <Download className="mr-2 h-4 w-4" /> Baixar Imagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
