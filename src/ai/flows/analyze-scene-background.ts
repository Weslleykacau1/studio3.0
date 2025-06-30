'use server';

/**
 * @fileOverview Analyzes a scene background image and proposes video settings, moods, and backgrounds.
 *
 * - analyzeSceneBackground - A function that handles the scene background analysis process.
 * - AnalyzeSceneBackgroundInput - The input type for the analyzeSceneBackground function.
 * - AnalyzeSceneBackgroundOutput - The return type for the analyzeSceneBackground function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSceneBackgroundInputSchema = z.object({
  scenarioImageBase64: z
    .string()
    .describe(
      "A photo of a scenario background, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  scenarioImageType: z.string().describe('The MIME type of the scenario image.'),
});
export type AnalyzeSceneBackgroundInput = z.infer<typeof AnalyzeSceneBackgroundInputSchema>;

const AnalyzeSceneBackgroundOutputSchema = z.object({
  settingDescription: z.string().describe('A detailed description of the scene setting in Brazilian Portuguese.'),
});
export type AnalyzeSceneBackgroundOutput = z.infer<typeof AnalyzeSceneBackgroundOutputSchema>;

export async function analyzeSceneBackground(
  input: AnalyzeSceneBackgroundInput
): Promise<AnalyzeSceneBackgroundOutput> {
  return analyzeSceneBackgroundFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSceneBackgroundPrompt',
  input: {schema: AnalyzeSceneBackgroundInputSchema},
  output: {schema: AnalyzeSceneBackgroundOutputSchema},
  prompt: `Analyze the provided background image: {{media url=scenarioImageBase64}}.

Describe the environment, lighting, main objects, and visual style.
Be descriptive and evocative.

The response MUST be in **Brazilian Portuguese** to be used in a script.`,
});

const analyzeSceneBackgroundFlow = ai.defineFlow(
  {
    name: 'analyzeSceneBackgroundFlow',
    inputSchema: AnalyzeSceneBackgroundInputSchema,
    outputSchema: AnalyzeSceneBackgroundOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {settingDescription: output!.settingDescription};
  }
);
