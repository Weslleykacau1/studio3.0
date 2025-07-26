'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a web documentary script.
 *
 * It exports:
 * - `generateWebDocScript` - An async function that takes a theme and duration, and returns a structured script.
 * - `GenerateWebDocScriptInput` - The input type for the function.
 * - `GenerateWebDocScriptOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWebDocScriptInputSchema = z.object({
  theme: z.string().describe('The main theme or topic for the web documentary.'),
  duration: z.string().describe("The target duration for the video (e.g., '5 minutes', '10 minutes')."),
});
export type GenerateWebDocScriptInput = z.infer<typeof GenerateWebDocScriptInputSchema>;

const WebDocSceneSchema = z.object({
  sceneNumber: z.number().describe('The sequential number of the scene.'),
  sceneScript: z.string().describe('The narration or script for this scene, in Brazilian Portuguese.'),
  imagePrompt: z.string().describe('A detailed, descriptive prompt in English for an AI image generator to create the visual for this scene.'),
});

const GenerateWebDocScriptOutputSchema = z.object({
  title: z.string().describe('A compelling title for the web documentary, in Brazilian Portuguese.'),
  scenes: z.array(WebDocSceneSchema).describe('An array of structured scenes that make up the full documentary.'),
});
export type GenerateWebDocScriptOutput = z.infer<typeof GenerateWebDocScriptOutputSchema>;


export async function generateWebDocScript(input: GenerateWebDocScriptInput): Promise<GenerateWebDocScriptOutput> {
  return generateWebDocScriptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateWebDocScriptPrompt',
    input: {schema: GenerateWebDocScriptInputSchema},
    output: {schema: GenerateWebDocScriptOutputSchema},
    prompt: `You are an expert documentary screenwriter and a creative director. Your task is to create a script for a web documentary based on the theme and duration provided. The output MUST be a JSON object containing a 'title' and an array of 'scenes'.

**CRITICAL INSTRUCTIONS:**
1.  **Structure and Pacing:** Break down the documentary into a series of short, numbered scenes. The number of scenes should be appropriate for the total target duration of {{{duration}}}.
2.  **Dual Output for Each Scene:** For each scene in the 'scenes' array, you MUST generate two distinct pieces of content:
    -   **sceneScript:** This is the narrator's script for the scene. It MUST be written in engaging, clear **Brazilian Portuguese**.
    -   **imagePrompt:** This is a detailed, visually rich prompt for an AI image generator (like Midjourney or DALL-E). It MUST be written in **English**. This prompt should describe the visual that accompanies the narration of that specific scene. The prompt should be descriptive, specifying style, lighting, composition, and key elements to create a compelling and professional image.
3.  **Content Cohesion:** The 'imagePrompt' must directly and creatively correspond to the content of the 'sceneScript' for that same scene, creating a cohesive audio-visual experience.
4.  **Title:** Generate a captivating and relevant title for the documentary in **Brazilian Portuguese**.

**Documentary Details:**
- **Theme:** {{{theme}}}
- **Total Target Duration:** {{{duration}}}

Generate a high-quality, well-structured web documentary script following these instructions precisely.
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
    if (!output) {
      throw new Error('A geração do roteiro para Web Doc não produziu um resultado.');
    }
    return output;
  }
);
