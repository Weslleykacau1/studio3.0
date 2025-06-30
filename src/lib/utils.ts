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

export const extractJson = <T = unknown>(text: string): T | null => {
    if (typeof text !== 'string') return null;
    const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let jsonStringToParse;

    if (jsonBlockMatch && jsonBlockMatch[1]) {
        jsonStringToParse = jsonBlockMatch[1];
    } else {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1) {
            return null;
        }
        jsonStringToParse = text.substring(firstBrace, lastBrace + 1);
    }

    try {
        return JSON.parse(jsonStringToParse) as T;
    } catch (e) {
        console.error("Failed to parse JSON:", e, "Received string:", jsonStringToParse);
        return null;
    }
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
