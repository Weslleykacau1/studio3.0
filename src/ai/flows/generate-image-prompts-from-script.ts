'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating image and video prompts from a user-provided script.
 *
 * It exports:
 * - `generatePromptsFromScript` - An async function that takes a script and returns an array of image and video prompts.
 * - `GeneratePromptsFromScriptInput` - The input type for the function.
 * - `GeneratePromptsFromScriptOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePromptsFromScriptInputSchema = z.object({
  scriptText: z.string().describe('The full text of the video script, with scenes clearly separated.'),
});
export type GeneratePromptsFromScriptInput = z.infer<typeof GeneratePromptsFromScriptInputSchema>;

const ScenePromptsSchema = z.object({
  sceneNumber: z.number().describe('The sequential number of the scene.'),
  imagePrompt: z.string().describe('A detailed, descriptive prompt in English for an AI image generator (like Midjourney) to create a static visual for this scene.'),
  videoPrompt: z.string().describe('A detailed, descriptive prompt in English for an AI video generator (like Veo) to create a dynamic video clip for this scene, focusing on action and camera movement.'),
});

const GeneratePromptsFromScriptOutputSchema = z.object({
  prompts: z.array(ScenePromptsSchema).describe('An array of generated prompts, one for each scene in the script.'),
});
export type GeneratePromptsFromScriptOutput = z.infer<typeof GeneratePromptsFromScriptOutputSchema>;


export async function generatePromptsFromScript(input: GeneratePromptsFromScriptInput): Promise<GeneratePromptsFromScriptOutput> {
  return generatePromptsFromScriptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generatePromptsFromScriptPrompt',
    input: {schema: GeneratePromptsFromScriptInputSchema},
    output: {schema: GeneratePromptsFromScriptOutputSchema},
    prompt: `You are an expert creative director. Your task is to read the provided video script, identify each scene, and for EVERY scene, generate TWO distinct prompts: one for image generation and one for video generation. The output MUST be a JSON object containing a 'prompts' array.

**CRITICAL INSTRUCTIONS:**
1.  **Identify Scenes:** Analyze the script and break it down into sequential scenes. The scenes might be indicated by "SCENE 1", "CENA 1", headings, or simple paragraph breaks.
2.  **Generate TWO Prompts per Scene:** For each scene, create two corresponding prompts in the JSON object:
    -   **imagePrompt**: A visually rich prompt for a static image generator (like Midjourney, DALL-E). Focus on style (e.g., 'cinematic', 'photorealistic'), lighting, composition, and key elements to create a compelling still image.
    -   **videoPrompt**: A descriptive prompt for a video generator (like Veo). Focus on **action, character movement, camera movement (e.g., 'slow pan', 'dolly zoom'), and the sequence of events** within the scene.
3.  **English Prompts:** All prompts MUST be in **English** for maximum compatibility with generation models.
4.  **Numbering:** Each object in the 'prompts' array must have a 'sceneNumber' that corresponds to its order in the script.

**Video Script to Analyze:**
"""
{{{scriptText}}}
"""

Generate a well-structured response following these instructions precisely.
`
});


const generatePromptsFromScriptFlow = ai.defineFlow(
  {
    name: 'generatePromptsFromScriptFlow',
    inputSchema: GeneratePromptsFromScriptInputSchema,
    outputSchema: GeneratePromptsFromScriptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('A geração de prompts de imagem não produziu um resultado.');
    }
    return output;
  }
);
