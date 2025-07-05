'use server';

/**
 * @fileOverview Transcribes a YouTube video into Brazilian Portuguese text with timestamps.
 *
 * - transcribeYouTubeVideo - Uses AI to generate a transcription from a video URL.
 * - TranscribeYouTubeVideoInput - Input schema for the flow.
 * - TranscribeYouTubeVideoOutput - Output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeYouTubeVideoInputSchema = z.object({
  youtubeUrl: z.string().url().describe('The URL of the YouTube video to transcribe.'),
});
export type TranscribeYouTubeVideoInput = z.infer<typeof TranscribeYouTubeVideoInputSchema>;

const TranscribeYouTubeVideoOutputSchema = z.object({
  transcription: z.string().describe('The full, word-for-word transcription of the video in Brazilian Portuguese, including timestamps in [MM:SS] format.'),
});
export type TranscribeYouTubeVideoOutput = z.infer<typeof TranscribeYouTubeVideoOutputSchema>;

export async function transcribeYouTubeVideo(input: TranscribeYouTubeVideoInput): Promise<TranscribeYouTubeVideoOutput> {
  return transcribeYouTubeVideoFlow(input);
}

const transcribeVideoPrompt = ai.definePrompt({
    name: 'transcribeVideoPrompt',
    input: { schema: TranscribeYouTubeVideoInputSchema },
    output: { schema: TranscribeYouTubeVideoOutputSchema },
    prompt: `
      Você é um especialista em transcrição de áudio. Sua tarefa é assistir ao vídeo do YouTube fornecido no URL e transcrever TODO o áudio, palavra por palavra, para o Português do Brasil.
      
      **CRÍTICO: Inclua timestamps no formato [MM:SS] no início de cada linha ou segmento de fala significativo.**

      Se o áudio original estiver em outro idioma, traduza-o para o Português do Brasil durante a transcrição, mantendo os timestamps.
      
      A transcrição deve ser o mais fiel e completa possível. Não resuma ou omita partes do diálogo.

      Exemplo de formato de saída:
      [00:00] Seu Raimundo, do que o senhor mais se arrepende na vida?
      [00:02] Quando eu era criança, eu devia ter escutado meu pai.
      [00:04] E o que ele falava?
      [00:04] Não sei, ué, eu não escutei.

      URL do vídeo para transcrever:
      {{{youtubeUrl}}}
    `
});

const transcribeYouTubeVideoFlow = ai.defineFlow(
  {
    name: 'transcribeYouTubeVideoFlow',
    inputSchema: TranscribeYouTubeVideoInputSchema,
    outputSchema: TranscribeYouTubeVideoOutputSchema,
  },
  async (input) => {
    const { output } = await transcribeVideoPrompt(input);
    if (!output) {
      throw new Error("A transcrição do vídeo não produziu um resultado. A URL pode estar inacessível ou o conteúdo não pôde ser analisado.");
    }
    return output;
  }
);
