'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a viral video script.
 *
 * It exports:
 * - `generateViralScript` - An async function that takes `GenerateViralScriptInput` and returns `GenerateViralScriptOutput`.
 * - `GenerateViralScriptInput` - The input type for the function.
 * - `GenerateViralScriptOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateViralScriptInputSchema = z.object({
  videoTitle: z.string().describe("The catchy, viral title for the video."),
  imageDataUri: z
    .string()
    .describe(
      "The base image for the thumbnail, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateViralScriptInput = z.infer<typeof GenerateViralScriptInputSchema>;

const GenerateViralScriptOutputSchema = z.object({
    title: z.string().describe('The final title for the viral video scene.'),
    setting: z.string().describe('A detailed description of the scene setting, inspired by the image and title.'),
    action: z.string().describe('The main, fast-paced, and engaging action occurring in the scene.'),
    dialogue: z.string().describe('A short, punchy dialogue for the scene, in Brazilian Portuguese with English emotional cues. It should be memorable and fit within a few seconds, including a CTA.'),
});
export type GenerateViralScriptOutput = z.infer<typeof GenerateViralScriptOutputSchema>;


export async function generateViralScript(input: GenerateViralScriptInput): Promise<GenerateViralScriptOutput> {
  return generateViralScriptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateViralScriptPrompt',
    input: {schema: GenerateViralScriptInputSchema},
    output: {schema: GenerateViralScriptOutputSchema},
    prompt: `You are an expert in creating "mega viral" video scripts for platforms like TikTok and YouTube Shorts. Your goal is to create a script for a video that is fast-paced, highly engaging, and has a high potential to go viral. The script should be for a video of around 8 seconds.

Based on the provided viral video title and the visual inspiration from the image, create a complete scene.

The output MUST be in Brazilian Portuguese for all fields, except for the emotional cues in the dialogue which must be in English.

**MEGAVIRAL SHORTS FORMULA:**
Your generated scene must follow this structure:
1.  **Set up**: A one-liner that contains stakes (easy to understand).
2.  **Unexpected action (Hook)**: The hook of the video, happening in the first 2 seconds.
3.  **Explanation of action / escalation**: What happens next, building suspense or humor.
4.  **Climax / Twist / Punchline**: The surprising, funny, or satisfying payoff at the end.
5.  **CTA**: A simple call to action at the very end.

Combine the setup, hook, escalation, and punchline into the 'action' and 'dialogue' fields. The dialogue should be extremely short, punchy, and memorable, starting directly without introductions. Include emotional cues in English, like (surprised) or (excited). Include the CTA at the end of the dialogue.

**Video Title:**
"""
{{{videoTitle}}}
"""

**Visual Inspiration (use this image to define the setting and character style):**
{{media url=imageDataUri}}
`
});


const generateViralScriptFlow = ai.defineFlow(
  {
    name: 'generateViralScriptFlow',
    inputSchema: GenerateViralScriptInputSchema,
    outputSchema: GenerateViralScriptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
