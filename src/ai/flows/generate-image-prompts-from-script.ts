'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating image prompts from a user-provided script.
 *
 * It exports:
 * - `generateImagePromptsFromScript` - An async function that takes a script and returns an array of image prompts.
 * - `GenerateImagePromptsFromScriptInput` - The input type for the function.
 * - `GenerateImagePromptsFromScriptOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImagePromptsFromScriptInputSchema = z.object({
  scriptText: z.string().describe('The full text of the video script, with scenes clearly separated.'),
});
export type GenerateImagePromptsFromScriptInput = z.infer<typeof GenerateImagePromptsFromScriptInputSchema>;

const ImagePromptSceneSchema = z.object({
  sceneNumber: z.number().describe('The sequential number of the scene.'),
  imagePrompt: z.string().describe('A detailed, descriptive prompt in English for an AI image generator to create the visual for this scene.'),
});

const GenerateImagePromptsFromScriptOutputSchema = z.object({
  prompts: z.array(ImagePromptSceneSchema).describe('An array of generated image prompts, one for each scene in the script.'),
});
export type GenerateImagePromptsFromScriptOutput = z.infer<typeof GenerateImagePromptsFromScriptOutputSchema>;


export async function generateImagePromptsFromScript(input: GenerateImagePromptsFromScriptInput): Promise<GenerateImagePromptsFromScriptOutput> {
  return generateImagePromptsFromScriptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateImagePromptsFromScriptPrompt',
    input: {schema: GenerateImagePromptsFromScriptInputSchema},
    output: {schema: GenerateImagePromptsFromScriptOutputSchema},
    prompt: `You are an expert creative director. Your task is to read the provided video script, identify each scene, and for every scene, generate a powerful and descriptive image prompt for an AI image generator (like Midjourney or DALL-E). The output MUST be a JSON object containing a 'prompts' array.

**CRITICAL INSTRUCTIONS:**
1.  **Identify Scenes:** Analyze the script and break it down into sequential scenes. The scenes might be indicated by "SCENE 1", "CENA 1", headings, or simple paragraph breaks.
2.  **Generate Image Prompts:** For each scene, create a corresponding image prompt.
3.  **English Prompts:** All image prompts MUST be in **English** for compatibility with image generation models.
4.  **Descriptive and Evocative:** The prompts should be visually rich and detailed. Specify style (e.g., 'cinematic', 'photorealistic', 'anime'), lighting (e.g., 'dramatic lighting', 'soft morning light'), composition, and key elements to create a compelling and professional image that matches the script's content for that scene.
5.  **Numbering:** Each object in the 'prompts' array must have a 'sceneNumber' that corresponds to its order in the script.

**Video Script to Analyze:**
"""
{{{scriptText}}}
"""

Generate a well-structured response following these instructions precisely.
`
});


const generateImagePromptsFromScriptFlow = ai.defineFlow(
  {
    name: 'generateImagePromptsFromScriptFlow',
    inputSchema: GenerateImagePromptsFromScriptInputSchema,
    outputSchema: GenerateImagePromptsFromScriptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('A geração de prompts de imagem não produziu um resultado.');
    }
    return output;
  }
);
