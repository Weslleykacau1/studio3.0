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
  imageDataUri: z
    .string()
    .describe(
      "An optional image for visual inspiration for the scene, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ).optional(),
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
    prompt: `Você é um roteirista experiente. Sua tarefa é transformar a seguinte transcrição de vídeo em um roteiro de cena estruturado. Ao criar a cena, escolha personagens brasileiros e cômicos para interpretar o diálogo.
    
    {{#if imageDataUri}}
    Use a imagem fornecida como a principal inspiração visual para o cenário da cena. Descreva o cenário com base nesta imagem.
    {{/if}}

    Analise a transcrição para inferir a ação principal e os diálogos. Limpe os timestamps (ex: [00:05]) do diálogo final. Adicione dicas de emoção em inglês (ex: (rindo)) com base no contexto.
    
    O resultado DEVE ser um objeto JSON contendo 'title', 'setting', 'action', 'dialogue', e 'markdownScript'.
    O campo 'markdownScript' deve ser uma string formatada em Markdown contendo o roteiro completo.
    Todo o texto deve estar em Português do Brasil, exceto as dicas de emoção.

    **Transcrição para Análise:**
    """
    {{{transcription}}}
    """
    {{#if imageDataUri}}

    **Inspiração Visual:**
    {{media url=imageDataUri}}
    {{/if}}
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
