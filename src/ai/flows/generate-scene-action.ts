'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a scene action based on a setting.
 *
 * It exports:
 * - `generateSceneAction` - An async function that takes `GenerateSceneActionInput` and returns `GenerateSceneActionOutput`.
 * - `GenerateSceneActionInput` - The input type for the function.
 * - `GenerateSceneActionOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSceneActionInputSchema = z.object({
  sceneSetting: z.string().describe('The description of the scene setting.'),
});
export type GenerateSceneActionInput = z.infer<typeof GenerateSceneActionInputSchema>;

const GenerateSceneActionOutputSchema = z.object({
    sceneAction: z.string().describe('The suggested main action for the influencer in the scene, in Brazilian Portuguese.'),
});
export type GenerateSceneActionOutput = z.infer<typeof GenerateSceneActionOutputSchema>;


export async function generateSceneAction(input: GenerateSceneActionInput): Promise<GenerateSceneActionOutput> {
  return generateSceneActionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateSceneActionPrompt',
    input: {schema: GenerateSceneActionInputSchema},
    output: {schema: GenerateSceneActionOutputSchema},
    prompt: `Você é um roteirista criativo. Com base na seguinte descrição de cenário, sugira uma ação principal para o influenciador. A ação deve ser concisa, envolvente e adequada ao cenário. A resposta DEVE ser em Português do Brasil.

**Cenário:**
"""
{{{sceneSetting}}}
"""
`
});


const generateSceneActionFlow = ai.defineFlow(
  {
    name: 'generateSceneActionFlow',
    inputSchema: GenerateSceneActionInputSchema,
    outputSchema: GenerateSceneActionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
