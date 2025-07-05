'use server';

/**
 * @fileOverview Analyzes a YouTube video to create a similar or inspired script.
 *
 * - analyzeYouTubeVideo - Uses AI to generate a script based on the video's style and content.
 * - AnalyzeYouTubeVideoInput - Input schema for the flow.
 * - AnalyzeYouTubeVideoOutput - Output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeYouTubeVideoInputSchema = z.object({
  youtubeUrl: z.string().url().describe('The URL of the YouTube video to analyze.'),
  analysisType: z.enum(['identical', 'inspired']).describe('The type of analysis to perform: identical adaptation or creative inspiration.'),
});
export type AnalyzeYouTubeVideoInput = z.infer<typeof AnalyzeYouTubeVideoInputSchema>;

const AnalyzeYouTubeVideoOutputSchema = z.object({
  title: z.string().describe('Um título cativante para a nova cena, semelhante em estilo ao do vídeo, em Português do Brasil.'),
  setting: z.string().describe("Uma descrição detalhada do cenário da cena, com base no vídeo, em Português do Brasil."),
  action: z.string().describe('A ação principal da cena, com base no vídeo, em Português do Brasil.'),
  dialogue: z.string().describe("O diálogo do roteiro, com base no conteúdo do vídeo, em Português do Brasil. Inclua dicas de emoção em inglês, como (surpreso)."),
});
export type AnalyzeYouTubeVideoOutput = z.infer<typeof AnalyzeYouTubeVideoOutputSchema>;

export async function analyzeYouTubeVideo(input: AnalyzeYouTubeVideoInput): Promise<AnalyzeYouTubeVideoOutput> {
  return analyzeYouTubeVideoFlow(input);
}

const PromptInputSchema = z.object({
  youtubeUrl: z.string().url(),
  isIdentical: z.boolean(),
});

const analyzeVideoPrompt = ai.definePrompt({
    name: 'analyzeVideoPrompt',
    input: { schema: PromptInputSchema },
    output: { schema: AnalyzeYouTubeVideoOutputSchema },
    prompt: `
{{#if isIdentical}}
Você é um roteirista especialista em adaptar vídeos do YouTube para roteiros. Seu objetivo é capturar o estilo, tema, energia e conteúdo do vídeo para produzir uma adaptação fiel.

Sua resposta DEVE ser em Português do Brasil para todos os campos.

Com base no conteúdo do vídeo do YouTube no URL abaixo, gere o seguinte para o novo roteiro:
1.  **title**: Um título cativante, no mesmo estilo "clickbait" do vídeo original.
2.  **setting**: Uma descrição detalhada do cenário da cena, como visto no vídeo.
3.  **action**: Uma descrição das principais ações que ocorrem no vídeo.
4.  **dialogue**: Transcreva ou adapte o diálogo principal do vídeo. O diálogo deve ser em **Português do Brasil**. **Crucialmente, inclua dicas de emoção em inglês (por exemplo, entre parênteses) e enfatize palavras ou frases-chave para guiar a atuação.** Exemplo: "(surpreso) Uau, eu não acredito nisso!".

{{else}}
Você é um diretor criativo e roteirista. Seu objetivo é assistir ao vídeo do YouTube e se INSPIRAR em seu estilo, tema e energia para criar uma cena COMPLETAMENTE NOVA e original. Não copie o conteúdo ou o diálogo. Crie algo novo que capture a mesma 'vibe'.

Sua resposta DEVE ser em Português do Brasil para todos os campos.

Com base na inspiração do vídeo do YouTube no URL abaixo, gere o seguinte para a nova cena:
1.  **title**: Um título cativante e original no estilo do vídeo.
2.  **setting**: Uma descrição detalhada para um novo cenário, inspirado no vídeo.
3.  **action**: Uma ação principal original e envolvente.
4.  **dialogue**: Um diálogo curto e original. O diálogo deve ser em **Português do Brasil**. **Crucialmente, inclua dicas de emoção em inglês (por exemplo, entre parênteses) e enfatize palavras ou frases-chave para guiar a atuação.** Exemplo: "(animado) Vamos tentar algo totalmente diferente!".

{{/if}}

URL do vídeo para analisar:
{{{youtubeUrl}}}
`
});

const analyzeYouTubeVideoFlow = ai.defineFlow(
  {
    name: 'analyzeYouTubeVideoFlow',
    inputSchema: AnalyzeYouTubeVideoInputSchema,
    outputSchema: AnalyzeYouTubeVideoOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeVideoPrompt({
        youtubeUrl: input.youtubeUrl,
        isIdentical: input.analysisType === 'identical',
    });

    if (!output) {
      throw new Error("A análise do vídeo não produziu um resultado. A URL pode estar inacessível ou o conteúdo não pôde ser analisado.");
    }
    
    return output;
  }
);
