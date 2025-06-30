import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTimeAgo = (timestamp?: string | null): string => {
    if (!timestamp) return '';
    const now = new Date();
    const seconds = Math.floor((now.getTime() - new Date(timestamp).getTime()) / 1000);

    if (seconds < 5) return 'agora';
    if (seconds < 60) return `${seconds}s atrás`;
    
    let interval = Math.floor(seconds / 60);
    if (interval < 60) return `${interval}m atrás`;

    interval = Math.floor(seconds / 3600);
    if (interval < 24) return `${interval}h atrás`;

    interval = Math.floor(seconds / 86400);
    if (interval < 30) return `${interval}d atrás`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval < 12) return `${interval} meses atrás`;

    interval = Math.floor(seconds / 31536000);
    return `${interval} anos atrás`;
};

export const handleImageUpload = (
  e: React.ChangeEvent<HTMLInputElement>,
  callback: (result: { preview: string; base64: string; type: string; file: File }) => void
) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      if (preview) {
        const base64 = preview.split(',')[1];
        callback({ preview, base64, type: file.type, file });
      }
    };
    reader.readAsDataURL(file);
  }
};
