'use server';

/**
 * @fileOverview Transcribes an uploaded video file into Brazilian Portuguese text with timestamps.
 *
 * - transcribeUploadedVideo - Uses AI to generate a transcription from a video data URI.
 * - TranscribeUploadedVideoInput - Input schema for the flow.
 * - TranscribeUploadedVideoOutput - Output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeUploadedVideoInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeUploadedVideoInput = z.infer<typeof TranscribeUploadedVideoInputSchema>;

const TranscribeUploadedVideoOutputSchema = z.object({
  transcription: z.string().describe('The full, word-for-word transcription of the video in Brazilian Portuguese, including timestamps in [MM:SS] format.'),
});
export type TranscribeUploadedVideoOutput = z.infer<typeof TranscribeUploadedVideoOutputSchema>;

export async function transcribeUploadedVideo(input: TranscribeUploadedVideoInput): Promise<TranscribeUploadedVideoOutput> {
  return transcribeUploadedVideoFlow(input);
}

const transcribeVideoPrompt = ai.definePrompt({
    name: 'transcribeUploadedVideoPrompt',
    input: { schema: TranscribeUploadedVideoInputSchema },
    output: { schema: TranscribeUploadedVideoOutputSchema },
    prompt: `
      Você é um especialista em transcrição de áudio e vídeo. Sua tarefa é fazer uma leitura e análise completa do vídeo fornecido e, a partir disso, transcrever TODO o áudio, palavra por palavra, para o Português do Brasil.
      
      **CRÍTICO: Inclua timestamps no formato [MM:SS] no início de cada linha ou segmento de fala significativo.**

      Se o áudio original estiver em outro idioma, traduza-o para o Português do Brasil durante a transcrição, mantendo os timestamps.
      
      A transcrição deve ser o mais fiel e completa possível. Não resuma ou omita partes do diálogo.

      Exemplo de formato de saída:
      [00:00] Seu Raimundo, do que o senhor mais se arrepende na vida?
      [00:02] Quando eu era criança, eu devia ter escutado meu pai.
      [00:04] E o que ele falava?
      [00:04] Não sei, ué, eu não escutei.

      Vídeo para transcrever:
      {{media url=videoDataUri}}
    `
});

const transcribeUploadedVideoFlow = ai.defineFlow(
  {
    name: 'transcribeUploadedVideoFlow',
    inputSchema: TranscribeUploadedVideoInputSchema,
    outputSchema: TranscribeUploadedVideoOutputSchema,
  },
  async (input) => {
    const { output } = await transcribeVideoPrompt(input);
    if (!output) {
      throw new Error("A transcrição do vídeo não produziu um resultado. O ficheiro pode estar corrompido ou o conteúdo não pôde ser analisado.");
    }
    return output;
  }
);
