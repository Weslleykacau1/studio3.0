'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating SEO content for video platforms based on a dialogue.
 *
 * It exports:
 * - `generateSeoForPlatforms` - An async function that takes `GenerateSeoInput` and returns `GenerateSeoOutput`.
 * - `GenerateSeoInput` - The input type for the function.
 * - `GenerateSeoOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSeoInputSchema = z.object({
  dialogue: z.string().describe('The dialogue from the video script.'),
});
export type GenerateSeoInput = z.infer<typeof GenerateSeoInputSchema>;

const GenerateSeoOutputSchema = z.string().describe('The generated SEO content in Markdown format.');
export type GenerateSeoOutput = z.infer<typeof GenerateSeoOutputSchema>;


export async function generateSeoForPlatforms(input: GenerateSeoInput): Promise<GenerateSeoOutput> {
  return generateSeoFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateSeoPrompt',
    input: {schema: GenerateSeoInputSchema},
    output: {format: 'text'}, // Output is a markdown string
    prompt: `Você é um especialista em SEO e marketing de mídia social para criadores de conteúdo. Com base no diálogo fornecido, gere sugestões otimizadas de SEO para as plataformas YouTube, TikTok e YouTube Shorts.

O resultado deve ser formatado em **Markdown**. Para cada plataforma, forneça um título, uma descrição (ou legenda) e hashtags/tags relevantes. **Todo o conteúdo deve ser em Português do Brasil.**

**Diálogo para Análise:**
"""
{{{dialogue}}}
"""

---

**Formato de Saída Esperado (exemplo):**

## 🚀 SEO para Plataformas

### YouTube
- **Título Sugerido:** [Crie um título "clickbait" mas relevante para o YouTube]
- **Descrição:** [Escreva uma descrição detalhada para o YouTube, incluindo um resumo do vídeo, CTAs e links relevantes (use placeholders como [LINK]).]
- **Tags:** [Liste de 10 a 15 tags relevantes, separadas por vírgulas.]

### TikTok
- **Legenda:** [Crie uma legenda curta e envolvente para o TikTok, incluindo uma pergunta para engajar.]
- **Hashtags:** [#hashtag1 #hashtag2 #hashtag3 #fyp #viral]

### YouTube Shorts
- **Título:** [Crie um título curto e direto para Shorts, idealmente com menos de 60 caracteres.]
- **Hashtags:** [#shorts #videocurto #hashtag1 #hashtag2]
`
});


const generateSeoFlow = ai.defineFlow(
  {
    name: 'generateSeoFlow',
    inputSchema: GenerateSeoInputSchema,
    outputSchema: GenerateSeoOutputSchema,
  },
  async (input) => {
    const {text} = await prompt(input);
    return text;
  }
);
