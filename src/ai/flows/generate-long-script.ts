'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a long-form YouTube video script.
 *
 * It exports:
 * - `generateLongScript` - An async function that takes a theme, duration, and optional context, and returns a structured script.
 * - `GenerateLongScriptInput` - The input type for the function.
 * - `GenerateLongScriptOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLongScriptInputSchema = z.object({
  videoTheme: z.string().describe("The main theme or topic for the long-form YouTube video."),
  duration: z.string().describe("The target duration for the video (e.g., '10 minutes', '20 minutes')."),
  influencerAppearance: z.string().describe("An optional description of the influencer's appearance for context.").optional(),
  influencerAccent: z.string().describe("The influencer's accent in Portuguese.").optional(),
  sceneSetting: z.string().describe("An optional description of the primary scene setting for context.").optional(),
});
export type GenerateLongScriptInput = z.infer<typeof GenerateLongScriptInputSchema>;

const LongScriptSceneSchema = z.object({
    title: z.string().describe('The title of this specific scene (e.g., "Introduction", "The First Discovery").'),
    content: z.string().describe('The detailed content of the scene, including actions, dialogue (with emotional cues), and visual descriptions, formatted in Markdown.'),
});

const GenerateLongScriptOutputSchema = z.object({
    scenes: z.array(LongScriptSceneSchema).describe('An array of structured scenes that make up the full script.'),
    fullScriptTxt: z.string().describe('The full, concatenated script as a single string, formatted for easy reading and TXT export.'),
});
export type GenerateLongScriptOutput = z.infer<typeof GenerateLongScriptOutputSchema>;


export async function generateLongScript(input: GenerateLongScriptInput): Promise<GenerateLongScriptOutput> {
  return generateLongScriptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateLongScriptPrompt',
    input: {schema: GenerateLongScriptInputSchema},
    output: {schema: GenerateLongScriptOutputSchema},
    prompt: `You are an expert screenwriter for long-form YouTube content. Your task is to create a complete, engaging video script based on the provided theme and duration. The output MUST be a JSON object containing 'scenes' and 'fullScriptTxt'.

**CRITICAL INSTRUCTIONS:**
1.  **Structure and Pacing:** The script must be broken down into multiple short scenes. **Each scene must be designed to last approximately 8 seconds.** The total number of scenes should be appropriate to fill the total target video duration of {{{duration}}}.
2.  **Scene Content:** Each scene in the 'scenes' array must have a 'title' and 'content'. The 'content' for each scene must be written in Markdown format. It must include detailed descriptions of actions, visuals, and dialogue.
3.  **Language Requirements:**
    - The character's description and the scene's setting description MUST be in **English**.
    - The dialogue MUST be in **Brazilian Portuguese** and include English emotional cues in parentheses (e.g., (curioso)).
{{#if influencerAccent}}
The dialogue must also match the influencer's accent: **{{{influencerAccent}}}**.
{{/if}}
4.  **Character and Scene Prompts:** For EACH scene, the 'content' field must also explicitly contain:
    - The full character appearance description in **English** to maintain video consistency.
    - A description of the scene's specific setting in **English**.
5. **Character Consistency**: The character's core attributes, such as **age and clothing**, MUST remain consistent across all scenes to ensure visual continuity, unless a change is a key plot point.
6.  **Full Script:** The 'fullScriptTxt' field must be a single string containing the entire script, with scene titles clearly marking each section, suitable for exporting to a .txt file.

**Video Details:**
- **Theme:** {{{videoTheme}}}
- **Total Target Duration:** {{{duration}}}

{{#if influencerAppearance}}
- **Influencer Context:** The main character should match this description (this part must be in English in the final output): "{{{influencerAppearance}}}"
{{/if}}

{{#if sceneSetting}}
- **Scene Context:** The main setting for the video should be inspired by this: "{{{sceneSetting}}}"
{{/if}}

Please generate a high-quality, well-structured script following these instructions.
`
});


const generateLongScriptFlow = ai.defineFlow(
  {
    name: 'generateLongScriptFlow',
    inputSchema: GenerateLongScriptInputSchema,
    outputSchema: GenerateLongScriptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('A geração do roteiro longo não produziu um resultado.');
    }
    return output;
  }
);
