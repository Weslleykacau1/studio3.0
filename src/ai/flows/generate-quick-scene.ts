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
  influencerAppearance: z.string().optional().describe("A detailed description of the influencer's appearance to maintain consistency."),
  negativePrompt: z.string().optional().describe("Things to avoid to maintain character consistency."),
  jokeTheme: z.string().describe('The theme for the joke or funny situation.'),
  scenarioSuggestion: z.string().optional().describe("The user's idea for the scene setting."),
  imageReferenceDataUri: z.string().optional().describe("An optional image reference for the scene background, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateQuickSceneInput = z.infer<typeof GenerateQuickSceneInputSchema>;

const GenerateQuickSceneOutputSchema = z.object({
    title: z.string().describe('The suggested title for the scene.'),
    setting: z.string().describe('A detailed description of the scene setting.'),
    action: z.string().describe('The main action occurring in the scene.'),
    dialogue: z.string().describe('The suggested dialogue for the scene, in Brazilian Portuguese with English emotional cues.'),
    markdownScript: z.string().describe('A formatted script in Markdown, including title, setting, action, and dialogue.'),
});
export type GenerateQuickSceneOutput = z.infer<typeof GenerateQuickSceneOutputSchema>;


export async function generateQuickScene(input: GenerateQuickSceneInput): Promise<GenerateQuickSceneOutput> {
  return generateQuickSceneFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateQuickScenePrompt',
    input: {schema: GenerateQuickSceneInputSchema},
    output: {schema: GenerateQuickSceneOutputSchema},
    prompt: `Você é um roteirista de comédia criativo. Com base na personalidade e no nicho do influenciador, e no tema fornecido, crie uma cena curta e engraçada. O diálogo resultante deve ser adequado para um vídeo com duração máxima de 8 segundos. O diálogo deve ser direto, sem que o influenciador precise se apresentar.

A resposta JSON DEVE conter 'title', 'setting', 'action', 'dialogue', e 'markdownScript'.
O campo 'markdownScript' deve ser uma string formatada em Markdown contendo o roteiro completo, com seções para Título, Cenário, Ação e Diálogo.

{{#if imageReferenceDataUri}}
Use a seguinte imagem como INSPIRAÇÃO VISUAL PRIMÁRIA para o cenário: {{media url=imageReferenceDataUri}}
{{else if scenarioSuggestion}}
Use a seguinte sugestão de texto como inspiração para o cenário: "{{{scenarioSuggestion}}}"
{{/if}}

O diálogo DEVE ser em **Português do Brasil**.
**Crucialmente, o diálogo deve incluir dicas de emoção em inglês (por exemplo, entre parênteses) e enfatizar palavras ou frases-chave para guiar a atuação.** Exemplo: "(chocado) Eu nunca esperei por isso!".

**Personalidade do Influenciador:**
"""
{{{influencerPersonality}}}
"""

**Nicho do Influenciador:**
"""
{{{influencerNiche}}}
"""

{{#if influencerAppearance}}
**Aparência do Influenciador (para manter consistência):**
"""
{{{influencerAppearance}}}
"""
{{/if}}

{{#if negativePrompt}}
**Evitar (Prompts Negativos para consistência):**
"""
{{{negativePrompt}}}
"""
{{/if}}

**Tema:**
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
