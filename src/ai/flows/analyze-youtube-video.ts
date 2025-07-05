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
  markdownScript: z.string().describe('A formatted script in Markdown, including title, setting, action, and dialogue.'),
  duration: z.string().describe("A duração do vídeo, como uma string (ex: '8 seg', '25 seg'). Se for um vídeo curto, respeite a sua duração. Se for longo, pode ser um valor aproximado para a cena gerada.").optional(),
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
A sua resposta DEVE ser um objeto JSON contendo 'title', 'setting', 'action', 'dialogue', 'markdownScript', e 'duration'.
O campo 'duration' DEVE refletir a duração do vídeo original (ex: "8 seg", "15 seg"). O roteiro gerado (ação e diálogo) deve ser dimensionado para se ajustar a essa duração.
O campo 'markdownScript' deve ser uma string formatada em Markdown contendo o roteiro completo, com seções para Título, Cenário, Ação e Diálogo.
Todos os campos de texto devem ser em Português do Brasil.
O diálogo deve incluir dicas de emoção em inglês (por exemplo, entre parênteses).

{{#if isIdentical}}
Você é um roteirista especialista em adaptar vídeos do YouTube para roteiros. Sua tarefa principal é **transcrever o áudio do vídeo** e usar essa transcrição como base para o diálogo do roteiro. Seu objetivo é capturar o estilo, tema, energia e conteúdo do vídeo para produzir uma adaptação fiel. **Seja fiel na criação do roteiro.**
Gere: um título "clickbait" fiel ao original; uma descrição de cenário fiel baseada no visual do vídeo; uma descrição das ações principais observadas; e um roteiro de diálogo baseado na **transcrição direta do áudio do vídeo**. O roteiro gerado deve ser dimensionado para se ajustar à duração original do vídeo.
Para o diálogo, **Crucialmente, inclua dicas de emoção em inglês (por exemplo, entre parênteses) e enfatize palavras ou frases-chave para guiar a atuação, com base na entoação ouvida no vídeo.** Exemplo: "(surpreso) Uau, eu não acredito nisso!".
{{else}}
Você é um diretor criativo e roteirista. Seu objetivo é assistir ao vídeo do YouTube e se INSPIRAR em seu estilo, tema e energia para criar uma cena COMPLETAMENTE NOVA e original. Não copie o conteúdo ou o diálogo. A cena deve ter uma duração apropriada inspirada no vídeo original.
Gere: um título original inspirado no estilo; um novo cenário inspirado no vídeo; uma ação original e envolvente; e um diálogo curto e original.
Para o diálogo, **Crucialmente, inclua dicas de emoção em inglês (por exemplo, entre parênteses) e enfatize palavras ou frases-chave para guiar a atuação.** Exemplo: "(animado) Vamos tentar algo totalmente diferente!".
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
