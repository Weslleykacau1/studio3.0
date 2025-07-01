'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating scene dialogue.
 *
 * It exports:
 * - `generateSceneDialogue` - An async function that takes `GenerateSceneDialogueInput` and returns `GenerateSceneDialogueOutput`.
 * - `GenerateSceneDialogueInput` - The input type for the function.
 * - `GenerateSceneDialogueOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSceneDialogueInputSchema = z.object({
  influencerPersonality: z.string().describe("The personality traits of the influencer."),
  influencerAccent: z.string().describe('The accent of the influencer in Portuguese.'),
  sceneSetting: z.string().describe('The description of the scene setting.'),
  sceneAction: z.string().describe('The main action occurring in the scene.'),
});
export type GenerateSceneDialogueInput = z.infer<typeof GenerateSceneDialogueInputSchema>;

const GenerateSceneDialogueOutputSchema = z.object({
    dialogue: z.string().describe('The suggested dialogue for the scene, in Brazilian Portuguese with English emotional cues.'),
});
export type GenerateSceneDialogueOutput = z.infer<typeof GenerateSceneDialogueOutputSchema>;


export async function generateSceneDialogue(input: GenerateSceneDialogueInput): Promise<GenerateSceneDialogueOutput> {
  return generateSceneDialogueFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateSceneDialoguePrompt',
    input: {schema: GenerateSceneDialogueInputSchema},
    output: {schema: GenerateSceneDialogueOutputSchema},
    prompt: `Você é um roteirista criativo. Com base na personalidade do influenciador, no cenário e na ação da cena, crie um diálogo curto e envolvente.

O diálogo DEVE ser em **Português do Brasil**, correspondendo ao sotaque do influenciador: {{{influencerAccent}}}.
**Crucialmente, o diálogo deve incluir dicas de emoção em inglês (por exemplo, entre parênteses) e enfatizar palavras ou frases-chave para guiar a atuação do influenciador.** Por exemplo: "(surpreso) Uau, eu *não* acredito nisso!".

**Personalidade do Influenciador:**
"""
{{{influencerPersonality}}}
"""

**Cenário:**
"""
{{{sceneSetting}}}
"""

**Ação Principal:**
"""
{{{sceneAction}}}
"""
`
});


const generateSceneDialogueFlow = ai.defineFlow(
  {
    name: 'generateSceneDialogueFlow',
    inputSchema: GenerateSceneDialogueInputSchema,
    outputSchema: GenerateSceneDialogueOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
