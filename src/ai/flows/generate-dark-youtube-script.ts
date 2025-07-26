'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a dark-themed YouTube video script.
 *
 * It exports:
 * - `generateDarkYouTubeScript` - An async function that takes a theme and returns a full script.
 * - `GenerateDarkYouTubeScriptInput` - The input type for the function.
 * - `GenerateDarkYouTubeScriptOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDarkYouTubeScriptInputSchema = z.object({
  videoTheme: z.string().describe("The dark or mysterious theme for the YouTube video."),
  imageDataUri: z
    .string()
    .describe(
      "An optional image for visual inspiration, as a data URI."
    ).optional(),
});
export type GenerateDarkYouTubeScriptInput = z.infer<typeof GenerateDarkYouTubeScriptInputSchema>;

const GenerateDarkYouTubeScriptOutputSchema = z.object({
    title: z.string().describe('A mysterious or intriguing title for the video.'),
    setting: z.string().describe('A detailed description of the dark or atmospheric scene setting.'),
    action: z.string().describe('The main action, focusing on suspense or mystery.'),
    dialogue: z.string().describe('The dialogue for the scene, with a serious, mysterious, or suspenseful tone. Must be in Brazilian Portuguese with English emotional cues.'),
    markdownScript: z.string().describe('A formatted script in Markdown, including title, setting, action, and dialogue.'),
});
export type GenerateDarkYouTubeScriptOutput = z.infer<typeof GenerateDarkYouTubeScriptOutputSchema>;


export async function generateDarkYouTubeScript(input: GenerateDarkYouTubeScriptInput): Promise<GenerateDarkYouTubeScriptOutput> {
  return generateDarkYouTubeScriptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateDarkYouTubeScriptPrompt',
    input: {schema: GenerateDarkYouTubeScriptInputSchema},
    output: {schema: GenerateDarkYouTubeScriptOutputSchema},
    prompt: `You are an expert screenwriter specializing in dark, mysterious, and suspenseful content for YouTube. Your task is to generate a complete script based on the provided theme. The output MUST be a JSON object containing 'title', 'setting', 'action', 'dialogue', and 'markdownScript'.
    
The 'markdownScript' field must be a Markdown formatted string containing the full script.
All text values MUST be in Brazilian Portuguese, except for emotional cues in the dialogue which must be in English.

**CRITICAL INSTRUCTION: The script must have a dark, serious, and mysterious tone. Focus on creating suspense and atmosphere. Avoid humor and light-hearted elements. The video should be structured for a standard YouTube 'watch' format (16:9), with a duration of around 40 seconds.**

**YouTube Video Formula (Dark Theme):**
1.  **Hook (First 5-10 seconds)**: Start with a mysterious question or a suspenseful statement.
2.  **Introduction (10-30 seconds)**: Briefly introduce the dark theme or mystery.
3.  **Main Content**: Develop the suspense, reveal clues, or build the narrative.
4.  **Conclusion & CTA (Last 15-30 seconds)**: End with a cliffhanger or a thought-provoking question, and a call to action like "Subscreva para desvendar o mistério".

Please generate the script according to this dark formula and the details below.

**Video Theme:**
"""
{{{videoTheme}}}
"""
{{#if imageDataUri}}
**Visual Inspiration (use this image to define the setting and character style):**
{{media url=imageDataUri}}
{{/if}}
`
});


const generateDarkYouTubeScriptFlow = ai.defineFlow(
  {
    name: 'generateDarkYouTubeScriptFlow',
    inputSchema: GenerateDarkYouTubeScriptInputSchema,
    outputSchema: GenerateDarkYouTubeScriptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
