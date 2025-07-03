'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a quick, funny scene.
 *
 * It exports:
 * - `generateQuickScene` - An async function that takes `GenerateQuickSceneInput` and returns `GenerateQuickSceneOutput`.
 * - `GenerateQuickSceneInput` - The input type for the function.
 * - `GenerateQuickSceneOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuickSceneInputSchema = z.object({
  influencerPersonality: z.string().describe("The personality traits of the influencer."),
  influencerNiche: z.string().describe("The influencer's content niche."),
  jokeTheme: z.string().describe('The theme for the joke or funny situation.'),
  scenarioSuggestion: z.string().optional().describe("The user's idea for the scene setting."),
});
export type GenerateQuickSceneInput = z.infer<typeof GenerateQuickSceneInputSchema>;

const GenerateQuickSceneOutputSchema = z.object({
    title: z.string().describe('The suggested title for the scene.'),
    setting: z.string().describe('A detailed description of the scene setting.'),
    action: z.string().describe('The main action occurring in the scene.'),
    dialogue: z.string().describe('The suggested dialogue for the scene, in Brazilian Portuguese with English emotional cues.'),
});
export type GenerateQuickSceneOutput = z.infer<typeof GenerateQuickSceneOutputSchema>;


export async function generateQuickScene(input: GenerateQuickSceneInput): Promise<GenerateQuickSceneOutput> {
  return generateQuickSceneFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateQuickScenePrompt',
    input: {schema: GenerateQuickSceneInputSchema},
    output: {schema: GenerateQuickSceneOutputSchema},
    prompt: `Você é um roteirista de comédia criativo. Com base na personalidade e no nicho do influenciador, e no tema da piada fornecido, crie uma cena curta e engraçada. O diálogo resultante deve ser adequado para um vídeo com duração máxima de 8 segundos. O diálogo deve ser direto, sem que o influenciador precise se apresentar.

A cena DEVE incluir um título, uma descrição do cenário, a ação principal e um diálogo curto.
{{#if scenarioSuggestion}}
Use a seguinte sugestão como inspiração para o cenário: "{{{scenarioSuggestion}}}"
{{/if}}

O diálogo DEVE ser em **Português do Brasil**.
**Crucialmente, o diálogo deve incluir dicas de emoção em inglês (por exemplo, entre parênteses) e enfatizar palavras ou frases-chave para guiar a atuação.** Exemplo: "(chocado) Eu *nunca* esperei por isso!".

**Personalidade do Influenciador:**
"""
{{{influencerPersonality}}}
"""

**Nicho do Influenciador:**
"""
{{{influencerNiche}}}
"""

**Tema da Piada:**
"""
{{{jokeTheme}}}
"""
`
});


const generateQuickSceneFlow = ai.defineFlow(
  {
    name: 'generateQuickSceneFlow',
    inputSchema: GenerateQuickSceneInputSchema,
    outputSchema: GenerateQuickSceneOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
