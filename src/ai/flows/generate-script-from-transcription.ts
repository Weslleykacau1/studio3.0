'use server';

/**
 * @fileOverview Generates a video script based on a provided text transcription.
 *
 * - generateScriptFromTranscription - Uses AI to create a structured scene from a transcription.
 * - GenerateScriptFromTranscriptionInput - Input schema for the flow.
 * - GenerateScriptFromTranscriptionOutput - Output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateScriptFromTranscriptionInputSchema = z.object({
  transcription: z.string().describe('The full text transcription of a video, which may include timestamps.'),
});
export type GenerateScriptFromTranscriptionInput = z.infer<typeof GenerateScriptFromTranscriptionInputSchema>;

const GenerateScriptFromTranscriptionOutputSchema = z.object({
    title: z.string().describe('The suggested title for the scene based on the transcription.'),
    setting: z.string().describe('A detailed description of the scene setting, inferred from the transcription.'),
    action: z.string().describe('The main action occurring in the scene, inferred from the transcription.'),
    dialogue: z.string().describe('The dialogue for the scene, extracted and formatted from the transcription, in Brazilian Portuguese with English emotional cues.'),
    markdownScript: z.string().describe('A formatted script in Markdown, including title, setting, action, and dialogue.'),
});
export type GenerateScriptFromTranscriptionOutput = z.infer<typeof GenerateScriptFromTranscriptionOutputSchema>;

export async function generateScriptFromTranscription(input: GenerateScriptFromTranscriptionInput): Promise<GenerateScriptFromTranscriptionOutput> {
  return generateScriptFromTranscriptionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateScriptFromTranscriptionPrompt',
    input: {schema: GenerateScriptFromTranscriptionInputSchema},
    output: {schema: GenerateScriptFromTranscriptionOutputSchema},
    prompt: `Você é um roteirista experiente. Sua tarefa é transformar a seguinte transcrição de vídeo em um roteiro de cena estruturado.
    
    Analise a transcrição para inferir o cenário, a ação principal e os diálogos. Limpe os timestamps (ex: [00:05]) do diálogo final. Adicione dicas de emoção em inglês (ex: (rindo)) com base no contexto.
    
    O resultado DEVE ser um objeto JSON contendo 'title', 'setting', 'action', 'dialogue', e 'markdownScript'.
    O campo 'markdownScript' deve ser uma string formatada em Markdown contendo o roteiro completo.
    Todo o texto deve estar em Português do Brasil, exceto as dicas de emoção.

    **Transcrição para Análise:**
    """
    {{{transcription}}}
    """
    `,
});

const generateScriptFromTranscriptionFlow = ai.defineFlow(
  {
    name: 'generateScriptFromTranscriptionFlow',
    inputSchema: GenerateScriptFromTranscriptionInputSchema,
    outputSchema: GenerateScriptFromTranscriptionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
