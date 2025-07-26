'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a web documentary script.
 *
 * It exports:
 * - `generateWebDocScript` - An async function that takes a theme and returns a structured script with image prompts.
 * - `GenerateWebDocScriptInput` - The input type for the function.
 * - `GenerateWebDocScriptOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWebDocScriptInputSchema = z.object({
  videoTheme: z.string().describe("The theme for the web documentary."),
  imageDataUri: z
    .string()
    .describe(
      "An optional image for visual inspiration, as a data URI."
    ).optional(),
});
export type GenerateWebDocScriptInput = z.infer<typeof GenerateWebDocScriptInputSchema>;

const WebDocSceneSchema = z.object({
    sceneNumber: z.number().describe('The sequential number of the scene.'),
    sceneScript: z.string().describe('The narration or script for this scene, in Brazilian Portuguese.'),
    imagePrompt: z.string().describe('A detailed prompt in English for an image generation model, describing the visual for this scene.'),
});

const GenerateWebDocScriptOutputSchema = z.object({
    title: z.string().describe('An engaging title for the web documentary in Brazilian Portuguese.'),
    scenes: z.array(WebDocSceneSchema).describe('An array of structured scenes that make up the full script.'),
});
export type GenerateWebDocScriptOutput = z.infer<typeof GenerateWebDocScriptOutputSchema>;


export async function generateWebDocScript(input: GenerateWebDocScriptInput): Promise<GenerateWebDocScriptOutput> {
  return generateWebDocScriptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateWebDocScriptPrompt',
    input: {schema: GenerateWebDocScriptInputSchema},
    output: {schema: GenerateWebDocScriptOutputSchema},
    prompt: `You are an expert documentary producer and screenwriter. Your task is to generate a complete web documentary script based on the provided theme. The output MUST be a JSON object containing a 'title' and an array of 'scenes'.

For EACH scene in the 'scenes' array, you MUST generate:
1.  'sceneNumber': The sequential number of the scene.
2.  'sceneScript': The narration script for that scene. This MUST be in **Brazilian Portuguese**.
3.  'imagePrompt': A detailed, evocative, and specific prompt for an AI image generation model (like Midjourney or DALL-E) to create the visual for that scene. This prompt MUST be in **English** and should describe a visually stunning, high-quality image that matches the script's content.

**Web Documentary Formula:**
1.  **Hook (First 1-2 scenes)**: Start with a powerful statement or question to grab the viewer's attention.
2.  **Introduction (Next 2-3 scenes)**: Introduce the theme and the central question of the documentary.
3.  **Main Content (Body)**: Develop the story with facts, examples, and narrative progression. Each scene should build upon the last.
4.  **Conclusion (Last 2 scenes)**: Summarize the key points and end with a thought-provoking conclusion or a call to reflection.

Please generate the script according to this formula.

**Web Documentary Theme:**
"""
{{{videoTheme}}}
"""
{{#if imageDataUri}}
**Visual Inspiration (use this image as the main visual style reference for all image prompts):**
{{media url=imageDataUri}}
{{/if}}
`
});


const generateWebDocScriptFlow = ai.defineFlow(
  {
    name: 'generateWebDocScriptFlow',
    inputSchema: GenerateWebDocScriptInputSchema,
    outputSchema: GenerateWebDocScriptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
