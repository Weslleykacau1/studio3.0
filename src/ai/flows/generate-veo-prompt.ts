'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a concise video prompt for Veo.
 *
 * It exports:
 * - `generateVeoPrompt` - An async function that takes `GenerateVeoPromptInput` and returns `GenerateVeoPromptOutput`.
 * - `GenerateVeoPromptInput` - The input type for the function.
 * - `GenerateVeoPromptOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVeoPromptInputSchema = z.object({
  influencerAppearance: z.string().describe('A detailed description of the influencer appearance, including clothing.').optional(),
  sceneSetting: z.string().describe('A detailed description of the scene setting.'),
  sceneAction: z.string().describe('The main action occurring in the scene.'),
  sceneDialogue: z.string().describe('The dialogue for the scene. This will be spoken by the character.'),
  sceneCameraAngle: z.string().describe('The camera angle for the scene.'),
  videoFormat: z.string().describe('The video format (e.g., 9:16).'),
});
export type GenerateVeoPromptInput = z.infer<typeof GenerateVeoPromptInputSchema>;

const GenerateVeoPromptOutputSchema = z.object({
    veoPrompt: z.string().describe('A single, concise, and descriptive prompt for a text-to-video model like Veo, formatted as a Markdown code block.'),
});
export type GenerateVeoPromptOutput = z.infer<typeof GenerateVeoPromptOutputSchema>;


export async function generateVeoPrompt(input: GenerateVeoPromptInput): Promise<GenerateVeoPromptOutput> {
  return generateVeoPromptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateVeoPrompt',
    input: {schema: GenerateVeoPromptInputSchema},
    output: {schema: GenerateVeoPromptOutputSchema},
    prompt: `You are an expert in creating prompts for generative video models like Veo. Your task is to synthesize the provided details into a single, effective, and concise prompt.

The prompt should be a descriptive paragraph. It must integrate the scene's setting, the main action, and camera instructions.
{{#if influencerAppearance}}
It must also integrate the character's appearance and clothing.
{{/if}}

Crucially, you must embed the dialogue directly into the prompt in a natural way, for example: "...the character says, '{{{sceneDialogue}}}'". Do not include emotional cues like (surprised) in the final dialogue. The entire prompt should be in English to be compatible with video models.
{{#if influencerAppearance}}

**Character Appearance:**
{{{influencerAppearance}}}
{{/if}}

**Scene Setting:**
{{{sceneSetting}}}

**Main Action:**
{{{sceneAction}}}

**Camera Angle/Style:**
{{{sceneCameraAngle}}}, format {{{videoFormat}}}

**Dialogue to include:**
"{{{sceneDialogue}}}"

Generate a single paragraph prompt that combines all these elements fluidly. The final output for the 'veoPrompt' field MUST be a Markdown code block containing only the generated prompt text.
`
});


const generateVeoPromptFlow = ai.defineFlow(
  {
    name: 'generateVeoPromptFlow',
    inputSchema: GenerateVeoPromptInputSchema,
    outputSchema: GenerateVeoPromptOutputSchema,
  },
  async (input) => {
    // The dialogue often contains emotional cues like "(surprised)". Let's remove them for Veo.
    const cleanDialogue = input.sceneDialogue.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    
    const processedInput = {
        ...input,
        sceneDialogue: cleanDialogue,
    };

    const {output} = await prompt(processedInput);
    return output!;
  }
);
