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
  duration: z.string().describe("The desired duration of the video (e.g., '8 seg')."),
  videoType: z.enum(['shorts', 'watch']).describe("The type of video: 'shorts' for vertical, fast-paced videos, or 'watch' for standard horizontal videos."),
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
    prompt: `You are an expert in creating viral video scripts. Your task is to generate a script based on the provided details. The output MUST be in Brazilian Portuguese for all fields, except for the emotional cues in the dialogue which must be in English.

**CRITICAL INSTRUCTION: The total length of the resulting script (dialogue and actions) MUST be designed to perfectly fit a video with the exact duration specified: {{{duration}}}. Do not make it longer or shorter. You must pace all elements of the script to meet this time constraint.**

You are creating a script for a {{{videoType}}} video.

If you are creating a "shorts" video, it must be fast-paced, highly engaging, and designed for vertical viewing. It should follow this formula:
**MEGAVIRAL SHORTS FORMULA:**
1.  **Set up**: A one-liner that contains stakes (easy to understand). First ~15% of the duration.
2.  **Unexpected action (Hook)**: A quick, impactful moment.
3.  **Explanation of action / escalation**: The main body of the video. ~60% of the duration.
4.  **Climax / Twist / Punchline**: The payoff at the end. Last ~20% of the duration.
5.  **CTA**: A simple call to action at the very end of the dialogue.
The dialogue should be short and punchy.

If you are creating a "watch" video, it should be well-structured for longer-form content and horizontal viewing. It should follow this formula:
**STANDARD YOUTUBE VIDEO FORMULA:**
1.  **Hook (First 5-10 seconds)**: Grab the viewer's attention.
2.  **Introduction (10-30 seconds)**: Briefly introduce the topic.
3.  **Main Content**: The body of the video, paced for the duration.
4.  **Conclusion & CTA (Last 15-30 seconds)**: Summarize and provide a clear call to action.
The dialogue can be more detailed.

Please generate the script according to the format specified (shorts or watch) and the details below.

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
