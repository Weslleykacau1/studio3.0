'use server';

/**
 * @fileOverview Generates a new, paraphrased video script based on a provided text transcription.
 *
 * - generateParaphrasedScriptFromTranscription - Uses AI to create a new scene with different wording but the same core message.
 * - GenerateParaphrasedScriptFromTranscriptionInput - Input type for the flow.
 * - GenerateParaphrasedScriptFromTranscriptionOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateParaphrasedScriptFromTranscriptionInputSchema = z.object({
  transcription: z.string().describe('The full text transcription of a video to be used as inspiration.'),
});
export type GenerateParaphrasedScriptFromTranscriptionInput = z.infer<typeof GenerateParaphrasedScriptFromTranscriptionInputSchema>;

const GenerateParaphrasedScriptFromTranscriptionOutputSchema = z.object({
    title: z.string().describe('A new, creative title for the scene based on the transcription.'),
    setting: z.string().describe('A new, creative description of the scene setting, inspired by the transcription.'),
    action: z.string().describe('A new, creative description of the main action, inspired by the transcription.'),
    dialogue: z.string().describe('The completely re-written dialogue for the scene, in Brazilian Portuguese with English emotional cues. It should convey the same message as the original but with different words.'),
    markdownScript: z.string().describe('A formatted script in Markdown, including the new title, setting, action, and dialogue.'),
});
export type GenerateParaphrasedScriptFromTranscriptionOutput = z.infer<typeof GenerateParaphrasedScriptFromTranscriptionOutputSchema>;

export async function generateParaphrasedScriptFromTranscription(input: GenerateParaphrasedScriptFromTranscriptionInput): Promise<GenerateParaphrasedScriptFromTranscriptionOutput> {
  return generateParaphrasedScriptFromTranscriptionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateParaphrasedScriptFromTranscriptionPrompt',
    input: {schema: GenerateParaphrasedScriptFromTranscriptionInputSchema},
    output: {schema: GenerateParaphrasedScriptFromTranscriptionOutputSchema},
    prompt: `Você é um roteirista criativo e especialista em reescrita. Sua tarefa é usar a seguinte transcrição de vídeo como inspiração para criar um roteiro de cena COMPLETAMENTE NOVO, mas com o mesmo tema e mensagem.

NÃO copie o diálogo original. Re-escreva o título, cenário, ação e, mais importante, o diálogo, usando outras palavras, mas mantendo a essência e o significado da transcrição original. Limpe os timestamps (ex: [00:05]) do processo. Adicione dicas de emoção em inglês (ex: (rindo)) com base no contexto.
    
O resultado DEVE ser um objeto JSON contendo 'title', 'setting', 'action', 'dialogue', e 'markdownScript'.
O campo 'markdownScript' deve ser uma string formatada em Markdown contendo o roteiro completo.
Todo o texto deve estar em Português do Brasil, exceto as dicas de emoção.

**Transcrição para Inspiração:**
"""
{{{transcription}}}
"""
    `,
});

const generateParaphrasedScriptFromTranscriptionFlow = ai.defineFlow(
  {
    name: 'generateParaphrasedScriptFromTranscriptionFlow',
    inputSchema: GenerateParaphrasedScriptFromTranscriptionInputSchema,
    outputSchema: GenerateParaphrasedScriptFromTranscriptionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
