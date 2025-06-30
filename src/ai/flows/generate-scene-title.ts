'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a scene title.
 *
 * It exports:
 * - `generateSceneTitle` - An async function that takes `GenerateSceneTitleInput` and returns `GenerateSceneTitleOutput`.
 * - `GenerateSceneTitleInput` - The input type for the function.
 * - `GenerateSceneTitleOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSceneTitleInputSchema = z.object({
  sceneSetting: z.string().describe('The description of the scene setting.'),
  sceneAction: z.string().describe('The main action occurring in the scene.'),
});
export type GenerateSceneTitleInput = z.infer<typeof GenerateSceneTitleInputSchema>;

const GenerateSceneTitleOutputSchema = z.object({
    sceneTitle: z.string().describe('The suggested title for the scene, in Brazilian Portuguese.'),
});
export type GenerateSceneTitleOutput = z.infer<typeof GenerateSceneTitleOutputSchema>;


export async function generateSceneTitle(input: GenerateSceneTitleInput): Promise<GenerateSceneTitleOutput> {
  return generateSceneTitleFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateSceneTitlePrompt',
    input: {schema: GenerateSceneTitleInputSchema},
    output: {schema: GenerateSceneTitleOutputSchema},
    prompt: `Você é um roteirista e especialista em marketing de conteúdo. Com base na seguinte descrição de cenário e ação principal, crie um título curto, cativante e "clickbait" para uma cena de vídeo. O título DEVE ser em Português do Brasil.

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


const generateSceneTitleFlow = ai.defineFlow(
  {
    name: 'generateSceneTitleFlow',
    inputSchema: GenerateSceneTitleInputSchema,
    outputSchema: GenerateSceneTitleOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
